import { db } from '@/firebase/config';
import { User } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';

// Firebase'den kullanıcı verilerini almak için tip tanımlamaları
export interface AppointmentData {
  id: string;
  date: string;
  time: string;
  doctor: string;
  doctorSpecialty: string;
  location: string;
  status: 'upcoming' | 'completed' | 'canceled';
  notes?: string;
  collectedApples?: number;
  rom?: number;
}

export interface ExerciseData {
  id: string;
  title: string;
  description: string;
  duration: string;
  imageUrl: string;
  videoUrl?: string;
  completed: boolean;
  type: string;
  targetArea: string;
  date: string;
}

export interface ProgressData {
  dates: string[];
  physicalProgress: number[];
  painLevels: number[];
  progressPercentage: number;
}

export interface UserStats {
  sessionsCount: number;
  totalCollectedApples: number;
  maxLevel: number;
}

// Randevu verilerini getir
export const getUserAppointments = async (user: User): Promise<AppointmentData[]> => {
  try {
    const appointmentsRef = collection(db, 'users', user.uid, 'appointments');
    const querySnapshot = await getDocs(appointmentsRef);
    
    if (querySnapshot.empty) {
      // Veri yoksa örnek veriler oluştur ve kaydet
      const defaultAppointments = generateDefaultAppointments();
      await Promise.all(
        defaultAppointments.map(appointment => 
          setDoc(doc(appointmentsRef, appointment.id), appointment)
        )
      );
      return defaultAppointments;
    }
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as AppointmentData));
  } catch (error) {
    console.error('Randevu verileri alınırken hata:', error);
    return generateDefaultAppointments();
  }
};

// Egzersiz verilerini getir
export const getUserExercises = async (user: User): Promise<ExerciseData[]> => {
  try {
    const exercisesRef = collection(db, 'users', user.uid, 'exercises');
    const querySnapshot = await getDocs(exercisesRef);
    
    if (querySnapshot.empty) {
      // Veri yoksa örnek veriler oluştur ve kaydet
      const defaultExercises = generateDefaultExercises();
      await Promise.all(
        defaultExercises.map(exercise => 
          setDoc(doc(exercisesRef, exercise.id), exercise)
        )
      );
      return defaultExercises;
    }
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ExerciseData));
  } catch (error) {
    console.error('Egzersiz verileri alınırken hata:', error);
    return generateDefaultExercises();
  }
};

// İlerleme verilerini getir
export const getUserProgress = async (user: User): Promise<ProgressData> => {
  try {
    const progressRef = doc(db, 'users', user.uid, 'stats', 'progress');
    const progressDoc = await getDoc(progressRef);
    
    if (!progressDoc.exists()) {
      // Veri yoksa örnek veriler oluştur ve kaydet
      const defaultProgress = generateDefaultProgress();
      await setDoc(progressRef, defaultProgress);
      return defaultProgress;
    }
    
    return progressDoc.data() as ProgressData;
  } catch (error) {
    console.error('İlerleme verileri alınırken hata:', error);
    return generateDefaultProgress();
  }
};

// Kullanıcı istatistiklerini getir
export const getUserStats = async (user: User): Promise<UserStats> => {
  try {
    const statsRef = doc(db, 'users', user.uid, 'stats', 'overview');
    const statsDoc = await getDoc(statsRef);
    
    if (!statsDoc.exists()) {
      // Veri yoksa örnek veriler oluştur ve kaydet
      const defaultStats = generateDefaultStats();
      await setDoc(statsRef, defaultStats);
      return defaultStats;
    }
    
    return statsDoc.data() as UserStats;
  } catch (error) {
    console.error('Kullanıcı istatistikleri alınırken hata:', error);
    return generateDefaultStats();
  }
};

// Varsayılan veri oluşturucu fonksiyonlar
function generateDefaultAppointments(): AppointmentData[] {
  const today = new Date();
  
  const futureDate1 = new Date();
  futureDate1.setDate(today.getDate() + 5);
  
  const futureDate2 = new Date();
  futureDate2.setDate(today.getDate() + 7);
  
  const futureDate3 = new Date();
  futureDate3.setDate(today.getDate() + 9);
  
  const pastDate1 = new Date();
  pastDate1.setDate(today.getDate() - 7);
  
  const pastDate2 = new Date();
  pastDate2.setDate(today.getDate() - 14);
  
  return [
    {
      id: '1',
      date: futureDate1.toISOString().split('T')[0],
      time: '14:30 - 15:30',
      doctor: 'Dr. Mehmet Yılmaz',
      doctorSpecialty: 'Fizik Tedavi Uzmanı',
      location: 'A Blok, 3. Kat, Oda 302',
      status: 'upcoming'
    },
    {
      id: '2',
      date: futureDate2.toISOString().split('T')[0],
      time: '10:00 - 10:30',
      doctor: 'Dr. Ayşe Kaya',
      doctorSpecialty: 'Nörolog',
      location: 'B Blok, 2. Kat, Oda 205',
      status: 'upcoming'
    },
    {
      id: '3',
      date: futureDate3.toISOString().split('T')[0],
      time: '14:30 - 15:30',
      doctor: 'Dr. Mehmet Yılmaz',
      doctorSpecialty: 'Fizik Tedavi Uzmanı',
      location: 'A Blok, 3. Kat, Oda 302',
      status: 'upcoming'
    },
    {
      id: '4',
      date: pastDate1.toISOString().split('T')[0],
      time: '11:00 - 12:00',
      doctor: 'Dr. Ali Demir',
      doctorSpecialty: 'Ortopedi Uzmanı',
      location: 'C Blok, 1. Kat, Oda 105',
      status: 'completed',
      notes: 'Elma toplama egzersizinde ilerleme kaydedildi.'
    },
    {
      id: '5',
      date: pastDate2.toISOString().split('T')[0],
      time: '09:30 - 10:00',
      doctor: 'Dr. Zeynep Şahin',
      doctorSpecialty: 'Fizyoterapist',
      location: 'A Blok, 2. Kat, Oda 210',
      status: 'completed',
      notes: 'VR egzersiz programı güncellendi.'
    }
  ];
}

function generateDefaultExercises(): ExerciseData[] {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(today.getDate() - 2);
  const twoDaysAgoStr = twoDaysAgo.toISOString().split('T')[0];
  
  return [
    {
      id: '1',
      title: 'Elma Toplama - Kolay Seviye',
      description: 'Havada süzülen elmaları yakalayıp doğru sepete yerleştirme.',
      duration: '10 dakika',
      imageUrl: '/images/exercises/apple-picking.jpg',
      videoUrl: '#',
      completed: false,
      type: 'El-Kol Koordinasyonu',
      targetArea: 'Üst Ekstremite',
      date: todayStr
    },
    {
      id: '2',
      title: 'Elma Sıralama - Renk Eşleştirme',
      description: 'Farklı renkteki elmaları uygun renkteki sepetlere yerleştirme.',
      duration: '8 dakika',
      imageUrl: '/images/exercises/apple-sorting.jpg',
      videoUrl: '#',
      completed: true,
      type: 'Bilişsel-Motor',
      targetArea: 'Üst Ekstremite ve Bilişsel',
      date: todayStr
    },
    {
      id: '3',
      title: 'Uzanma Egzersizleri',
      description: 'Farklı yönlerde beliren elmalara ulaşma ve yakalama.',
      duration: '5 dakika',
      imageUrl: '/images/exercises/reaching.jpg',
      videoUrl: '#',
      completed: false,
      type: 'Hareket Açıklığı',
      targetArea: 'Omuz ve Gövde',
      date: todayStr
    },
    {
      id: '4',
      title: 'El Becerileri - Orta Seviye',
      description: 'Elmaları yakalarken kavrama ve bırakma hareketlerini geliştirme.',
      duration: '12 dakika',
      imageUrl: '/images/exercises/hand-skills.jpg',
      videoUrl: '#',
      completed: false,
      type: 'El Fonksiyonu',
      targetArea: 'El ve Parmaklar',
      date: yesterdayStr
    },
    {
      id: '5',
      title: 'Yüksek Raflar - Zor Seviye',
      description: 'Yukarıda bulunan elmaları toplayıp aşağıdaki sepetlere yerleştirme.',
      duration: '15 dakika',
      imageUrl: '/images/exercises/high-shelves.jpg',
      videoUrl: '#',
      completed: true,
      type: 'Güçlendirme',
      targetArea: 'Tüm Üst Ekstremite',
      date: twoDaysAgoStr
    }
  ];
}

function generateDefaultProgress(): ProgressData {
  return {
    dates: ['1 Haz', '8 Haz', '15 Haz', '22 Haz', '29 Haz', '5 Tem'],
    physicalProgress: [20, 35, 45, 55, 62, 68],
    painLevels: [8, 7, 5, 4, 3, 3]
  };
}

function generateDefaultStats(): UserStats {
  return {
    sessionsCount: 7,
    collectedApples: 183,
    progressPercentage: 68,
    currentLevel: 3
  };
}
