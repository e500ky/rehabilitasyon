'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './ReCaptcha.module.css';

interface ReCaptchaProps {
  onVerify: (token: string) => void;
  skipInDev?: boolean; 
}

const ReCaptcha = ({ onVerify, skipInDev = true }: ReCaptchaProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  useEffect(() => {
    const isDev = process.env.NODE_ENV === 'development';
    if (skipInDev && isDev) {
      onVerify('dev_mode_bypass_token');
      return;
    }
  }, [onVerify, skipInDev]);

  useEffect(() => {
    const isDev = process.env.NODE_ENV === 'development';
    if (skipInDev && isDev) return;

    const initializeRecaptcha = async () => {
      try {
        if (!siteKey) {
          console.error('reCAPTCHA site anahtarı bulunamadı');
          setError('reCAPTCHA yapılandırması eksik (.env.local dosyasını kontrol edin)');
          onVerify('missing_config_bypass_token');
          return;
        }

        if (document.querySelector('script#recaptcha-script')) {
          return;
        }

        window.recaptchaCallback = (token: string) => {
          setLoading(false);
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
          onVerify('');
        };

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

        const script = document.createElement('script');
        script.id = 'recaptcha-script';
        script.src = 'https://www.google.com/recaptcha/api.js?render=explicit&onload=onRecaptchaLoad';
        script.async = true;
        document.head.appendChild(script);

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

        const timeout = setTimeout(() => {
          if (loading) {
            console.error('reCAPTCHA yükleme zaman aşımı');
            setError('reCAPTCHA yüklenirken zaman aşımına uğradı');
            onVerify('timeout_bypass_token');
          }
        }, 10000); 

        return () => clearTimeout(timeout);
      } catch (err) {
        console.error('reCAPTCHA başlatma hatası:', err);
        setError('reCAPTCHA başlatılamadı');
        onVerify('init_error_bypass_token');
      }
    };

    initializeRecaptcha();

    return () => {
      delete window.recaptchaCallback;
      delete window.recaptchaErrorCallback;
      delete window.recaptchaExpiredCallback;
      delete window.onRecaptchaLoad;
    };
  }, [onVerify, siteKey, skipInDev]);

  if (process.env.NODE_ENV === 'development' && skipInDev) {
    return (
      <div className={styles.devModeNotice}>
        reCAPTCHA geliştirme modunda atlandı
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.recaptchaError}>
        <p>{error}</p>
        <p>Bu sorunu geçici olarak atladık, formu gönderebilirsiniz.</p>
      </div>
    );
  }

  return (
    <div className={styles.recaptchaContainer}>
      {loading && <div className={styles.loadingIndicator}>reCAPTCHA yükleniyor...</div>}
      <div ref={containerRef} className={styles.recaptchaWrapper}></div>
    </div>
  );
};

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
