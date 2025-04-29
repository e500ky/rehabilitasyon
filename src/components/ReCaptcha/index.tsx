'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './ReCaptcha.module.css';

interface ReCaptchaProps {
  onVerify: (token: string) => void;
  skipInDev?: boolean; // Geliştirme ortamında atlama seçeneği
}

const ReCaptcha = ({ onVerify, skipInDev = true }: ReCaptchaProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  // Geliştirme ortamında reCAPTCHA'yı atlama
  useEffect(() => {
    const isDev = process.env.NODE_ENV === 'development';
    if (skipInDev && isDev) {
      console.log('Geliştirme ortamında reCAPTCHA atlandı');
      onVerify('dev_mode_bypass_token');
      return;
    }
  }, [onVerify, skipInDev]);

  useEffect(() => {
    const isDev = process.env.NODE_ENV === 'development';
    if (skipInDev && isDev) return;

    // Doğrudan scripting kullanarak reCAPTCHA entegrasyonu
    const initializeRecaptcha = async () => {
      try {
        // Hata durumunda doğrudan bypass token döndür
        if (!siteKey) {
          console.error('reCAPTCHA site anahtarı bulunamadı');
          setError('reCAPTCHA yapılandırması eksik (.env.local dosyasını kontrol edin)');
          onVerify('missing_config_bypass_token');
          return;
        }

        // Daha önce yüklendiyse tekrar denemeden çık
        if (document.querySelector('script#recaptcha-script')) {
          console.log('reCAPTCHA scripti zaten yüklenmiş');
          return;
        }

        // Google reCAPTCHA callback fonksiyonlarını global scope'a ekle
        window.recaptchaCallback = (token: string) => {
          setLoading(false);
          console.log('reCAPTCHA başarıyla doğrulandı');
          onVerify(token);
        };

        window.recaptchaErrorCallback = () => {
          setLoading(false);
          setError('reCAPTCHA doğrulama hatası');
          console.error('reCAPTCHA doğrulama hatası oluştu');
          onVerify('error_bypass_token');
        };

        window.recaptchaExpiredCallback = () => {
          setLoading(false);
          setError('reCAPTCHA süresi doldu, lütfen tekrar deneyin');
          console.log('reCAPTCHA süresi doldu');
          onVerify('');
        };

        // reCAPTCHA div elementini oluştur
        if (containerRef.current) {
          containerRef.current.innerHTML = `
            <div class="g-recaptcha" 
              data-sitekey="${siteKey}" 
              data-callback="recaptchaCallback"
              data-expired-callback="recaptchaExpiredCallback"
              data-error-callback="recaptchaErrorCallback">
            </div>
          `;
        }

        // reCAPTCHA script ekle
        const script = document.createElement('script');
        script.id = 'recaptcha-script';
        script.src = 'https://www.google.com/recaptcha/api.js?render=explicit&onload=onRecaptchaLoad';
        script.async = true;
        document.head.appendChild(script);

        // reCAPTCHA hazır olduğunda render et
        window.onRecaptchaLoad = () => {
          try {
            if (window.grecaptcha && window.grecaptcha.render && containerRef.current) {
              const captchaElem = containerRef.current.querySelector('.g-recaptcha');
              if (captchaElem) {
                window.grecaptcha.render(captchaElem, {
                  sitekey: siteKey,
                  callback: window.recaptchaCallback,
                  'expired-callback': window.recaptchaExpiredCallback,
                  'error-callback': window.recaptchaErrorCallback
                });
              }
            }
          } catch (err) {
            console.error('reCAPTCHA render hatası:', err);
            setError('reCAPTCHA yüklenirken hata oluştu');
            onVerify('render_error_bypass_token');
          }
        };

        // Zaman aşımı kontrolü
        const timeout = setTimeout(() => {
          if (loading) {
            console.error('reCAPTCHA yükleme zaman aşımı');
            setError('reCAPTCHA yüklenirken zaman aşımına uğradı');
            onVerify('timeout_bypass_token');
          }
        }, 10000); // 10 saniye

        return () => clearTimeout(timeout);
      } catch (err) {
        console.error('reCAPTCHA başlatma hatası:', err);
        setError('reCAPTCHA başlatılamadı');
        onVerify('init_error_bypass_token');
      }
    };

    initializeRecaptcha();

    // Cleanup function
    return () => {
      delete window.recaptchaCallback;
      delete window.recaptchaErrorCallback;
      delete window.recaptchaExpiredCallback;
      delete window.onRecaptchaLoad;
    };
  }, [onVerify, siteKey, skipInDev]);

  // Geliştirme ortamında atlanırsa boş render
  if (process.env.NODE_ENV === 'development' && skipInDev) {
    return (
      <div className={styles.devModeNotice}>
        reCAPTCHA geliştirme modunda atlandı
      </div>
    );
  }

  // Hata durumunda hata mesajını göster
  if (error) {
    return (
      <div className={styles.recaptchaError}>
        <p>{error}</p>
        <p>Bu sorunu geçici olarak atladık, formu gönderebilirsiniz.</p>
      </div>
    );
  }

  // Normal yükleme durumunda
  return (
    <div className={styles.recaptchaContainer}>
      {loading && <div className={styles.loadingIndicator}>reCAPTCHA yükleniyor...</div>}
      <div ref={containerRef} className={styles.recaptchaWrapper}></div>
    </div>
  );
};

// Global tipler
declare global {
  interface Window {
    grecaptcha: any;
    recaptchaCallback: (token: string) => void;
    recaptchaErrorCallback: () => void;
    recaptchaExpiredCallback: () => void;
    onRecaptchaLoad: () => void;
  }
}

export default ReCaptcha;
