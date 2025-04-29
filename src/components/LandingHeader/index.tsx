'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBars,
  faTimes,
  faArrowRight,
  faUserCircle
} from '@fortawesome/free-solid-svg-icons';
import styles from './LandingHeader.module.css';

const LandingHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
      <div className={styles.headerContainer}>
        <div className={styles.logoContainer}>
          <Link href="/">
            <Image src="/logo.png" alt="Rehabilitasyon Logo" width={130} height={45} />
          </Link>
        </div>

        <div className={styles.mobileMenuButton} onClick={toggleMenu}>
          <FontAwesomeIcon icon={isMenuOpen ? faTimes : faBars} />
        </div>

        <nav className={`${styles.nav} ${isMenuOpen ? styles.mobileMenuOpen : ''}`}>
          <ul className={styles.navLinks}>
            <li>
              <Link href="/" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>
                Ana Sayfa
              </Link>
            </li>
            <li>
              <Link href="/cozumlerimiz" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>
                Çözümlerimiz
              </Link>
            </li>
            <li>
              <Link href="/bilimsel-arastirma" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>
                Bilimsel Araştırma
              </Link>
            </li>
            <li>
              <Link href="/hakkimizda" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>
                Hakkımızda
              </Link>
            </li>
            <li>
              <Link href="/iletisim" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>
                İletişim
              </Link>
            </li>
          </ul>

          <div className={styles.authLinks}>
            {currentUser ? (
              <Link href="/dashboard" className={styles.dashboardButton} onClick={() => setIsMenuOpen(false)}>
                <FontAwesomeIcon icon={faUserCircle} className={styles.userIcon} />
                <span>Dashboard</span>
              </Link>
            ) : (
              <>
                <Link href="/oturum-ac" className={styles.loginButton} onClick={() => setIsMenuOpen(false)}>
                  Giriş Yap
                </Link>
                <Link href="/kayit-ol" className={styles.signupButton} onClick={() => setIsMenuOpen(false)}>
                  Kayıt Ol
                  <FontAwesomeIcon icon={faArrowRight} className={styles.arrowIcon} />
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default LandingHeader;
