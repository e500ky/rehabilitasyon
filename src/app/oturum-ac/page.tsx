'use client';

import PasswordInput from '@/components/PasswordInput';
import ReCaptcha from '@/components/ReCaptcha';
import { useAuth } from '@/context/AuthContext';
import authService from '@/lib/services/authService';
import {
  faArrowLeft,
  faEnvelope,
  faExclamationTriangle,
  faLock,
  faSignInAlt
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import styles from './oturum-ac.module.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
  const router = useRouter();
  const { currentUser } = useAuth();
  
  useEffect(() => {
    if (currentUser) {
      router.push('/dashboard');
    }
  }, [currentUser, router]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleCaptchaVerify = (token: string) => {
    if (token) {
      setCaptchaToken(token);
      setIsCaptchaVerified(true);
    } else {
      setCaptchaToken(null);
      setIsCaptchaVerified(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Lütfen email ve şifre alanlarını doldurun.');
      return;
    }

    const hasCaptchaToken = captchaToken !== null;
    
    if (!hasCaptchaToken && process.env.NODE_ENV !== 'development') {
      setError("Lütfen 'Ben robot değilim' doğrulamasını tamamlayın.");
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      await authService.login({
        email,
        password,
        captchaToken: captchaToken || undefined
      });
      
      router.push('/dashboard');
    } catch (error: any) {
      console.error("Login error:", error);
      
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setError('E-posta adresi veya şifre hatalı.');
      } else if (error.code === 'auth/invalid-email') {
        setError('Geçersiz e-posta adresi.');
      } else if (error.code === 'auth/too-many-requests') {
        setError('Çok fazla başarısız giriş denemesi. Lütfen daha sonra tekrar deneyin veya şifrenizi sıfırlayın.');
      } else {
        setError('Giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Şifre sıfırlamak için e-posta adresinizi girin');
      return;
    }

    try {
      await authService.sendPasswordReset(email);
      alert('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi');
    } catch (err: any) {
      setError(err.message || 'Şifre sıfırlama hatası');
    }
  };

  return (
    <main className={styles.main}>
      <Link href="/" className={styles.backButton}>
        <FontAwesomeIcon icon={faArrowLeft} className={styles.backIcon} />
        <span>Ana Sayfaya Dön</span>
      </Link>
      
      <div className={styles.formContainer}>
        <h1 className={styles.title}>Oturum Aç</h1>
        
        {error && (
          <div className={styles.error}>
            <FontAwesomeIcon icon={faExclamationTriangle} className={styles.errorIcon} />
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="email">
              <FontAwesomeIcon icon={faEnvelope} className={styles.inputIcon} />
              E-posta
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="E-posta adresiniz"
              className={styles.inputWithIcon}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="password">
              <FontAwesomeIcon icon={faLock} className={styles.inputIcon} />
              Şifre
            </label>
            <PasswordInput
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={styles.inputWithIcon}
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
          
          <ReCaptcha onVerify={handleCaptchaVerify} />
          
          <button 
            type="submit" 
            className={styles.submitButton} 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span>Giriş Yapılıyor...</span>
              </>
            ) : (
              <>
                <span>Giriş Yap</span>
                <FontAwesomeIcon icon={faSignInAlt} className={styles.buttonIcon} />
              </>
            )}
          </button>
        </form>
        
        <div className={styles.linkContainer}>
          Hesabınız yok mu? <Link href="/kayit-ol">Kayıt Ol</Link>
        </div>
      </div>
    </main>
  );
}
