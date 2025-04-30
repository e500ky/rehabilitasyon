'use client';

import { useAuth } from '@/context/AuthContext';
import authService from '@/lib/services/authService';
import Image from 'next/image';
import Link from 'next/link';
import router from 'next/router';
import React from 'react';
import Navigation from '../Navigation';
import ThemeToggle from '../ThemeToggle';
import styles from './Header.module.css';

const Header: React.FC = () => {
  const { currentUser } = useAuth();
  
  console.log('Header: Kullanıcı durumu:', !!currentUser);

  const handleSignOut = async () => {
    try {
      await authService.signOut();
      router.push('/');
    } catch (error) {
      console.error('Oturum kapatma hatası:', error);
    }
  };

  
  return (
    <header className={styles.header}>
      <div className={styles.mainHeader}>
        <div className={styles.container}>          <div className={styles.logoContainer}>
            <Link href="/" style={{ width: '200px'}}>
              <Image 
                src="/logo.png" 
                alt="VR Rehabilitasyon Logo" 
                width={45} 
                height={45} 
                className={styles.logo}
                priority
              />
            </Link>
          </div>
          
          <Navigation isAuthenticated={!!currentUser} />
            {currentUser ? (
            <div className={styles.themeToggleContainer}>
              <ThemeToggle />
            </div>
          ) : (
            <div style={{ marginRight: '10px', fontSize: '0.8rem', color: 'var(--text-light)' }}>
              {/* Oturum açık değil, tema butonu görünmüyor */}
            </div>
          )}
          
          {!currentUser ? (
          <>
              <div>
                <Link href="/kayit-ol" className={`${styles.navLink} ${styles.authLink}`}>Kayıt Ol</Link>
                <Link href="/oturum-ac" className={`${styles.navLink} ${styles.authLink} ${styles.loginLink}`}>Oturum Aç</Link>
            </div>
          </>
        ) : (
          <>
            <li className={styles.navItem}>
              <Link href="/profil" className={`${styles.navLink} ${styles.authLink}`}>Profilim</Link>
            </li>
            <li className={styles.navItem}>
              <button onClick={handleSignOut} className={`${styles.navLink} ${styles.authLink} ${styles.logoutButton}`}>
                Çıkış Yap
              </button>
            </li>
          </>
        )}
        </div>
      </div>
    </header>
  );
};

export default Header;
