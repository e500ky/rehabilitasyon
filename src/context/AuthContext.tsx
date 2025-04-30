'use client';

import { createUserWithEmailAndPassword, EmailAuthProvider, updateEmail as firebaseUpdateEmail, updatePassword as firebaseUpdatePassword, onAuthStateChanged, reauthenticateWithCredential, sendPasswordResetEmail, signInWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../lib/firebase';
import firestoreService from '../lib/services/firestoreService';

interface AuthContextType {
  currentUser: User | null;
  signup: (email: string, password: string, userData: any) => Promise<any>;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateEmail: (newEmail: string) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  reloadUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const signup = async (email: string, password: string, userData: any) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    await firestoreService.createUserProfile(user.uid, {
      ...userData,
      email: email,
      uid: user.uid
    });
    
    return userCredential;
  };

  const login = (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = () => {
    return signOut(auth);
  };

  const resetPassword = (email: string) => {
    return sendPasswordResetEmail(auth, email);
  };
  
  const updateEmail = async (newEmail: string) => {
    if (!currentUser) throw new Error("Oturum açık değil");
    return await firebaseUpdateEmail(currentUser, newEmail);
  };

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    if (!currentUser) throw new Error("Oturum açık değil");
    if (!currentUser.email) throw new Error("E-posta adresi bulunamadı");
    
    const credential = EmailAuthProvider.credential(
      currentUser.email,
      currentPassword
    );
    
    await reauthenticateWithCredential(currentUser, credential);
    
    return await firebaseUpdatePassword(currentUser, newPassword);
  };

  const reloadUser = async () => {
    if (currentUser) {
      await currentUser.reload();
      setCurrentUser({ ...currentUser });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    logout,
    resetPassword,
    updateEmail,
    updatePassword,
    reloadUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
