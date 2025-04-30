'use client';

import ProgressChart from '@/components/ProgressChart';
import { useAuth } from '@/context/AuthContext';
import firestoreService from '@/lib/services/firestoreService';
import { ProgressDataPoint, UserProfile, UserStats } from '@/types/user';
import {
  faCalendarCheck,
  faChartLine,
  faExclamationTriangle,
  faGamepad,
  faInfoCircle,
  faPlayCircle,
  faTrophy,
  faVrCardboard
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useState } from 'react';
import styles from './PatientDashboard.module.css';

interface PatientDashboardProps {
  userProfile: UserProfile;
}

export default function PatientDashboard({ userProfile }: PatientDashboardProps) {
  const { currentUser } = useAuth();
  const [userStats, setUserStats] = useState<UserStats>();
  const [progressData, setProgressData] = useState<ProgressDataPoint[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const ortalama = progressData.reduce((acc, item) => acc + item.progress, 0) / progressData.length;
  
  useEffect(() => {
    if (currentUser) {
      
      setProgressData([]);
      
      const fetchUserData = async () => {
        try {
          const stats = await firestoreService.getUserStats(currentUser.uid);
          if (stats) {
            setUserStats(stats);
          }
          
          const progress = await firestoreService.getUserProgress(currentUser.uid);
          if (progress && progress.data) {
            setProgressData(progress.data);
          }
          
          setIsDataLoading(false);
        } catch (error: any) {
          console.error('Veri yükleme hatası:', error);
          setIsDataLoading(false);
          
          if (error.code === 'permission-denied') {
            setError('Veri yükleme hatası: Erişim izniniz yok. Yöneticiye başvurun.');
          } else {
            setError('Veri yükleme hatası: Bir şeyler yanlış gitti. Lütfen tekrar deneyin.');
          }
        }
      };
      
      fetchUserData();
    }
  }, [currentUser]);

  return (
    <div className={styles.dashboardContainer}>
      {error && (
        <div className={styles.errorMessage}>
          <FontAwesomeIcon icon={faExclamationTriangle} className={styles.errorIcon} />
          <div>
            <p>{error}</p>
            <p className={styles.errorNote}>Not: Şu an varsayılan örnek veriler gösteriliyor.</p>
          </div>
        </div>
      )}
      
      <div className={styles.welcomeSection}>
        <h1>Hoş Geldiniz, {userProfile?.displayName}</h1>
        <p>Rehabilitasyon sürecinizi takip edin ve ilerleme kaydedin.</p>
      </div>
      
      <div className={styles.statsContainer}>
        <div className={styles.statItem}>
          <div className={styles.statIcon}>
            <FontAwesomeIcon icon={faCalendarCheck} />
          </div>
          <div className={styles.statInfo}>
            <h3>Tamamlanan Seanslar</h3>
            <div className={styles.statValue}>{userStats?.sessionsCount || 0}</div>
          </div>
        </div>
        
        <div className={styles.statItem}>
          <div className={styles.statIcon}>
            <FontAwesomeIcon icon={faGamepad} />
          </div>
          <div className={styles.statInfo}>
            <h3>Toplanan Elmalar</h3>
            <div className={styles.statValue}>{userStats?.totalCollectedApples || 0}</div>
          </div>
        </div>
        
        <div className={styles.statItem}>
          <div className={styles.statIcon}>
            <FontAwesomeIcon icon={faChartLine} />
          </div>
          <div className={styles.statInfo}>
            <h3>Başarım Oranı</h3>
            <div className={styles.statValue}>%{isNaN(ortalama) ? 0 : ortalama.toFixed(2)}</div>
          </div>
        </div>
        
        <div className={styles.statItem}>
          <div className={styles.statIcon}>
            <FontAwesomeIcon icon={faTrophy} />
          </div>
          <div className={styles.statInfo}>
            <h3>Maksimum Seviye</h3>
            <div className={styles.statValue}>{userStats?.maxLevel || 1}</div>
            <div className={styles.statSubtext}>(9 seviye arasında)</div>
          </div>
        </div>
      </div>
      
      <div className={styles.sectionsContainer}>
        <div className={styles.chartSection}>
          <h2 className={styles.sectionTitle}>İlerleme Grafiği</h2>
          <div className={styles.chartContainer}>
            <ProgressChart data={progressData} />
          </div>
        </div>
        
        <div className={styles.actionSection}>
          <div className={styles.actionCard}>
            <FontAwesomeIcon icon={faVrCardboard} className={styles.actionIcon} />
            <h3>VR Egzersiz</h3>
            <p>VR gözlüğünüzü takın ve bugünkü egzersizlerinizi tamamlayın.</p>
            <button className={styles.actionButton}>Egzersizlere Başla</button>
          </div>
          
          <div className={styles.actionCard}>
            <FontAwesomeIcon icon={faInfoCircle} className={styles.actionIcon} />
            <h3>Nasıl Çalışır?</h3>
            <p>VR rehabilitasyon sistemimizin kullanımı hakkında rehberimizi inceleyebilirsiniz.</p>
            <button className={styles.actionButton}>Rehberi Aç</button>
          </div>
          
          <div className={styles.actionCard}>
            <FontAwesomeIcon icon={faPlayCircle} className={styles.actionIcon} />
            <h3>VR Uygulamasını İndir</h3>
            <p>En güncel VR uygulamamızı cihazınıza indirip kurabilirsiniz.</p>
            <button className={styles.actionButton}>İndirmeye Başla</button>
          </div>
        </div>
      </div>
    </div>
  );
}
