export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  phoneNumber?: string;
  photoURL: string;
  userType?: 'patient' | 'caregiver';
  emailVerified?: boolean;
  phoneVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserStats {
    maxLevel?: number;
    totalCollectedApples?: number;  
    progressPercentage?: number; 
    sessionsCount?: number; 
}

export interface ProgressDataPoint {
  date: string;
  progress: number;
  rom: number;
  holdDuration: number;
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
  date: string;
  time: string;
  type: string;
  notes?: string;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  currentLevel?: number;
  collectedApples?: number;
  createdAt?: any;
  updatedAt?: any;
}