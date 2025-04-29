'use client';

import { useAuth } from '@/context/AuthContext';
import { faClock, faInfoCircle, faUsers } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa';
import styles from './Footer.module.css';

const Footer: React.FC = () => {
  const { currentUser } = useAuth();
  
  // Kullanıcı giriş yapmışsa footer'ı gösterme
  if (currentUser) return null;
  
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <div className={styles.footerSection}>
          <h3><FontAwesomeIcon icon={faInfoCircle} className={styles.footerIcon} /> İletişim</h3>
          <p>Adres: Reşadiye, Erzurum Caddesi, 61750 Maçka/Trabzon</p>
          <p>Telefon: (0462) 512 11 87</p>
          <p>Email: trabzonfth1@saglik.gov.tr</p>
        </div>
        <div className={styles.footerSection}>
          <h3><FontAwesomeIcon icon={faClock} className={styles.footerIcon} /> Çalışma Saatleri</h3>
          <p>Pazartesi - Cuma: 08:00 - 16:30</p>
          <p>Cumartesi: Kapalı</p>
          <p>Pazar: Kapalı</p>
        </div>
        <div className={styles.footerSection}>
          <h3><FontAwesomeIcon icon={faUsers} className={styles.footerIcon} /> Bizi Takip Edin</h3>
          <div className={styles.socialIcons}>
            <a href="#" className={styles.socialIcon}>
              <FaFacebook size={24} color='#4dabf7'/>
            </a>
            <a href="#" className={styles.socialIcon}>
              <FaTwitter size={24} color='#4dabf7'/>
            </a>
            <a href="#" className={styles.socialIcon}>
              <FaInstagram size={24} color='#4dabf7'/>
            </a>
          </div>
        </div>
      </div>
      <div className={styles.copyright}>
        <p>© 2025 RWA. Tüm Hakları Saklıdır.</p>
      </div>
    </footer>
  );
};

export default Footer;
