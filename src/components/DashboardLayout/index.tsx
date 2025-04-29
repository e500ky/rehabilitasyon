'use client';

import { useAuth } from '@/context/AuthContext';
import React, { ReactNode } from 'react';
import Sidebar from '../Sidebar';
import styles from './DashboardLayout.module.css';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <div className={styles.loading}>Yükleniyor...</div>;
  }

  return (
    <div className={styles.dashboardLayout}>
      <Sidebar />
      <div className={styles.content}>
        <main className={styles.main}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
