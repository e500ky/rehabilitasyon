'use client';

import { useAuth } from '@/context/AuthContext';
import authService from '@/lib/services/authService';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import styles from './Navigation.module.css';

const Navigation: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const { currentUser, checkAuth } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  const handleSignOut = async () => {
    try {
      await authService.signOut();
      await checkAuth();
      router.push('/');
    } catch (error) {
      console.error('Oturum kapatma hatası:', error);
    }
  };

  return (
    <nav className={styles.navigation}>
      <div className={styles.menuButton} onClick={toggleMenu}>
        <span className={styles.menuIcon}></span>
        <span className={styles.menuIcon}></span>
        <span className={styles.menuIcon}></span>
      </div>
      
      <ul className={`${styles.navLinks} ${isMenuOpen ? styles.active : ''}`}>
        <li className={styles.navItem}>
          <Link href="/" className={styles.navLink}>Ana Sayfa</Link>
        </li>
        <li className={styles.navItem}>
          <Link href="/hakkimizda" className={styles.navLink}>Hakkımızda</Link>
        </li>
        <li className={styles.navItem}>
          <Link href="/iletisim" className={styles.navLink}>İletişim</Link>
        </li>
        
        {!currentUser ? (
          <>
            <li className={styles.navItem}>
              <Link href="/kayit-ol" className={`${styles.navLink} ${styles.authLink}`}>Kayıt Ol</Link>
            </li>
            <li className={styles.navItem}>
              <Link href="/oturum-ac" className={`${styles.navLink} ${styles.authLink} ${styles.loginLink}`}>Oturum Aç</Link>
            </li>
          </>
        ) : (
          <>
            <li className={styles.navItem}>
              <Link href="/profil" className={`${styles.navLink} ${styles.authLink}`}>
                {currentUser.displayName || 'Profilim'}
              </Link>
            </li>
            <li className={styles.navItem}>
              <button onClick={handleSignOut} className={`${styles.navLink} ${styles.authLink} ${styles.logoutButton}`}>
                Çıkış Yap
              </button>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navigation;
