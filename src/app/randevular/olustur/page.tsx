'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import firestoreService from '@/lib/services/firestoreService';
import {
    faArrowLeft,
    faCalendarAlt,
    faCheckCircle,
    faClock,
    faComments,
    faExclamationTriangle,
    faLocationDot
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import styles from './olustur.module.css';

export default function CreateAppointmentPage() {
  const { currentUser } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const patientId = searchParams.get('patientId') || '';
  const patientName = searchParams.get('patientName') || 'Hasta';
  
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  useEffect(() => {
    // Hasta ID'si yoksa randevular sayfasına yönlendir
    if (!patientId) {
      router.push('/randevular');
    }
  }, [patientId, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!currentUser) {
      setError('Oturum açmış olmalısınız.');
      return;
    }
    
    if (!date || !time || !location) {
      setError('Lütfen tüm zorunlu alanları doldurun.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Firebase Timestamp için tarihi ve saati birleştir
      const appointmentDateTime = `${date}T${time}:00`;
      
      // Bakıcı adını alabilmek için bakıcı profilini getir
      let caregiverName = '';
      try {
        const caregiverProfile = await firestoreService.getUserProfile(currentUser.uid);
        if (caregiverProfile) {
          caregiverName = caregiverProfile.displayName || '';
        }
      } catch (err) {
        console.warn('Bakıcı profili alınamadı:', err);
      }
      
      const appointmentData = {
        patientId,
        patientName: decodeURIComponent(patientName),
        caregiverId: currentUser.uid,
        caregiverName, // Bakıcının adını ekle
        date: appointmentDateTime,
        location,
        notes: notes || '',
        status: 'pending' // Varsayılan randevu durumu
      };
      
      // Randevu oluştur
      await firestoreService.createAppointment(appointmentData);
      
      setSuccess(true);
      
      // 2 saniye sonra randevular sayfasına yönlendir
      setTimeout(() => {
        router.push('/randevular');
      }, 2000);
      
    } catch (err: any) {
      console.error('Randevu oluşturma hatası:', err);
      setError(err.message || 'Randevu oluşturulurken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Yarın tarihini al (minimum seçilebilir tarih için)
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <DashboardLayout>
      <div className={styles.container}>
        <div className={styles.header}>
          <Link href="/randevular" className={styles.backLink}>
            <FontAwesomeIcon icon={faArrowLeft} />
            <span>Randevulara Dön</span>
          </Link>
          <h1>Randevu Oluştur</h1>
        </div>
        
        <div className={styles.formCard}>
          {success ? (
            <div className={styles.successMessage}>
              <FontAwesomeIcon icon={faCheckCircle} className={styles.successIcon} />
              <h2>Randevu Başarıyla Oluşturuldu!</h2>
              <p>Randevu bilgileri kaydedildi ve hasta bilgilendirildi.</p>
            </div>
          ) : (
            <>
              <div className={styles.formHeader}>
                <h2>
                  <span className={styles.patientName}>{decodeURIComponent(patientName)}</span> için randevu oluşturuluyor
                </h2>
                <p className={styles.formDescription}>
                  Lütfen randevu bilgilerini aşağıdaki forma girin. Zorunlu alanlar yıldız (*) ile işaretlenmiştir.
                </p>
              </div>
              
              {error && (
                <div className={styles.errorMessage}>
                  <FontAwesomeIcon icon={faExclamationTriangle} />
                  <span>{error}</span>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>
                      <FontAwesomeIcon icon={faCalendarAlt} />
                      Tarih <span className={styles.required}>*</span>
                    </label>
                    <input 
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      min={getTomorrowDate()}
                      required
                      className={styles.input}
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label>
                      <FontAwesomeIcon icon={faClock} />
                      Saat <span className={styles.required}>*</span>
                    </label>
                    <input 
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      required
                      className={styles.input}
                    />
                  </div>
                </div>
                
                <div className={styles.formGroup}>
                  <label>
                    <FontAwesomeIcon icon={faLocationDot} />
                    Konum <span className={styles.required}>*</span>
                  </label>
                  <input 
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Örn: Klinik, Ev ziyareti veya Video görüşmesi"
                    required
                    className={styles.input}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>
                    <FontAwesomeIcon icon={faComments} />
                    Notlar
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Randevu hakkında notlar ekleyin (isteğe bağlı)"
                    rows={3}
                    className={styles.textarea}
                  ></textarea>
                </div>
                
                <div className={styles.formActions}>
                  <Link href="/randevular" className={styles.cancelButton}>
                    İptal
                  </Link>
                  <button 
                    type="submit" 
                    className={styles.submitButton}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Oluşturuluyor...' : 'Randevu Oluştur'}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
