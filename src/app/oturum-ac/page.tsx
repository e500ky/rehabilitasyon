'use client';

import { useAuth } from '@/context/AuthContext';
import authService from '@/lib/services/authService';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import styles from './oturum-ac.module.css';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { checkAuth } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    
    try {
      setLoading(true);
      await authService.signIn({
        email: formData.email,
        password: formData.password
      });
      
      // Auth durumunu güncelle
      await checkAuth();
      
      // Başarılı giriş sonrası ana sayfaya yönlendir
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Oturum açma hatası');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setError('Şifre sıfırlamak için e-posta adresinizi girin');
      return;
    }

    try {
      await authService.sendPasswordReset(formData.email);
      alert('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi');
    } catch (err: any) {
      setError(err.message || 'Şifre sıfırlama hatası');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <h1 className={styles.title}>Oturum Aç</h1>
        
        {error && <div className={styles.error}>{error}</div>}
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="email">E-posta</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="E-posta adresiniz"
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="password">Şifre</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Şifreniz"
            />
          </div>
          
          <div className={styles.forgotPassword}>
            <button 
              type="button" 
              onClick={handleForgotPassword}
              className={styles.forgotButton}
            >
              Şifremi Unuttum
            </button>
          </div>
          
          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? 'Giriş yapılıyor...' : 'Oturum Aç'}
          </button>
        </form>
        
        <div className={styles.linkContainer}>
          Hesabınız yok mu? <Link href="/kayit-ol">Kayıt Ol</Link>
        </div>
      </div>
    </div>
  );
}
