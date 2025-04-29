'use client';

import Modal from '@/components/Modal';
import { useAuth } from '@/context/AuthContext';
import firestoreService from '@/lib/services/firestoreService';
import {
    faCalendarAlt,
    faCheckCircle,
    faClock,
    faComments,
    faExclamationTriangle,
    faLocationDot,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';
import styles from './AppointmentForm.module.css';

interface AppointmentFormProps {
  patientId: string;
  patientName: string;
  onClose: () => void;
  onAppointmentCreated: () => void;
}

export default function AppointmentForm({ 
  patientId, 
  patientName, 
  onClose, 
  onAppointmentCreated 
}: AppointmentFormProps) {
  const { currentUser } = useAuth();
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const isFormValid = () => {
    return date && time && location;
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      setError('Lütfen tüm zorunlu alanları doldurun.');
      return;
    }

    if (!currentUser) {
      setError('Oturum açmanız gerekiyor.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const appointmentData = {
        patientId: patientId,
        caregiverId: currentUser.uid,
        date: `${date}T${time}:00`,
        location,
        notes,
        status: 'pending'
      };
      
      await firestoreService.createAppointment(appointmentData);
      
      setSuccess(true);
      
      // 2 saniye sonra olay bildir ve modalı kapat
      setTimeout(() => {
        onAppointmentCreated();
      }, 2000);
      
    } catch (err: any) {
      console.error('Randevu oluşturma hatası:', err);
      setError(err.message || 'Randevu oluşturulurken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal title={`${patientName} için Randevu Oluştur`} onClose={onClose}>
      <div className={styles.appointmentFormContainer}>
        {success ? (
          <div className={styles.successMessage}>
            <FontAwesomeIcon icon={faCheckCircle} className={styles.successIcon} />
            <h3>Randevu Başarıyla Oluşturuldu!</h3>
            <p>Randevu bilgileri kaydedildi ve hasta bilgilendirildi.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.appointmentForm}>
            {error && (
              <div className={styles.errorMessage}>
                <FontAwesomeIcon icon={faExclamationTriangle} />
                <span>{error}</span>
              </div>
            )}
            
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
              />
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
              ></textarea>
            </div>

            <div className={styles.formActions}>
              <button 
                type="button" 
                className={styles.cancelButton}
                onClick={onClose}
                disabled={isLoading}
              >
                İptal
              </button>
              <button 
                type="submit" 
                className={styles.submitButton}
                disabled={isLoading || !isFormValid()}
              >
                {isLoading ? 'Oluşturuluyor...' : 'Randevu Oluştur'}
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}
