'use client';

import ReCaptcha from '@/components/ReCaptcha';
import { useAuth } from '@/context/AuthContext';
import authService from '@/lib/services/authService';
import {
  faArrowLeft,
  faEnvelope,
  faExclamationTriangle,
  faLock,
  faUser,
  faUserInjured,
  faUserMd
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import styles from './kayit-ol.module.css';

export default function RegisterPage() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | React.ReactNode>(null);
  const [userType, setUserType] = useState('patient'); // 'patient' veya 'caregiver'
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

  const validateForm = () => {
    if (!displayName.trim()) {
      setError("Ad Soyad alanı boş bırakılamaz.");
      return false;
    }

    if (!validateEmail(email)) {
      setError("Lütfen geçerli bir e-posta adresi girin.");
      return false;
    }

    if (password.length < 6) {
      setError("Şifre en az 6 karakter olmalıdır.");
      return false;
    }

    if (password !== confirmPassword) {
      setError("Şifreler eşleşmiyor.");
      return false;
    }

    return true;
  };

  const handleCaptchaVerify = (token: string) => {
    // Herhangi bir token alındıysa veya fallback token ise kabul et
    if (token) {
      console.log("reCAPTCHA doğrulama başarılı");
      setCaptchaToken(token);
      setIsCaptchaVerified(true);
    } else {
      console.log("reCAPTCHA doğrulama başarısız");
      setCaptchaToken(null);
      setIsCaptchaVerified(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Form validasyonu
    if (!validateForm()) return;
    
    // Daha esnek captcha kontrolü
    const hasCaptchaToken = captchaToken !== null;
    
    // Geliştirme modunda veya token varsa devam et
    if (!hasCaptchaToken && process.env.NODE_ENV !== 'development') {
      setError("Lütfen 'Ben robot değilim' doğrulamasını tamamlayın.");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // AuthService ile kayıt ol
      const userData = {
        email,
        password,
        displayName,
        userType: userType as 'patient' | 'caregiver',
        captchaToken: captchaToken || undefined
      };
      
      await authService.register(userData);
      
      router.push('/dashboard');
    } catch (error: any) {
      console.error("Register error:", error);
      if (error.code === 'auth/email-already-in-use') {
        setError(
          <div className={styles.emailExistsError}>
            <p>Bu e-posta adresi zaten kullanılıyor.</p>
            <p>Hesabınız var ise <Link href="/oturum-ac" className={styles.loginLink}>buradan giriş yapabilirsiniz</Link>.</p>
          </div>
        );
      } else if (error.code === 'auth/invalid-email') {
        setError('Geçersiz e-posta adresi.');
      } else if (error.code === 'auth/weak-password') {
        setError('Şifre en az 6 karakter olmalıdır.');
      } else {
        setError('Kayıt işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <main className={styles.main}>
      <Link href="/" className={styles.backButton}>
        <FontAwesomeIcon icon={faArrowLeft} className={styles.backIcon} />
        <span>Ana Sayfaya Dön</span>
      </Link>
      
      <div className={styles.formContainer}>
        <h1 className={styles.title}>Kayıt Ol</h1>
        
        {error && (
          <div className={styles.errorMessage}>
            <FontAwesomeIcon icon={faExclamationTriangle} className={styles.errorIcon} />
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="name">
              <FontAwesomeIcon icon={faUser} className={styles.inputIcon} />
              Ad Soyad
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              placeholder="Ad Soyad"
              className={styles.inputWithIcon}
            />
          </div>
          
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
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="En az 6 karakter"
              className={styles.inputWithIcon}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword">
              <FontAwesomeIcon icon={faLock} className={styles.inputIcon} />
              Şifre Tekrar
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Şifrenizi tekrar girin"
              className={styles.inputWithIcon}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Hesap Türü</label>
            <div className={styles.userTypeContainer}>
              <div 
                className={`${styles.userTypeOption} ${userType === 'patient' ? styles.active : ''}`}
                onClick={() => setUserType('patient')}
              >
                <FontAwesomeIcon icon={faUserInjured} className={styles.userTypeIcon} />
                <div>
                  <h3>Hasta</h3>
                  <p>Rehabilitasyon için kayıt olun</p>
                </div>
              </div>
              
              <div 
                className={`${styles.userTypeOption} ${userType === 'caregiver' ? styles.active : ''}`}
                onClick={() => setUserType('caregiver')}
              >
                <FontAwesomeIcon icon={faUserMd} className={styles.userTypeIcon} />
                <div>
                  <h3>Bakıcı</h3>
                  <p>Hastaları yönetmek için kayıt olun</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* reCAPTCHA bileşeni */}
          <ReCaptcha onVerify={handleCaptchaVerify} />
          
          <button 
            type="submit" 
            className={styles.submitButton} 
            disabled={loading}
          >
            {loading ? 'Kaydediliyor...' : 'Kayıt Ol'}
          </button>
        </form>
        
        <div className={styles.linkContainer}>
          Zaten hesabınız var mı? <Link href="/oturum-ac">Oturum aç</Link>
        </div>
      </div>
    </main>
  );
}
