'use client';

import CaregiverDashboard from '@/components/CaregiverDashboard';
import DashboardLayout from '@/components/DashboardLayout';
import PatientDashboard from '@/components/PatientDashboard';
import { useAuth } from '@/context/AuthContext';
import firestoreService from '@/lib/services/firestoreService';
import { UserProfile } from '@/types/user';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './dashboard.module.css';

export default function Dashboard() {
  const { currentUser, loading } = useAuth();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!loading && !currentUser) {
      router.push('/oturum-ac');
      return;
    }
    
    if (currentUser) {
      const fetchUserProfile = async () => {
        try {
          const profile = await firestoreService.getUserProfile(currentUser.uid);
          if (profile) {
            setUserProfile(profile);
          }
          setIsLoading(false);
        } catch (error) {
          console.error('Kullanıcı profili yükleme hatası:', error);
          setError('Kullanıcı profili yüklenirken bir hata oluştu.');
          setIsLoading(false);
        }
      };
      
      fetchUserProfile();
    }
  }, [currentUser, loading, router]);

  if (loading || isLoading) {
    return (
      <div className={styles.loading}>
        <p>Yükleniyor...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <DashboardLayout>
        <div className={styles.errorMessage}>
          <p>{error}</p>
        </div>
      </DashboardLayout>
    );
  }

  // Kullanıcı türüne göre dashboard göster
  return (
    <DashboardLayout>
      {userProfile?.userType === 'caregiver' ? (
        <CaregiverDashboard userProfile={userProfile} />
      ) : (
        <PatientDashboard userProfile={userProfile} />
      )}
    </DashboardLayout>
  );
}
