'use client';

import { useAuth } from '@/context/AuthContext';
import React, { ReactNode, useEffect, useState } from 'react';
import Sidebar from '../Sidebar';
import styles from './DashboardLayout.module.css';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { currentUser } = useAuth();
  const [isMobileView, setIsMobileView] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Check if we're on mobile view
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobileView(window.innerWidth <= 992);
      if (window.innerWidth <= 992) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    // Initial check
    checkIfMobile();

    // Add event listener
    window.addEventListener('resize', checkIfMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (!currentUser) {
    return <div className={styles.loading}>Yükleniyor...</div>;
  }

  return (
    <div className={styles.dashboardLayout}>
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} isMobileView={isMobileView} />
      <div className={`${styles.content} ${sidebarOpen && !isMobileView ? styles.withSidebar : ''}`}>
        <main className={styles.main}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
