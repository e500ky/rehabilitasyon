'use client';

import DashboardLayout from '@/components/DashboardLayout';
import PasswordInput from '@/components/PasswordInput';
import { useAuth } from '@/context/AuthContext';
import firestoreService from '@/lib/services/firestoreService';
import { faCheck, faExclamationTriangle, faLock, faSave, faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './ayarlar.module.css';

export default function Settings() {
  const { currentUser, updateEmail, updatePassword, reloadUser } = useAuth();
  const router = useRouter();
  
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [generalSuccess, setGeneralSuccess] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    displayName: '',
    phoneNumber: '',
    email: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (!currentUser) {
      router.push('/oturum-ac');
      return;
    }

    const loadUserProfile = async () => {
      try {
        const profile = await firestoreService.getUserProfile(currentUser.uid);
        if (profile) {
          setUserProfile(profile);
          setFormData({
            displayName: profile.displayName || '',
            phoneNumber: profile.phoneNumber || '',
            email: currentUser.email || ''
          });
        }
      } catch (error) {
        console.error('Profil yüklenirken hata:', error);
        setGeneralError('Kullanıcı profili yüklenirken bir hata oluştu.');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserProfile();
  }, [currentUser, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.startsWith('0')) {
      value = value.substring(1);
    }
    
    if (value.length <= 10) {
      let formattedValue = value;
      
      if (value.length > 0) {
        formattedValue = '(' + formattedValue;
      }
      
      if (value.length > 3) {
        formattedValue = formattedValue.substring(0, 4) + ') ' + formattedValue.substring(4);
      }
      
      if (value.length > 6) {
        formattedValue = formattedValue.substring(0, 9) + ' ' + formattedValue.substring(9);
      }
      
      if (value.length > 8) {
        formattedValue = formattedValue.substring(0, 12) + ' ' + formattedValue.substring(12);
      }
      
      setFormData(prev => ({ ...prev, phoneNumber: formattedValue }));
    }
  };

  const validateProfileForm = () => {
    if (!formData.displayName.trim()) {
      setGeneralError('Ad Soyad boş olamaz.');
      return false;
    }
    
    if (!formData.email.trim()) {
      setGeneralError('E-posta adresi boş olamaz.');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setGeneralError('Geçerli bir e-posta adresi giriniz.');
      return false;
    }
    
    return true;
  };

  const validatePasswordForm = () => {
    if (!passwordData.currentPassword) {
      setPasswordError('Mevcut şifrenizi giriniz.');
      return false;
    }
    
    if (passwordData.newPassword.length < 6) {
      setPasswordError('Yeni şifre en az 6 karakter olmalıdır.');
      return false;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Şifreler eşleşmiyor.');
      return false;
    }
    
    return true;
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setGeneralSuccess(null);
    setGeneralError(null);
    
    setIsLoading(true);
    
    try {
      const cleanedPhoneNumber = formData.phoneNumber.replace(/\D/g, '');
      
      const profileUpdates = {
        phoneNumber: formData.phoneNumber
      };
      
      await firestoreService.updateUserProfile(currentUser.uid, profileUpdates);
      
      setGeneralSuccess('Profil bilgileriniz başarıyla güncellendi.');
      
    } catch (error: any) {
      console.error('Profil güncelleme hatası:', error);
      setGeneralError('Profil güncellenirken bir hata oluştu: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setPasswordSuccess(null);
    setPasswordError(null);
    
    if (!validatePasswordForm()) return;
    
    setIsLoading(true);
    
    try {
      await updatePassword(passwordData.currentPassword, passwordData.newPassword);
      
      setPasswordSuccess('Şifreniz başarıyla güncellendi.');
      
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error: any) {
      console.error('Şifre güncelleme hatası:', error);
      
      if (error.code === 'auth/wrong-password') {
        setPasswordError('Mevcut şifreniz yanlış.');
      } else if (error.code === 'auth/requires-recent-login') {
        setPasswordError('Bu işlem için yeniden giriş yapmanız gerekmektedir. Lütfen çıkış yapıp tekrar giriş yapınız.');
      } else {
        setPasswordError('Şifre güncellenirken bir hata oluştu.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className={styles.settingsContainer}>
        <h1 className={styles.settingsTitle}>Hesap Ayarları</h1>

        <div className={styles.settingsSection}>
          <h2 className={styles.sectionTitle}>
            <FontAwesomeIcon icon={faUser} className={styles.sectionIcon} />
            Profil Bilgileri
          </h2>
          
          {generalSuccess && (
            <div className={styles.successMessage}>
              <FontAwesomeIcon icon={faCheck} />
              <p>{generalSuccess}</p>
            </div>
          )}
          
          {generalError && (
            <div className={styles.errorMessage}>
              <FontAwesomeIcon icon={faExclamationTriangle} />
              <p>{generalError}</p>
            </div>
          )}
          
          <form onSubmit={handleProfileUpdate} className={styles.settingsForm}>
            <div className={styles.formGroup}>
              <label htmlFor="displayName">Ad Soyad</label>
              <input
                type="text"
                id="displayName"
                name="displayName"
                value={formData.displayName}
                onChange={handleInputChange}
                placeholder="Ad Soyad"
                disabled={true}
                className={styles.disabledInput}
              />
              <small className={styles.inputNote}>Ad soyad değiştirilemez. Yöneticiniz ile iletişime geçin.</small>
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="email">E-posta Adresi</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="E-posta"
                disabled={true}
                className={styles.disabledInput}
              />
              <small className={styles.inputNote}>E-posta adresi değiştirilemez. Yöneticiniz ile iletişime geçin.</small>
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="phoneNumber">Telefon Numarası (İsteğe bağlı)</label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handlePhoneChange}
                placeholder="(5XX) XXX XX XX"
              />
            </div>
            
            <div className={styles.formActions}>
              <button 
                type="submit" 
                className={styles.saveButton}
                disabled={isLoading}
              >
                <FontAwesomeIcon icon={faSave} />
                {isLoading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
              </button>
            </div>
          </form>
        </div>

        <div className={styles.settingsSection}>
          <h2 className={styles.sectionTitle}>
            <FontAwesomeIcon icon={faLock} className={styles.sectionIcon} />
            Şifre Değiştir
          </h2>
          
          {passwordSuccess && (
            <div className={styles.successMessage}>
              <FontAwesomeIcon icon={faCheck} />
              <p>{passwordSuccess}</p>
            </div>
          )}
          
          {passwordError && (
            <div className={styles.errorMessage}>
              <FontAwesomeIcon icon={faExclamationTriangle} />
              <p>{passwordError}</p>
            </div>
          )}
          
          <form onSubmit={handlePasswordUpdate} className={styles.settingsForm}>
            <div className={styles.formGroup}>
              <label htmlFor="currentPassword">Mevcut Şifre</label>
              <PasswordInput
                id="currentPassword"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                placeholder="Mevcut şifreniz"
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="newPassword">Yeni Şifre</label>
              <PasswordInput
                id="newPassword"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                placeholder="Yeni şifreniz"
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword">Yeni Şifre (Tekrar)</label>
              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                placeholder="Yeni şifrenizi tekrar girin"
              />
            </div>
            
            <div className={styles.formActions}>
              <button 
                type="submit" 
                className={styles.saveButton}
                disabled={isLoading}
              >
                <FontAwesomeIcon icon={faSave} />
                {isLoading ? 'Kaydediliyor...' : 'Şifreyi Güncelle'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
