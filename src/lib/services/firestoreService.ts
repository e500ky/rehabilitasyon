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

// Yeniden deneme mekanizması
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

const firestoreService = {
  // Kullanıcı profili oluşturma
  createUserProfile: async (uid: string, userData: UserProfile): Promise<void> => {
    try {
      // Yeni kullanıcı oluştuğunda kullanıcı dokümanını ekle
      await retry(async () => {
        const userRef = doc(db, 'users', uid);
        await setDoc(userRef, {
          ...userData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      });
      
      // İstatistik dokümanını ekle
      await retry(async () => {
        const statsRef = doc(db, 'stats', uid);
        await setDoc(statsRef, {
          sessionsCount: 0,
          totalCollectedApples: 0,
          maxLevel: 1,
          updatedAt: new Date().toISOString()
        });
      });
      
      // İlerleme dokümanını ekle
      await retry(async () => {
        const progressRef = doc(db, 'progress', uid);
        await setDoc(progressRef, {
          data: [],
          updatedAt: new Date().toISOString()
        });
      });
      
      console.log("Kullanıcı profili ve ilgili veriler başarıyla oluşturuldu");
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
  
  // Kullanıcı profili alma
  getUserProfile: async (uid: string): Promise<UserProfile | null> => {
    try {
      const userRef = doc(db, 'users', uid);
      const docSnap = await getDoc(userRef);
      
      if (docSnap.exists()) {
        return docSnap.data() as UserProfile;
      } else {
        console.log('Kullanıcı profili bulunamadı!');
        return null;
      }
    } catch (error) {
      console.error('Kullanıcı profili alma hatası:', error);
      throw error;
    }
  },
  
  // Kullanıcı istatistiklerini alma
  getUserStats: async (userId: string) => {
    try {
      const statsRef = doc(db, 'stats', userId);
      const statsDoc = await getDoc(statsRef);
      
      if (statsDoc.exists()) {
        const data = statsDoc.data();
        // stats artık maxLevel ve totalCollectedApples içeriyor
        return {
          maxLevel: data.maxLevel || 1,
          totalCollectedApples: data.totalCollectedApples || 0,
          progressPercentage: data.progressPercentage || 0,
          // Diğer istatistikler
        };
      }
      
      return null;
    } catch (error) {
      console.error('Kullanıcı istatistikleri alınırken hata:', error);
      throw error;
    }
  },
  
  // Kullanıcı ilerleme verilerini alma
  getUserProgress: async (uid: string): Promise<ProgressData | null> => {
    try {
      const progressRef = doc(db, 'progress', uid);
      const docSnap = await getDoc(progressRef);
      
      if (docSnap.exists()) {
        return docSnap.data() as ProgressData;
      } else {
        console.log('Kullanıcı ilerleme verileri bulunamadı!');
        return null;
      }
    } catch (error) {
      console.error('Kullanıcı ilerleme verileri alma hatası:', error);
      throw error;
    }
  },
  
  // Kullanıcı istatistiklerini gerçek zamanlı dinleme
  subscribeToUserStats: (uid: string, callback: (data: UserStats) => void) => {
    const statsRef = doc(db, 'stats', uid);
    return onSnapshot(statsRef, (doc) => {
      if (doc.exists()) {
        callback(doc.data() as UserStats);
      }
    });
  },
  
  // Kullanıcı ilerleme verilerini gerçek zamanlı dinleme
  subscribeToUserProgress: (uid: string, callback: (data: ProgressData) => void) => {
    const progressRef = doc(db, 'progress', uid);
    return onSnapshot(progressRef, (doc) => {
      if (doc.exists()) {
        callback(doc.data() as ProgressData);
      }
    });
  },
  
  // İlerleme verisine yeni veri noktası ekleme
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

  // Randevu başlatma (seviye ve toplanan elma sayısı ile)
  startAppointment: async (appointmentId: string, level: number, collectedApples: number = 0) => {
    try {
      const appointmentRef = doc(db, 'appointments', appointmentId);
      
      await updateDoc(appointmentRef, {
        status: 'accepted',
        currentLevel: level,
        collectedApples: collectedApples, // Toplanan elma sayısını koru
        updatedAt: serverTimestamp()
      });
      
      console.log(`Randevu başlatıldı. ID: ${appointmentId}, Seviye: ${level}, Elmalar: ${collectedApples}`);
      return true;
    } catch (error: any) {
      console.error('Randevu başlatma hatası:', error);
      throw error;
    }
  },

  // Randevu tamamlandığında kullanıcı istatistiklerini güncelle
  updateUserStatsOnCompletion: async (userId: string, level: number, collectedApples: number) => {
    try {
      const statsRef = doc(db, 'stats', userId);
      
      // Stats verisini getir
      const statsDoc = await getDoc(statsRef);
      
      if (statsDoc.exists()) {
        const statsData = statsDoc.data();
        
        // Mevcut değerleri kontrol et
        const currentMaxLevel = statsData.maxLevel || 1;
        const currentTotalApples = statsData.totalCollectedApples || 0;
        
        // Yeni değerleri hesapla
        const newMaxLevel = Math.max(currentMaxLevel, level);
        const newTotalApples = currentTotalApples + collectedApples;
        
        // Stats'i güncelle
        await updateDoc(statsRef, {
          maxLevel: newMaxLevel,
          totalCollectedApples: newTotalApples,
          updatedAt: serverTimestamp()
        });
        
        console.log(`Kullanıcı stats güncellendi. ID: ${userId}, MaxLevel: ${newMaxLevel}, TotalApples: ${newTotalApples}`);
      } else {
        // Stats yoksa yeni oluştur
        await setDoc(statsRef, {
          maxLevel: level,
          totalCollectedApples: collectedApples,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        
        console.log(`Yeni kullanıcı stats oluşturuldu. ID: ${userId}, MaxLevel: ${level}, TotalApples: ${collectedApples}`);
      }
      
      return true;
    } catch (error: any) {
      console.error('Stats güncelleme hatası:', error);
      throw error;
    }
  },

  // Randevu oluşturma
  createAppointment: async (appointmentData: Omit<AppointmentData, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const appointmentsRef = collection(db, 'appointments');
      
      // currentLevel ve collectedApples ekle
      const appointmentWithData = {
        ...appointmentData,
        currentLevel: 1,
        collectedApples: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(appointmentsRef, appointmentWithData);
      console.log(`Yeni randevu oluşturuldu. ID: ${docRef.id}`);
      
      return docRef.id;
    } catch (error) {
      console.error('Randevu oluşturma hatası:', error);
      throw error;
    }
  },
  
  // Randevu durumu güncelleme
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
  
  // Randevu silme
  deleteAppointment: async (appointmentId: string): Promise<void> => {
    try {
      const appointmentRef = doc(db, 'appointments', appointmentId);
      await deleteDoc(appointmentRef);
      console.log(`Randevu başarıyla silindi: ${appointmentId}`);
    } catch (error) {
      console.error('Randevu silme hatası:', error);
      throw error;
    }
  },
  
  // Bakıcı-hasta ilişkisi oluşturma
  createCaregiverPatientRelation: async (caregiverId: string, patientId: string): Promise<string> => {
    try {
      console.log(`İlişki oluşturma başlatıldı - Bakıcı: ${caregiverId}, Hasta: ${patientId}`);
      
      // Koleksiyon adını doğrulama
      const collectionName = 'caregiverPatientRelations'; // Doğru koleksiyon adı
      
      // HATA AYIKLAMA: Firestore bağlantısını kontrol et
      try {
        const testColRef = collection(db, collectionName);
        const testQuerySnapshot = await getDocs(query(testColRef, limit(1)));
        console.log(`Firestore bağlantısı test edildi. ${collectionName} koleksiyonu mevcut.`);
      } catch (testErr) {
        console.error(`Firestore bağlantı testi başarısız: ${testErr}`);
      }
      
      // Benzersiz bir ID oluştur (timestamp kullanarak)
      const timestamp = new Date().getTime();
      const relationId = `rel_${timestamp}_${caregiverId.substring(0, 4)}_${patientId.substring(0, 4)}`;
      
      console.log(`Oluşturulan ilişki ID: ${relationId}`);
      
      // İlişki objesi
      const relationData = {
        caregiverId: caregiverId,
        patientId: patientId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active'
      };
      
      console.log('Kaydedilecek veri:', relationData);
      
      // DOĞRUDAN KOLEKSIYON REFERANSI KULLANARAK DENEMEK
      const relationsCollectionRef = collection(db, collectionName);
      const docRef = await addDoc(relationsCollectionRef, relationData);
      
      console.log(`İlişki başarıyla oluşturuldu, otomatik ID: ${docRef.id}`);
      
      return docRef.id;
    } catch (error: any) {
      console.error('Bakıcı-hasta ilişkisi oluşturma hatası:', error);
      
      // Hata türüne göre daha spesifik mesajlar
      if (error.code === 'permission-denied') {
        console.error('Firestore İzin Hatası: Güvenlik kurallarını kontrol edin.');
      } else if (error.code === 'not-found') {
        console.error('Koleksiyon veya belge bulunamadı.');
      }
      
      throw error;
    }
  },
  
  // Bakıcı-hasta ilişkisini silme
  deleteCaregiverPatientRelation: async (relationId: string): Promise<void> => {
    try {
      console.log(`İlişki siliniyor: ${relationId}`);
      const relationRef = doc(db, 'caregiverPatientRelations', relationId);
      
      // İlişkiyi tamamen sil
      await deleteDoc(relationRef);
      console.log(`İlişki başarıyla silindi: ${relationId}`);
    } catch (error) {
      console.error('Bakıcı-hasta ilişkisi silme hatası:', error);
      throw error;
    }
  },

  // Bakıcı randevularını getir
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
      console.error("Bakıcı randevularını getirirken hata oluştu:", error);
      throw error;
    }
  },

  // Bakıcı-hasta ilişkilerini getir
  getCaregiverPatients: async (caregiverId: string) => {
    try {
      console.log(`Bakıcının (${caregiverId}) hastalarını getirme işlemi başladı...`);
      
      // Doğru koleksiyon adı: caregiverPatientRelations
      const relationsRef = collection(db, 'caregiverPatientRelations');
      const q = query(
        relationsRef,
        where('caregiverId', '==', caregiverId),
        where('status', '==', 'active') // Aktif ilişkileri getir
      );
      
      const querySnapshot = await getDocs(q);
      console.log(`${querySnapshot.size} ilişki bulundu.`);
      
      if (querySnapshot.empty) {
        console.log('Bakıcının hiç hasta ilişkisi bulunamadı');
        return [];
      }
      
      // Her bir ilişkiden hasta bilgilerini al
      const patients = await Promise.all(querySnapshot.docs.map(async (relationDoc) => {
        try {
          const relationData = relationDoc.data();
          const patientId = relationData.patientId;
          
          console.log(`Hasta bilgisi alınıyor: ${patientId}`);
          
          // Hasta profilini getir
          const patientRef = doc(db, 'users', patientId);
          const patientDoc = await getDoc(patientRef);
          
          if (patientDoc.exists()) {
            const patientData = patientDoc.data();
            console.log(`Hasta ${patientId} bilgileri alındı:`, patientData.displayName || 'İsimsiz Hasta');
            
            return {
              id: patientId,
              name: patientData.displayName || 'İsimsiz Hasta',
              email: patientData.email,
              relationId: relationDoc.id,
              upcomingAppointments: 0,
              lastAppointmentDate: undefined
            };
          } else {
            console.log(`${patientId} ID'li hasta bulunamadı.`);
          }
          return null;
        } catch (err) {
          console.error('Hasta bilgisi alınırken hata:', err);
          return null;
        }
      }));
      
      const filteredPatients = patients.filter(p => p !== null);
      console.log(`Sonuç: ${filteredPatients.length} hasta bulundu.`);
      
      return filteredPatients;
    } catch (error) {
      console.error('Hastalar getirilirken hata oluştu:', error);
      throw error;
    }
  },
  
  // Hasta randevularını getir
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

  // Tek bir randevuyu getir
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

  // Randevu seviyesini güncelleme - toplanan elma sayısını koruma
  updateAppointmentLevel: async (appointmentId: string, level: number, collectedApples?: number) => {
    try {
      const appointmentRef = doc(db, 'appointments', appointmentId);
      
      const updateData: any = {
        currentLevel: level,
        updatedAt: serverTimestamp()
      };
      
      // Eğer toplanan elma sayısı belirtildiyse, onu da güncelle
      if (collectedApples !== undefined) {
        updateData.collectedApples = collectedApples;
      }
      
      await updateDoc(appointmentRef, updateData);
      
      console.log(`Randevu seviyesi güncellendi. ID: ${appointmentId}, Seviye: ${level}`);
      return true;
    } catch (error: any) {
      console.error('Randevu seviyesi güncelleme hatası:', error);
      throw error;
    }
  },

  // Randevu değişikliklerini anlık dinle
  listenToAppointmentChanges: (appointmentId: string, callback: (data: any) => void) => {
    const appointmentRef = doc(db, 'appointments', appointmentId);
    
    // onSnapshot ile değişiklikleri anlık olarak dinle
    const unsubscribe = onSnapshot(appointmentRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        callback(data);
      } else {
        console.log('Randevu bulunamadı');
        callback(null);
      }
    }, (error) => {
      console.error('Randevu dinleme hatası:', error);
    });
    
    // Dinlemeyi durdurmak için kullanılacak fonksiyonu döndür
    return unsubscribe;
  },

  // Bir bakıcının hastalarını getir
  getCaregiverPatientsWithProfiles: async (caregiverId: string): Promise<UserProfile[]> => {
    try {
      // İlk olarak bakıcı-hasta ilişkilerini al
      const relationsRef = collection(db, 'caregiverPatientRelations');
      const q = query(
        relationsRef,
        where('caregiverId', '==', caregiverId)
      );
      
      const querySnapshot = await getDocs(q);
      const patientIds: string[] = [];
      
      // Hasta ID'lerini topla
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.patientId) {
          patientIds.push(data.patientId);
        }
      });
      
      // Hasta profillerini getir
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
      console.error("Bakıcının hastalarını getirirken hata oluştu:", error);
      throw error;
    }
  },

  // Kullanıcının mevcut ilişkilerini kontrol et (hasta ekleme için)
  checkExistingPatientRelations: async (caregiverId: string, patientIds: string[]): Promise<string[]> => {
    try {
      const existingPatientIds: string[] = [];
      
      // İlişkileri kontrol et
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
  
  // Email'e göre kullanıcıları ara - userType parametresi eklendi
  searchUsersByEmail: async (email: string, userType?: string): Promise<UserProfile[]> => {
    try {
      const usersRef = collection(db, 'users');
      let q;
      
      if (userType) {
        // Belirli bir kullanıcı tipine göre filtreleme yap
        q = query(
          usersRef,
          where('email', '>=', email),
          where('email', '<=', email + '\uf8ff'),
          where('userType', '==', userType),
          limit(10)
        );
      } else {
        // Tüm kullanıcılar arasında ara
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
          uid: doc.id, // uid alanını ekle (bazı yerlerde kullanılabilir)
          ...data
        } as UserProfile);
      });
      
      return users;
    } catch (error) {
      console.error("Kullanıcılar email ile aranırken hata oluştu:", error);
      throw error;
    }
  },
  
  // Gelecek randevuları sayısını getir (hasta detay sayfası için)
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
};

export default firestoreService;
