'use client';

import PasswordInput from '@/components/PasswordInput';
import ReCaptcha from '@/components/ReCaptcha';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/lib/firebase';
import authService from '@/lib/services/authService';
import {
  faArrowLeft,
  faCheck,
  faEnvelope,
  faExclamationTriangle,
  faLock,
  faPhone,
  faUser,
  faUserInjured,
  faUserMd
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { RecaptchaVerifier } from 'firebase/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import styles from './kayit-ol.module.css';

// Firebase hata türünü tanımla
interface FirebaseError {
  code: string;
  message: string;
}

export default function RegisterPage() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | React.ReactNode>(null);
  const [userType, setUserType] = useState('patient');   const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const router = useRouter();
  const { currentUser } = useAuth();
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  
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
  };  // Telefon doğrulama kodu gönderme fonksiyonu
  const sendPhoneVerification = async () => {
    try {
      setVerifying(true);
      setError(null);
      
      // Telefon numarasını formatlama (Türkiye için başında +90 olmalı)
      let formattedPhoneNumber = phoneNumber.trim();
      
      // Telefon numarası 0 ile başlıyorsa, 0'ı kaldır
      if (formattedPhoneNumber.startsWith('0')) {
        formattedPhoneNumber = formattedPhoneNumber.substring(1);
      }
      
      // Telefon numarasının başında + yoksa, başına +90 ekle
      if (!formattedPhoneNumber.startsWith('+')) {
        formattedPhoneNumber = `+90${formattedPhoneNumber.replace(/\D/g, '')}`;
      }
      
      console.log("Doğrulama kodu gönderilecek numara:", formattedPhoneNumber);
      
      let verificationId = '';
      
      // Geliştirme ortamında test için
      if (process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost') {
        console.log('Geliştirme ortamında telefon doğrulama simülasyonu yapılıyor...');
        try {
          // Geliştirme ortamında sahte bir doğrulama ID'si kullan
          verificationId = await authService.sendPhoneVerificationCode(formattedPhoneNumber, null as any);
          console.log("Geliştirme ortamı - doğrulama ID alındı:", verificationId.substring(0, 5) + "...");
        } catch (devError) {
          console.error("Geliştirme ortamında hata:", devError);
          verificationId = 'mock-verification-id-' + Date.now();
        }
      } else {
        // Üretim ortamında gerçek doğrulama kullan
        
        // Varsa mevcut recaptchaVerifier'ı temizle
        if (recaptchaVerifierRef.current) {
          try {
            recaptchaVerifierRef.current.clear();
          } catch (e) {
            console.error("RecaptchaVerifier temizleme hatası:", e);
          }
          recaptchaVerifierRef.current = null;
        }
        
        try {
          // Yeni RecaptchaVerifier oluştur
          recaptchaVerifierRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
            size: 'invisible',
            callback: (response: string) => {
              console.log("reCAPTCHA doğrulandı! Token uzunluğu:", response ? response.length : 0);
            },
            'expired-callback': () => {
              console.log("reCAPTCHA süresi doldu");
              setError("reCAPTCHA doğrulama süresi doldu. Lütfen sayfayı yenileyip tekrar deneyin.");
            }
          });
          
          console.log("RecaptchaVerifier oluşturuldu, render ediliyor...");
          await recaptchaVerifierRef.current.render();
          console.log("RecaptchaVerifier render edildi");
          
          // Doğrulama kodunu gönder
          console.log("SMS gönderiliyor: ", formattedPhoneNumber);
          verificationId = await authService.sendPhoneVerificationCode(formattedPhoneNumber, recaptchaVerifierRef.current);
          console.log("Doğrulama ID alındı:", verificationId.substring(0, 5) + "...");
        } catch (recaptchaError) {
          console.error("reCAPTCHA veya SMS hatası:", recaptchaError);
          
          if (recaptchaError instanceof Error && 
              (recaptchaError.message.includes("missing-app-credential") || 
               recaptchaError.message.includes("app-not-authorized"))) {
            setError("SMS gönderimi şu anda kullanılamıyor. Lütfen geliştirmemize başvurun.");
            throw recaptchaError;
          }
          
          // Geliştirme ortamında olduğumuzu varsay ve devam et
          console.warn("SMS doğrulama hatası, geliştirici moduna geçiliyor");
          verificationId = 'error-verification-id-' + Date.now();
        }
      }
      
      setVerificationId(verificationId);
      setShowPhoneVerification(true);    } catch (error) {
      console.error("Telefon doğrulama kodu gönderme hatası:", error);
      
      // Hata detaylarını loglama ve kullanıcıya gösterme
      let errorMessage = "Telefon numarasına doğrulama kodu gönderilirken bir hata oluştu.";
      
      if (error instanceof Error) {
        console.error("Hata detayları:", error.message);
        
        // Hata türlerine göre özel mesajlar
        if (error.message.includes("reCAPTCHA")) {
          errorMessage = "reCAPTCHA doğrulaması başarısız oldu. Lütfen sayfayı yenileyip tekrar deneyin.";
        } else if (error.message.includes("quota")) {
          errorMessage = "SMS kotası aşıldı. Lütfen daha sonra tekrar deneyin.";
        } else if (error.message.includes("invalid-phone-number")) {
          errorMessage = "Geçersiz telefon numarası formatı. Lütfen numarayı kontrol edip tekrar deneyin.";
        } else if (error.message.includes("app-not-authorized")) {
          errorMessage = "Uygulama SMS doğrulaması için yetkilendirilmemiş. Lütfen yöneticiyle iletişime geçin.";
        }
      }
      
      setError(errorMessage);
    } finally {
      setVerifying(false);
    }
  };

  // Telefon doğrulama kodunu kontrol etme fonksiyonu
  const verifyPhoneCode = async () => {
    try {
      setVerifying(true);
      setError(null);
      
      // userId olmadığı için geçici olarak "temp" kullanıyoruz, kayıt sonrası güncellenecek
      const isVerified = await authService.verifyPhoneCode(verificationId, verificationCode, "temp");
      
      if (isVerified) {
        setPhoneVerified(true);
        setShowPhoneVerification(false);
      } else {
        setError("Girdiğiniz doğrulama kodu hatalı. Lütfen tekrar deneyin.");
      }
    } catch (error) {
      console.error("Telefon doğrulama hatası:", error);
      setError("Doğrulama kodu kontrol edilirken bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setVerifying(false);
    }
  };
  const handleCaptchaVerify = (token: string) => {
    if (token) {
      setCaptchaToken(token);
    } else {
      setCaptchaToken(null);
    }
  };
  
  // RecaptchaVerifier'ı temizleyen useEffect
  useEffect(() => {
    return () => {
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch (e) {
          console.error("RecaptchaVerifier temizleme hatası:", e);
        }
        recaptchaVerifierRef.current = null;
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const hasCaptchaToken = captchaToken !== null;
    
    if (!hasCaptchaToken && process.env.NODE_ENV !== 'development') {
      setError("Lütfen 'Ben robot değilim' doğrulamasını tamamlayın.");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const userData = {
        email,
        password,
        displayName,
        phoneNumber: phoneNumber.startsWith('+') ? phoneNumber : `+90${phoneNumber.replace(/\D/g, '')}`,
        userType: userType as 'patient' | 'caregiver',
        captchaToken: captchaToken || undefined
      };
      
      const user = await authService.register(userData);
      
      // Eğer kullanıcı telefon numarası doğruladıysa, kayıt sonrası verificationId'yi güncelle
      if (phoneVerified && verificationId) {
        await authService.verifyPhoneCode(verificationId, verificationCode, user.uid);
      }
      
      // Email doğrulama bağlantısını gönder
      await authService.sendEmailVerificationLink(user.uid);
      
      router.push('/dashboard');
    } catch (error) {
      console.error("Register error:", error);
      const firebaseError = error as FirebaseError;
      if (firebaseError.code === 'auth/email-already-in-use') {
        setError(
          <div className={styles.emailExistsError}>
            <p>Bu e-posta adresi zaten kullanılıyor.</p>
            <p>Hesabınız var ise <Link href="/oturum-ac" className={styles.loginLink}>buradan giriş yapabilirsiniz</Link>.</p>
          </div>
        );
      } else if (firebaseError.code === 'auth/invalid-email') {
        setError('Geçersiz e-posta adresi.');
      } else if (firebaseError.code === 'auth/weak-password') {
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
              className={styles.emailInput}
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
            <label htmlFor="phoneNumber">
              <FontAwesomeIcon icon={faPhone} className={styles.inputIcon} />
              Telefon
            </label>
            <div className={styles.phoneVerificationContainer}>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Telefon numaranız (5XX XXX XX XX)"
                className={styles.inputWithIcon}
                disabled={phoneVerified}
              />
              {!showPhoneVerification && !phoneVerified && (
                <button 
                  type="button" 
                  className={styles.verifyButton} 
                  onClick={() => sendPhoneVerification()}
                  disabled={!phoneNumber || phoneNumber.length < 10 || verifying}
                >
                  {verifying ? 'Gönderiliyor...' : 'Doğrula'}
                </button>
              )}
              {phoneVerified && (
                <div className={styles.verifiedBadge}>
                  <FontAwesomeIcon icon={faCheck} className={styles.verifiedIcon} />
                  Doğrulandı
                </div>
              )}
            </div>
            {showPhoneVerification && !phoneVerified && (
              <div className={styles.verificationCodeContainer}>
                <input
                  type="text"
                  placeholder="Doğrulama kodunu girin"
                  className={styles.verificationCodeInput}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                />
                <button 
                  type="button" 
                  className={styles.verifyCodeButton} 
                  onClick={() => verifyPhoneCode()}
                  disabled={!verificationCode || verificationCode.length < 6}
                >
                  Kodu Doğrula
                </button>
              </div>
            )}
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
          
          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword">
              <FontAwesomeIcon icon={faLock} className={styles.inputIcon} />
              Şifre Tekrar
            </label>
            <PasswordInput
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Şifreyi tekrar girin"
              required
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
                  <h3>Kullanıcı</h3>
                  <p>Hastaları yönetmek için kayıt olun</p>
                </div>
              </div>
            </div>
          </div>            {/* reCAPTCHA bileşeni - form doğrulama için */}
          <ReCaptcha onVerify={handleCaptchaVerify} />
          
          {/* Telefon doğrulama için görünmez reCAPTCHA container */}
          <div id="recaptcha-container" className={styles.recaptchaContainer}></div>
          
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
