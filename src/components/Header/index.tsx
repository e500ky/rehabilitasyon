'use client';

import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import Navigation from '../Navigation';
import styles from './Header.module.css';

const Header: React.FC = () => {
  const { currentUser } = useAuth();
  
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logoContainer}>
          <Link href="/">
            <Image 
              src="/logo.png" 
              alt="Rehabilitasyon Logo" 
              width={60} 
              height={60} 
              className={styles.logo}
              priority
            />
          </Link>
        </div>
        <Navigation isAuthenticated={!!currentUser} />
      </div>
    </header>
  );
};

export default Header;
