'use client';

import authService from '@/lib/services/authService';
import { faHouse, faInfo, faPhone } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import styles from './Navigation.module.css';
interface NavigationProps {
  isAuthenticated: boolean;
}

const Navigation: React.FC<NavigationProps> = ({ isAuthenticated }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  const handleSignOut = async () => {
    try {
      await authService.signOut();
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
          <Link href="/" className={styles.navLink}><FontAwesomeIcon icon={faHouse} className={styles.homeIcon} /> Ana Sayfa</Link>
        </li>
        <li className={styles.navItem}>
          <Link href="/hakkimizda" className={styles.navLink}><FontAwesomeIcon icon={faInfo} className={styles.homeIcon} />Hakkımızda</Link>
        </li>
        <li className={styles.navItem}>
          <Link href="/iletisim" className={styles.navLink}><FontAwesomeIcon icon={faPhone} className={styles.homeIcon} />İletişim</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navigation;
