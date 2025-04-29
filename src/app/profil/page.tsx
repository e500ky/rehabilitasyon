'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import styles from './profil.module.css';

export default function Profile() {
  const { currentUser, loading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!loading && !currentUser) {
      // Kullanıcı giriş yapmamışsa oturum açma sayfasına yönlendir
      router.push('/oturum-ac');
    }
  }, [currentUser, loading, router]);

  if (loading || !currentUser) {
    return (
      <div className={styles.loadingContainer}>
        <p>Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.profileContainer}>
        <h1 className={styles.title}>Profil Bilgileri</h1>
        
        <div className={styles.profileInfo}>
          <div className={styles.profileItem}>
            <span className={styles.label}>Ad Soyad:</span>
            <span className={styles.value}>{currentUser.displayName || 'Belirtilmemiş'}</span>
          </div>
          
          <div className={styles.profileItem}>
            <span className={styles.label}>E-posta:</span>
            <span className={styles.value}>{currentUser.email}</span>
          </div>
          
          <div className={styles.profileItem}>
            <span className={styles.label}>E-posta Doğrulaması:</span>
            <span className={styles.value}>
              {currentUser.emailVerified ? 'Doğrulanmış' : 'Doğrulanmamış'}
            </span>
          </div>
          
          <div className={styles.profileItem}>
            <span className={styles.label}>Hesap Oluşturma Tarihi:</span>
            <span className={styles.value}>
              {new Date(currentUser.metadata.creationTime).toLocaleDateString('tr-TR')}
            </span>
          </div>
        </div>
        
        <div className={styles.actionsContainer}>
          <button className={styles.actionButton}>
            Profili Düzenle
          </button>
          
          {!currentUser.emailVerified && (
            <button className={styles.actionButton}>
              E-posta Doğrulama Gönder
            </button>
          )}
          
          <button className={styles.passwordButton}>
            Şifremi Değiştir
          </button>
        </div>
      </div>
    </div>
  );
}
