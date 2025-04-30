import { AppointmentData, ProgressData, UserProfile, UserStats } from '@/types/user';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where
} from 'firebase/firestore';
import { db } from '../firebase';

const retry = async (fn: Function, retries = 3, delay = 1000) => {
  try {
    return await fn();
  } catch (error: any) {
    if (retries <= 0) {
      throw error;
    }
    
    if (error.code === 'permission-denied') {
      console.warn(`İzin hatası oluştu, ${delay}ms sonra yeniden deneniyor. Kalan denemeler: ${retries}`);
    } else {
      console.warn(`Hata oluştu, ${delay}ms sonra yeniden deneniyor. Kalan denemeler: ${retries}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, delay));
    return retry(fn, retries - 1, delay * 2);
  }
};

interface PositionData {
  x: number;
  y: number;
  z: number;
}

const firestoreService = {
  createUserProfile: async (uid: string, userData: UserProfile): Promise<void> => {
    try {
      await retry(async () => {
        const userRef = doc(db, 'users', uid);
        await setDoc(userRef, {
          ...userData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      });
      
      await retry(async () => {
        const statsRef = doc(db, 'stats', uid);
        await setDoc(statsRef, {
          sessionsCount: 0,
          totalCollectedApples: 0,
          maxLevel: 1,
          updatedAt: new Date().toISOString()
        });
      });
      
      await retry(async () => {
        const progressRef = doc(db, 'progress', uid);
        await setDoc(progressRef, {
          data: [],
          updatedAt: new Date().toISOString()
        });
      });
      
    } catch (error) {
      console.error('Kullanıcı profili oluşturma hatası:', error);
      
      if ((error as any).code === 'permission-denied') {
        console.error('İzin hatası: Firebase güvenlik kurallarını kontrol edin ve Firestore izinlerini yapılandırın.');
      }
      
      throw error;
    }
  },
  
  updateUserProfile: async (uid: string, userData: Partial<UserProfile>): Promise<void> => {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        ...userData,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Kullanıcı profili güncelleme hatası:', error);
      throw error;
    }
  },
  
  updateUserStats: async (uid: string, statsData: Partial<UserStats>): Promise<void> => {
    try {
      const statsRef = doc(db, 'stats', uid);
      await updateDoc(statsRef, {
        ...statsData,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Kullanıcı istatistikleri güncelleme hatası:', error);
      throw error;
    }
  },
  
  getUserProfile: async (uid: string): Promise<UserProfile | null> => {
    try {
      const userRef = doc(db, 'users', uid);
      const docSnap = await getDoc(userRef);
      
      if (docSnap.exists()) {
        return docSnap.data() as UserProfile;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Kullanıcı profili alma hatası:', error);
      throw error;
    }
  },
  
  getUserStats: async (userId: string) => {
    try {
      const statsRef = doc(db, 'stats', userId);
      const statsDoc = await getDoc(statsRef);
      
      if (statsDoc.exists()) {
        const data = statsDoc.data();
        return {
          maxLevel: data.maxLevel || 1,
          totalCollectedApples: data.totalCollectedApples || 0,
          progressPercentage: data.progressPercentage || 0,
          sessionsCount: data.sessionsCount || 0,
        };
      }
      
      return null;
    } catch (error) {
      console.error('Kullanıcı istatistikleri alınırken hata:', error);
      throw error;
    }
  },
  
  getUserProgress: async (uid: string): Promise<ProgressData | null> => {
    try {
      const progressRef = doc(db, 'progress', uid);
      const docSnap = await getDoc(progressRef);
      
      if (docSnap.exists()) {
        return docSnap.data() as ProgressData;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Kullanıcı ilerleme verileri alma hatası:', error);
      throw error;
    }
  },
  
  subscribeToUserStats: (uid: string, callback: (data: UserStats) => void) => {
    const statsRef = doc(db, 'stats', uid);
    return onSnapshot(statsRef, (doc) => {
      if (doc.exists()) {
        callback(doc.data() as UserStats);
      }
    });
  },
  
  subscribeToUserProgress: (uid: string, callback: (data: ProgressData) => void) => {
    const progressRef = doc(db, 'progress', uid);
    return onSnapshot(progressRef, (doc) => {
      if (doc.exists()) {
        callback(doc.data() as ProgressData);
      }
    });
  },
  
  addProgressDataPoint: async (uid: string, dataPoint: { date: string, progress: number, painLevel: number }): Promise<void> => {
    try {
      const progressRef = doc(db, 'progress', uid);
      const docSnap = await getDoc(progressRef);
      
      if (docSnap.exists()) {
        const currentData = docSnap.data() as ProgressData;
        const updatedData = [...(currentData.data || []), dataPoint];
        
        await updateDoc(progressRef, {
          data: updatedData,
          updatedAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('İlerleme verisi ekleme hatası:', error);
      throw error;
    }
  },

  startAppointment: async (appointmentId: string, level: number, collectedApples: number = 0) => {
    try {
      const appointmentRef = doc(db, 'appointments', appointmentId);
      
      await updateDoc(appointmentRef, {
        status: 'accepted',
        currentLevel: level,
        collectedApples: collectedApples, 
        updatedAt: serverTimestamp()
      });
      
      return true;
    } catch (error: any) {
      console.error('Randevu başlatma hatası:', error);
      throw error;
    }
  },

  updateUserStatsOnCompletion: async (userId: string, level: number, collectedApples: number) => {
    try {
      const statsRef = doc(db, 'stats', userId);
      
      const statsDoc = await getDoc(statsRef);
      
      if (statsDoc.exists()) {
        const statsData = statsDoc.data();
        
        const currentMaxLevel = statsData.maxLevel || 1;
        const currentTotalApples = statsData.totalCollectedApples || 0;
        const currentSessionsCount = statsData.sessionsCount || 0;
        
        const newMaxLevel = Math.max(currentMaxLevel, level);
        const newTotalApples = currentTotalApples + collectedApples;
        const newSessionsCount = currentSessionsCount + 1;
        
        await updateDoc(statsRef, {
          maxLevel: newMaxLevel,
          totalCollectedApples: newTotalApples,
          sessionsCount: newSessionsCount,
          updatedAt: serverTimestamp()
        });
        
      } else {
        await setDoc(statsRef, {
          maxLevel: level,
          totalCollectedApples: collectedApples,
          sessionsCount: 1, 
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        
      }
      
      return true;
    } catch (error: any) {
      console.error('Stats güncelleme hatası:', error);
      throw error;
    }
  },

  createAppointment: async (appointmentData: Omit<AppointmentData, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const appointmentsRef = collection(db, 'appointments');
      
      const appointmentWithData = {
        ...appointmentData,
        currentLevel: 1,
        collectedApples: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(appointmentsRef, appointmentWithData);
      
      return docRef.id;
    } catch (error) {
      console.error('Randevu oluşturma hatası:', error);
      throw error;
    }
  },
  
  updateAppointmentStatus: async (appointmentId: string, status: 'pending' | 'accepted' | 'completed' | 'cancelled'): Promise<void> => {
    try {
      const appointmentRef = doc(db, 'appointments', appointmentId);
      await updateDoc(appointmentRef, {
        status,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Randevu durumu güncelleme hatası:', error);
      throw error;
    }
  },
  
  deleteAppointment: async (appointmentId: string): Promise<void> => {
    try {
      const appointmentRef = doc(db, 'appointments', appointmentId);
      await deleteDoc(appointmentRef);
    } catch (error) {
      console.error('Randevu silme hatası:', error);
      throw error;
    }
  },
  
  deleteAllCaregiverAppointments: async (caregiverId: string): Promise<void> => {
    try {
      // Önce kullanıcının tüm randevularını alıyoruz
      const appointmentsRef = collection(db, 'appointments');
      const q = query(
        appointmentsRef,
        where('caregiverId', '==', caregiverId)
      );
      
      const querySnapshot = await getDocs(q);
      
      // Her randevuyu tek tek siliyoruz
      const deletePromises = querySnapshot.docs.map(async (doc) => {
        await deleteDoc(doc.ref);
      });
      
      // Tüm silme işlemlerinin tamamlanmasını bekliyoruz
      await Promise.all(deletePromises);
      
      return;
    } catch (error) {
      console.error('Tüm randevuları silme hatası:', error);
      throw error;
    }
  },
  
  createCaregiverPatientRelation: async (caregiverId: string, patientId: string): Promise<string> => {
    try {
      
      const collectionName = 'caregiverPatientRelations'; 
      
      try {
        const testColRef = collection(db, collectionName);
        const testQuerySnapshot = await getDocs(query(testColRef, limit(1)));
      } catch (testErr) {
        console.error(`Firestore bağlantı testi başarısız: ${testErr}`);
      }
      
      const timestamp = new Date().getTime();
      const relationId = `rel_${timestamp}_${caregiverId.substring(0, 4)}_${patientId.substring(0, 4)}`;
      
      
      const relationData = {
        caregiverId: caregiverId,
        patientId: patientId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active'
      };
      
      
      const relationsCollectionRef = collection(db, collectionName);
      const docRef = await addDoc(relationsCollectionRef, relationData);
      
      
      return docRef.id;
    } catch (error: any) {
      console.error('Kullanıcı-hasta ilişkisi oluşturma hatası:', error);
      
      if (error.code === 'permission-denied') {
        console.error('Firestore İzin Hatası: Güvenlik kurallarını kontrol edin.');
      } else if (error.code === 'not-found') {
        console.error('Koleksiyon veya belge bulunamadı.');
      }
      
      throw error;
    }
  },
  
  deleteCaregiverPatientRelation: async (relationId: string): Promise<void> => {
    try {
      const relationRef = doc(db, 'caregiverPatientRelations', relationId);
      
      await deleteDoc(relationRef);
    } catch (error) {
      console.error('Kullanıcı-hasta ilişkisi silme hatası:', error);
      throw error;
    }
  },

  getCaregiverAppointments: async (caregiverId: string): Promise<AppointmentData[]> => {
    try {
      const appointmentsRef = collection(db, 'appointments');
      const q = query(
        appointmentsRef,
        where('caregiverId', '==', caregiverId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const appointments: AppointmentData[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        appointments.push({
          id: doc.id,
          ...data,
          date: data.date instanceof Timestamp ? data.date.toDate().toISOString() : data.date
        } as AppointmentData);
      });
      
      return appointments;
    } catch (error) {
      console.error("Kullanıcı randevularını getirirken hata oluştu:", error);
      throw error;
    }
  },

  getCaregiverPatients: async (caregiverId: string) => {
    try {
      
      const relationsRef = collection(db, 'caregiverPatientRelations');
      const q = query(
        relationsRef,
        where('caregiverId', '==', caregiverId),
        where('status', '==', 'active') 
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return [];
      }
      
      const patients = await Promise.all(querySnapshot.docs.map(async (relationDoc) => {
        try {
          const relationData = relationDoc.data();
          const patientId = relationData.patientId;
          
          
          const patientRef = doc(db, 'users', patientId);
          const patientDoc = await getDoc(patientRef);
          
          if (patientDoc.exists()) {
            const patientData = patientDoc.data();
            
            return {
              id: patientId,
              name: patientData.displayName || 'İsimsiz Hasta',
              email: patientData.email,
              relationId: relationDoc.id,
              upcomingAppointments: 0,
              lastAppointmentDate: undefined
            };
          } else {
          }
          return null;
        } catch (err) {
          console.error('Hasta bilgisi alınırken hata:', err);
          return null;
        }
      }));
      
      const filteredPatients = patients.filter(p => p !== null);
      
      return filteredPatients;
    } catch (error) {
      console.error('Hastalar getirilirken hata oluştu:', error);
      throw error;
    }
  },
  
  getPatientAppointments: async (patientId: string): Promise<AppointmentData[]> => {
    try {
      const appointmentsRef = collection(db, 'appointments');
      const q = query(
        appointmentsRef,
        where('patientId', '==', patientId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const appointments: AppointmentData[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        appointments.push({
          id: doc.id,
          ...data,
          date: data.date instanceof Timestamp ? data.date.toDate().toISOString() : data.date
        } as AppointmentData);
      });
      
      return appointments;
    } catch (error) {
      console.error("Hasta randevularını getirirken hata oluştu:", error);
      throw error;
    }
  },

  getAppointment: async (appointmentId: string): Promise<AppointmentData | null> => {
    try {
      const appointmentRef = doc(db, 'appointments', appointmentId);
      const appointmentSnap = await getDoc(appointmentRef);
      
      if (appointmentSnap.exists()) {
        const data = appointmentSnap.data();
        return {
          id: appointmentId,
          ...data,
          date: data.date instanceof Timestamp ? data.date.toDate().toISOString() : data.date
        } as AppointmentData;
      }
      return null;
    } catch (error) {
      console.error('Randevu verileri alınırken hata oluştu:', error);
      throw error;
    }
  },

  updateAppointmentLevel: async (appointmentId: string, level: number, collectedApples?: number) => {
    try {
      const appointmentRef = doc(db, 'appointments', appointmentId);
      
      const updateData: any = {
        currentLevel: level,
        updatedAt: serverTimestamp()
      };
      
      if (collectedApples !== undefined) {
        updateData.collectedApples = collectedApples;
      }
      
      await updateDoc(appointmentRef, updateData);
      
      return true;
    } catch (error: any) {
      console.error('Randevu seviyesi güncelleme hatası:', error);
      throw error;
    }
  },

  listenToAppointmentChanges: (appointmentId: string, callback: (data: any) => void) => {
    const appointmentRef = doc(db, 'appointments', appointmentId);
    
    const unsubscribe = onSnapshot(appointmentRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        callback(data);
      } else {
        callback(null);
      }
    }, (error) => {
      console.error('Randevu dinleme hatası:', error);
    });
    
    return unsubscribe;
  },

  getCaregiverPatientsWithProfiles: async (caregiverId: string): Promise<UserProfile[]> => {
    try {
      const relationsRef = collection(db, 'caregiverPatientRelations');
      const q = query(
        relationsRef,
        where('caregiverId', '==', caregiverId)
      );
      
      const querySnapshot = await getDocs(q);
      const patientIds: string[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.patientId) {
          patientIds.push(data.patientId);
        }
      });
      
      const patientProfiles: UserProfile[] = [];
      for (const patientId of patientIds) {
        const profile = await firestoreService.getUserProfile(patientId);
        if (profile) {
          patientProfiles.push({
            ...profile,
            id: patientId
          });
        }
      }
      
      return patientProfiles;
    } catch (error) {
      console.error("Kullanıcının hastalarını getirirken hata oluştu:", error);
      throw error;
    }
  },

  checkExistingPatientRelations: async (caregiverId: string, patientIds: string[]): Promise<string[]> => {
    try {
      const existingPatientIds: string[] = [];
      
      const relationsRef = collection(db, 'caregiverPatientRelations');
      
      for (const patientId of patientIds) {
        const q = query(
          relationsRef,
          where('caregiverId', '==', caregiverId),
          where('patientId', '==', patientId)
        );
        
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          existingPatientIds.push(patientId);
        }
      }
      
      return existingPatientIds;
    } catch (error) {
      console.error("Mevcut ilişkiler kontrol edilirken hata oluştu:", error);
      throw error;
    }
  },
  
  searchUsersByEmail: async (email: string, userType?: string): Promise<UserProfile[]> => {
    try {
      const usersRef = collection(db, 'users');
      let q;
      
      if (userType) {
        q = query(
          usersRef,
          where('email', '>=', email),
          where('email', '<=', email + '\uf8ff'),
          where('userType', '==', userType),
          limit(10)
        );
      } else {
        q = query(
          usersRef,
          where('email', '>=', email),
          where('email', '<=', email + '\uf8ff'),
          limit(10)
        );
      }
      
      const querySnapshot = await getDocs(q);
      const users: UserProfile[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        users.push({
          id: doc.id,
          uid: doc.id, 
          ...data
        } as UserProfile);
      });
      
      return users;
    } catch (error) {
      console.error("Kullanıcılar email ile aranırken hata oluştu:", error);
      throw error;
    }
  },
  
  getPatientUpcomingAppointmentsCount: async (patientId: string): Promise<number> => {
    try {
      const appointmentsRef = collection(db, 'appointments');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const q = query(
        appointmentsRef,
        where('patientId', '==', patientId),
        where('status', 'in', ['pending', 'accepted'])
      );
      
      const querySnapshot = await getDocs(q);
      let count = 0;
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const appointmentDate = data.date instanceof Timestamp 
          ? data.date.toDate() 
          : new Date(data.date);
          
        if (appointmentDate >= today) {
          count++;
        }
      });
      
      return count;
    } catch (error) {
      console.error("Hasta gelecek randevuları sayısı alınırken hata oluştu:", error);
      return 0;
    }
  },

  getAppointmentPositionData: async (appointmentId: string) => {
    try {
      const positionRef = doc(db, `appointments/${appointmentId}/position/data`);
      const docSnap = await getDoc(positionRef);
      
      if (docSnap.exists()) {
        return docSnap.data();
      }
      
      return null;
    } catch (error) {
      console.error('Pozisyon verileri getirme hatası:', error);
      throw error;
    }
  },
  
  saveAppointmentPositionData: async (
    appointmentId: string, 
    basketPosition: PositionData, 
    applePosition: PositionData
  ) => {
    try {
      const positionRef = doc(db, `appointments/${appointmentId}/position/data`);
      await setDoc(positionRef, {
        basketPosition,
        applePosition,
        updatedAt: serverTimestamp()
      });
      
      return true;
    } catch (error) {
      throw error;
    }
  },
  
  updateAppointmentBasketPosition: async (appointmentId: string, basketPosition: PositionData) => {
    try {
      const positionRef = doc(db, `appointments/${appointmentId}/position/data`);
      await updateDoc(positionRef, {
        basketPosition,
        updatedAt: serverTimestamp()
      });
      
      return true;
    } catch (error) {
      throw error;
    }
  },
  
  updateAppointmentApplePosition: async (appointmentId: string, applePosition: PositionData) => {
    try {
      const positionRef = doc(db, `appointments/${appointmentId}/position/data`);
      await updateDoc(positionRef, {
        applePosition,
        updatedAt: serverTimestamp()
      });
      
      return true;
    } catch (error) {
      throw error;
    }
  },

  updateAppointmentTotalPosition: async (appointmentId: string, applePosition: PositionData, basketPosition: PositionData) => {
    try {
      const positionRef = doc(db, `appointments/${appointmentId}/position/data`);
      await updateDoc(positionRef, {
        applePosition,
        basketPosition,
        updatedAt: serverTimestamp()
      });
      
      return true;
    } catch (error) {
      throw error;
    }
  },

  
  
  deleteAppointmentPositionData: async (appointmentId: string) => {
    try {
      const positionRef = doc(db, `appointments/${appointmentId}/position/data`);
      await deleteDoc(positionRef);
      
      console.log(`Pozisyon verileri silindi. Appointment ID: ${appointmentId}`);
      return true;
    } catch (error) {
      console.error('Pozisyon verisi silme hatası:', error);
      throw error;
    }
  },

  // Tüm randevuları silme fonksiyonu: Bakıcı ID'sine göre
  deleteCaregiverAllAppointments: async (caregiverId: string): Promise<{count: number, success: boolean}> => {
    try {
      // Bakıcıya ait tüm randevuları sorgula
      const appointmentsRef = collection(db, 'appointments');
      const q = query(
        appointmentsRef,
        where('caregiverId', '==', caregiverId)
      );
      
      const querySnapshot = await getDocs(q);
      let deletedCount = 0;
      
      // Tüm belgeleri sil
      const deletePromises = querySnapshot.docs.map(async (doc) => {
        await deleteDoc(doc.ref);
        deletedCount++;
      });
      
      await Promise.all(deletePromises);
      
      return {
        count: deletedCount,
        success: true
      };
    } catch (error) {
      console.error('Tüm randevuları silme hatası:', error);
      throw error;
    }
  },
};

export default firestoreService;
