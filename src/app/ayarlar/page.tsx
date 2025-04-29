'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import {
    faExclamationTriangle,
    faLock,
    faQuestionCircle,
    faSave,
    faShieldAlt,
    faUser
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import styles from './ayarlar.module.css';

export default function Ayarlar() {
  const { currentUser, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    name: currentUser?.displayName || '',
    email: currentUser?.email || '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    emailNotifications: true,
    smsNotifications: false,
    language: 'tr',
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (!loading && !currentUser) {
      router.push('/oturum-ac');
    }
  }, [currentUser, loading, router]);

  if (loading || !currentUser) {
    return (
      <div className={styles.loading}>
        <p>Yükleniyor...</p>
      </div>
    );
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSuccess('');
    setError('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('Profil bilgileriniz başarıyla güncellendi.');
    setError('');
    // Gerçek bir uygulamada burada kullanıcı bilgileri güncellenecek
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Yeni şifreler eşleşmiyor.');
      setSuccess('');
      return;
    }
    setSuccess('Şifreniz başarıyla değiştirildi.');
    setError('');
    // Gerçek bir uygulamada burada şifre değişikliği yapılacak
  };

  const handleNotificationsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('Bildirim ayarlarınız güncellendi.');
    setError('');
    // Gerçek bir uygulamada burada bildirim ayarları güncellenecek
  };

  const handleLanguageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('Dil tercihiniz güncellendi.');
    setError('');
    // Gerçek bir uygulamada burada dil tercihi güncellenecek
  };

  return (
    <DashboardLayout>
      <div className={styles.ayarlarContainer}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Ayarlar</h1>
        </div>
        
        <div className={styles.settingsContent}>
          <div className={styles.settingsTabs}>
            <button 
              className={`${styles.tabButton} ${activeTab === 'profile' ? styles.active : ''}`}
              onClick={() => handleTabChange('profile')}
            >
              <FontAwesomeIcon icon={faUser} className={styles.tabIcon} />
              Profil
            </button>
            <button 
              className={`${styles.tabButton} ${activeTab === 'password' ? styles.active : ''}`}
              onClick={() => handleTabChange('password')}
            >
              <FontAwesomeIcon icon={faLock} className={styles.tabIcon} />
              Şifre
            </button>
            <button 
              className={`${styles.tabButton} ${activeTab === 'help' ? styles.active : ''}`}
              onClick={() => handleTabChange('help')}
            >
              <FontAwesomeIcon icon={faQuestionCircle} className={styles.tabIcon} />
              Yardım
            </button>
          </div>
          
          <div className={styles.settingsPanel}>
            {success && (
              <div className={styles.successMessage}>
                {success}
              </div>
            )}
            
            {error && (
              <div className={styles.errorMessage}>
                <FontAwesomeIcon icon={faExclamationTriangle} className={styles.errorIcon} />
                {error}
              </div>
            )}
            
            {activeTab === 'profile' && (
              <form onSubmit={handleProfileSubmit} className={styles.settingsForm}>
                <h2 className={styles.panelTitle}>Profil Bilgileri</h2>
                
                <div className={styles.formGroup}>
                  <label htmlFor="name">Ad Soyad</label>
                  <input 
                    type="text" 
                    id="name" 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="email">E-posta</label>
                  <input 
                    type="email" 
                    id="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled
                  />
                  <p className={styles.fieldHelp}>E-posta adresi değiştirilemez.</p>
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="phone">Telefon</label>
                  <input 
                    type="tel" 
                    id="phone" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="(___) ___ __ __"
                  />
                </div>
                
                <button type="submit" className={styles.submitButton}>
                  <FontAwesomeIcon icon={faSave} className={styles.buttonIcon} />
                  Değişiklikleri Kaydet
                </button>
              </form>
            )}
            
            {activeTab === 'password' && (
              <form onSubmit={handlePasswordSubmit} className={styles.settingsForm}>
                <h2 className={styles.panelTitle}>Şifre Değiştir</h2>
                
                <div className={styles.formGroup}>
                  <label htmlFor="currentPassword">Mevcut Şifre</label>
                  <input 
                    type="password" 
                    id="currentPassword" 
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="newPassword">Yeni Şifre</label>
                  <input 
                    type="password" 
                    id="newPassword" 
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    required
                    minLength={6}
                  />
                  <p className={styles.fieldHelp}>En az 6 karakter olmalıdır.</p>
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="confirmPassword">Yeni Şifre Tekrar</label>
                  <input 
                    type="password" 
                    id="confirmPassword" 
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    minLength={6}
                  />
                </div>
                
                <div className={styles.securityNote}>
                  <FontAwesomeIcon icon={faShieldAlt} className={styles.securityIcon} />
                  <p>Güvenliğiniz için güçlü bir şifre oluşturun. En az 8 karakter, büyük-küçük harf ve rakam kullanmanız önerilir.</p>
                </div>
                
                <button type="submit" className={styles.submitButton}>
                  <FontAwesomeIcon icon={faSave} className={styles.buttonIcon} />
                  Şifreyi Güncelle
                </button>
              </form>
            )}
            
            {activeTab === 'help' && (
              <div className={styles.helpContent}>
                <h2 className={styles.panelTitle}>Yardım ve Destek</h2>
                
                <div className={styles.helpSection}>
                  <h3>Sıkça Sorulan Sorular</h3>
                  <ul className={styles.faqList}>
                    <li>
                      <h4>Randevu nasıl alabilirim?</h4>
                      <p>"Randevular" sayfasından "Yeni Randevu" butonuna tıklayarak randevu alabilirsiniz.</p>
                    </li>
                    <li>
                      <h4>Şifremi unuttum ne yapabilirim?</h4>
                      <p>Giriş sayfasından "Şifremi Unuttum" seçeneğini kullanarak şifre sıfırlama bağlantısı alabilirsiniz.</p>
                    </li>
                  </ul>
                </div>
                
                <div className={styles.helpSection}>
                  <h3>İletişim</h3>
                  <p>Teknik destek veya sorularınız için aşağıdaki iletişim kanallarını kullanabilirsiniz:</p>
                  <ul className={styles.contactList}>
                    <li>Telefon: (0212) 123 45 67</li>
                    <li>E-posta: destek@rehabilitasyonmerkezi.com</li>
                    <li>Çalışma Saatleri: Pazartesi - Cuma, 09:00 - 18:00</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
