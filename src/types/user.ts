export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  userType?: 'patient' | 'caregiver';
  createdAt?: string;
  updatedAt?: string;
}

export interface UserStats {
  maxLevel?: number; // Kullanıcının ulaştığı en yüksek seviye
  totalCollectedApples?: number; // Toplam toplanan elma sayısı  
  progressPercentage?: number; // İlerleme yüzdesi
  currentLevel?: number; // Kullanıcının şu anki seviyesi
  collectedApples?: number; // Bu seviyede toplanan elma sayısı
  // Diğer istatistikler
}

export interface ProgressDataPoint {
  date: string;
  progress: number;
  painLevel: number;
}

export interface ProgressData {
  data: ProgressDataPoint[];
  updatedAt?: string;
}

export interface AppointmentData {
  id: string;
  patientId: string;
  patientName: string;
  caregiverId: string;
  caregiverName: string;
  date: string; // ISO string formatında tarih
  time: string; // HH:MM formatında saat
  type: string; // Randevu türü
  notes?: string; // Opsiyonel notlar
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  currentLevel?: number; // Seçilen seviye (1-10 arası)
  collectedApples?: number; // Toplanan elma sayısı
  createdAt?: any; // FireStore timestamp
  updatedAt?: any; // FireStore timestamp
}