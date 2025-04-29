'use client';

import authService, { User } from '@/lib/services/authService';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Kullanıcı oturum durumunu kontrol et
  const checkAuth = async () => {
    setLoading(true);
    try {
      const user = await authService.getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      console.error('Kullanıcı durumu kontrol hatası:', error);
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };

  // İlk yükleme sırasında kullanıcı durumunu kontrol et
  useEffect(() => {
    checkAuth();
  }, []);

  const value = {
    currentUser,
    loading,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
