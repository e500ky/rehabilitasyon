'use client';

import { useAuth } from '@/context/AuthContext';
import authService from '@/lib/services/authService';
import firestoreService from '@/lib/services/firestoreService'; 
import { UserProfile } from '@/types/user'; 
import {
  faBars,
  faCalendarAlt,
  faCog,
  faHome,
  faSignOutAlt,
  faTimes,
  faUserCircle
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'; 
import styles from './Sidebar.module.css';

const Sidebar: React.FC = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { currentUser } = useAuth();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null); 
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (currentUser) {
        setIsLoadingProfile(true);
        try {
          const profile = await firestoreService.getUserProfile(currentUser.uid);
          setUserProfile(profile);
        } catch (error) {
          console.error("Sidebar: Kullanıcı profili alınamadı:", error);
          setUserProfile(null); 
        } finally {
          setIsLoadingProfile(false);
        }
      } else {
        setUserProfile(null);
        setIsLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [currentUser]);

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const handleSignOut = async () => {
    try {
      await authService.signOut();
      router.push('/');
    } catch (error) {
      console.error('Oturum kapatma hatası:', error);
    }
  };

  const caregiverLinks = [
    { href: "/dashboard", text: "Ana Sayfa", icon: faHome },
    { href: "/randevular", text: "Randevular", icon: faCalendarAlt },
    { href: "/ayarlar", text: "Ayarlar", icon: faCog },
  ];

  const patientLinks = [
    { href: "/dashboard", text: "Ana Sayfa", icon: faHome },
    { href: "/randevularim", text: "Randevularım", icon: faCalendarAlt },
    { href: "/ayarlar", text: "Ayarlar", icon: faCog },
  ];

  const linksToShow = isLoadingProfile
    ? []
    : userProfile?.userType === 'caregiver'
    ? caregiverLinks
    : userProfile?.userType === 'patient'
    ? patientLinks
    : [];

  return (
    <>
      <div className={styles.mobileToggle} onClick={toggleMobileSidebar}>
        <FontAwesomeIcon icon={isMobileOpen ? faTimes : faBars} />
      </div>
      
      <div className={`
        ${styles.sidebar} 
        ${isMobileOpen ? styles.mobileOpen : ''}
      `}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logoContainer}>
            <Link href="/dashboard">
              <Image 
                src="/logo.png" 
                alt="Rehabilitasyon Logo" 
                width={60}
                height={60} 
                className={styles.logo}
              />
            </Link>
          </div>
        </div>
        
        <div className={styles.userInfo}>
          <div className={styles.userAvatar}>
            <FontAwesomeIcon icon={faUserCircle} className={styles.avatarIcon} />
          </div>
          <div className={styles.userDetails}>
            <h3 className={styles.userName}>{currentUser?.displayName || 'Kullanıcı'}</h3>
            <p className={styles.userEmail}>{currentUser?.email}</p>
          </div>
        </div>
        
        <nav className={styles.sidebarNav}>
          {isLoadingProfile ? (
            <div className={styles.loadingNav}>Menü yükleniyor...</div>
          ) : (
            <ul className={styles.navList}>
              {linksToShow.map(link => ( 
                <li className={styles.navItem} key={link.href}>
                  <Link href={link.href} className={styles.navLink} onClick={() => setIsMobileOpen(false)}> 
                    <FontAwesomeIcon icon={link.icon} className={styles.navIcon} />
                    <span>{link.text}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </nav>
        
        <div className={styles.sidebarFooter}>
          <button className={styles.logoutButton} onClick={handleSignOut}>
            <FontAwesomeIcon icon={faSignOutAlt} className={styles.logoutIcon} />
            <span>Çıkış Yap</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
