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
          collectedApples: 0,
          currentLevel: 1,
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
        const testDoc = await getDocs(query(testColRef, limit(1)));
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
      const relationRef = doc(db, 'caregiverPatientRelations', relationId);
      await updateDoc(relationRef, {
        deleted: true,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Bakıcı-hasta ilişkisi silme hatası:', error);
      throw error;
    }
  },

  // Bakıcının hastalarını getirme
  getCaregiverPatients: async (userId: string): Promise<any[]> => {
    try {
      console.log(`Bakıcının hastaları sorgulanıyor... Bakıcı ID: ${userId}`);
      
      // Bakıcı-hasta ilişkilerini sorgula
      const relationshipsRef = collection(db, 'caregiverPatientRelations');
      
      // İlişkileri sorgula
      const q = query(relationshipsRef, where('caregiverId', '==', userId));
      console.log('İlişki sorgusu oluşturuldu');
      
      const querySnapshot = await getDocs(q);
      console.log(`İlişkiler sorgulandı. ${querySnapshot.size} ilişki bulundu.`);
      
      if (querySnapshot.empty) {
        console.log('Hiç ilişki bulunamadı.');
        return [];
      }

      // Hasta bilgilerini al
      console.log('Hasta verileri alınıyor...');
      const patients = await Promise.all(
        querySnapshot.docs.map(async (relationDoc) => {
          try {
            const relationData = relationDoc.data();
            const patientId = relationData.patientId;
            console.log(`İlişki verisi: `, relationData);
            
            const patientDoc = await getDoc(doc(db, 'users', patientId));
            if (patientDoc.exists()) {
              const patientData = patientDoc.data();
              console.log(`Hasta ${patientId} bilgileri alındı:`, patientData);
              
              return {
                id: patientId,
                name: patientData.displayName || 'İsimsiz Hasta',
                email: patientData.email,
                relationId: relationDoc.id,
                upcomingAppointments: 0, // Default değer
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
        })
      );
      
      const filteredPatients = patients.filter(p => p !== null);
      console.log(`Sonuç: ${filteredPatients.length} hasta bulundu.`);
      return filteredPatients;
    } catch (error: any) {
      console.error('Hastalar getirilirken hata oluştu:', error);
      throw error;
    }
  },

  // Bakıcının randevularını getirme
  getCaregiverAppointments: async (caregiverId: string, status?: 'pending' | 'accepted' | 'completed' | 'cancelled'): Promise<AppointmentData[]> => {
    try {
      const appointmentsRef = collection(db, 'appointments');
      
      let q;
      if (status) {
        q = query(
          appointmentsRef,
          where('caregiverId', '==', caregiverId),
          where('status', '==', status)
        );
      } else {
        q = query(
          appointmentsRef,
          where('caregiverId', '==', caregiverId)
        );
      }
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return [];
      }
      
      const appointments = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as AppointmentData));
      
      return appointments;
    } catch (error: any) {
      console.error('Randevular getirilirken hata oluştu:', error);
      if (error.code === 'permission-denied') {
        console.error('İzin hatası: Güvenlik kurallarını kontrol edin ve Firebase konsolunuzda ayarlamayı unutmayın.');
        return []; // Hata durumunda boş dizi döndürme
      }
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

  // Email adresine göre kullanıcı arama
  searchUsersByEmail: async (email: string, userType?: 'patient' | 'caregiver'): Promise<UserProfile[]> => {
    try {
      const trimmedEmail = email.trim();
      if (!trimmedEmail) {
        console.log("Arama sorgusu boş.");
        return [];
      }
      console.log(`Firestore'da aranan email: '${trimmedEmail}', İstenen tip: ${userType || 'Belirtilmedi'}`);

      const usersRef = collection(db, 'users');
      
      // Sadece email ile sorgu yap
      const q = query(usersRef, where('email', '==', trimmedEmail));
      
      const querySnapshot = await getDocs(q);
      console.log(`Firestore sorgu sonucu: ${querySnapshot.size} doküman bulundu.`);
      
      if (querySnapshot.empty) {
        return [];
      }
      
      // Tüm eşleşen kullanıcıları al
      let users = querySnapshot.docs.map(doc => {
        const data = doc.data();
        console.log(`Bulunan doküman ID: ${doc.id}, Veri:`, data); // Her dokümanın verisini logla
        return {
          uid: doc.id,
          ...data
        } as UserProfile;
      });
      
      console.log("Filtreleme öncesi bulunan kullanıcılar:", users);
      
      // Eğer userType belirtilmişse, client tarafında filtrele
      if (userType) {
        users = users.filter(user => {
          console.log(`Kullanıcı ${user.uid} (${user.email}) tipi kontrol ediliyor: ${user.userType} === ${userType}`);
          return user.userType === userType;
        });
        console.log(`'${userType}' tipine göre filtrelenmiş kullanıcılar:`, users);
      } else {
        console.log("UserType filtresi uygulanmadı.");
      }
      
      return users;
    } catch (error: any) {
      console.error('Kullanıcı arama hatası:', error);
      
      // İzin hatası durumunda özel işlem
      if (error.code === 'permission-denied') {
        console.warn('İzin hatası: Firebase güvenlik kurallarını kontrol edin.');
        throw new Error('Kullanıcı arama izniniz yok. Lütfen Firebase güvenlik kurallarını kontrol edin.');
      }
      
      throw error; // Diğer hataları tekrar fırlat
    }
  },

  // Hasta için bekleyen ve onaylanan randevu sayısını getiren fonksiyon
  getPatientUpcomingAppointmentsCount: async (patientId: string): Promise<number> => {
    try {
      const appointmentsRef = collection(db, 'appointments');
      
      // Yalnızca bekleyen ve onaylanan randevuları sayan sorgu
      const q = query(
        appointmentsRef,
        where('patientId', '==', patientId),
        where('status', 'in', ['pending', 'accepted'])
      );
      
      const querySnapshot = await getDocs(q);
      
      // Gelecek tarihteki randevuları filtreleme
      const now = new Date();
      const validAppointments = querySnapshot.docs.filter(doc => {
        const appointmentData = doc.data();
        const appointmentDate = new Date(appointmentData.date);
        return appointmentDate >= now;
      });
      
      return validAppointments.length;
    } catch (error) {
      console.error('Randevu sayısı getirme hatası:', error);
      return 0; // Hata durumunda 0 dön
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
      
      console.log(`Randevu seviyesi güncellendi. ID: ${appointmentId}, Seviye: ${level}, ${collectedApples !== undefined ? `Elmalar: ${collectedApples}` : ''}`);
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
};

export default firestoreService;
