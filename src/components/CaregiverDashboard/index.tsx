'use client';

import firestoreService from '@/lib/services/firestoreService';
import { AppointmentData, UserProfile } from '@/types/user';
import {
  faCalendarAlt,
  faCheckCircle,
  faClock,
  faExclamationTriangle,
  faTimesCircle
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useState } from 'react';
import styles from './CaregiverDashboard.module.css';

interface CaregiverDashboardProps {
  userProfile: UserProfile;
}

interface PatientSummary {
  id: string;
  name: string;
  email: string;
  upcomingAppointments: number;
  lastAppointmentDate?: string;
}

export default function CaregiverDashboard({ userProfile }: CaregiverDashboardProps) {
  const [patients, setPatients] = useState<PatientSummary[]>([]);
  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (userProfile?.uid) {
          // Bakıcının hastalarını yükle
          const patientsList = await firestoreService.getCaregiverPatients(userProfile.uid);
          setPatients(patientsList);

          // Bakıcının yaklaşan randevularını yükle
          const appointmentsList = await firestoreService.getCaregiverAppointments(userProfile.uid, 'pending');
          setAppointments(appointmentsList);
        }
      } catch (err) {
        console.error("Veri yükleme hatası:", err);
        setError("Veriler yüklenirken bir hata oluştu.");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [userProfile]);

  const handleAppointmentAction = async (appointmentId: string, action: 'accept' | 'reject') => {
    try {
      if (action === 'accept') {
        await firestoreService.updateAppointmentStatus(appointmentId, 'accepted');
        // Randevuları güncelle
        setAppointments(prevAppointments => 
          prevAppointments.map(appointment => 
            appointment.id === appointmentId 
              ? {...appointment, status: 'accepted'} 
              : appointment
          )
        );
      } else {
        await firestoreService.updateAppointmentStatus(appointmentId, 'cancelled');
        // Randevuları güncelle
        setAppointments(prevAppointments => 
          prevAppointments.map(appointment => 
            appointment.id === appointmentId 
              ? {...appointment, status: 'cancelled'} 
              : appointment
          )
        );
      }
    } catch (err) {
      console.error("Randevu güncelleme hatası:", err);
      setError("Randevu güncellenirken bir hata oluştu.");
    }
  };

  if (isLoading) {
    return <div className={styles.loading}>Yükleniyor...</div>;
  }

  return (
    <div className={styles.dashboardContainer}>
      {error && (
        <div className={styles.errorMessage}>
          <FontAwesomeIcon icon={faExclamationTriangle} className={styles.errorIcon} />
          <p>{error}</p>
        </div>
      )}
      
      <div className={styles.welcomeSection}>
        <h1>Hoş Geldiniz, {userProfile?.displayName}</h1>
        <p>Hastalarınızı ve randevularınızı buradan yönetebilirsiniz.</p>
      </div>
      
      <div className={styles.statsContainer}>
        <div className={styles.statBox}>
          <h3>Toplam Hasta</h3>
          <div className={styles.statValue}>{patients.length}</div>
        </div>
        <div className={styles.statBox}>
          <h3>Bekleyen Randevular</h3>
          <div className={styles.statValue}>{appointments.filter(a => a.status === 'pending').length}</div>
        </div>
        <div className={styles.statBox}>
          <h3>Bugün</h3>
          <div className={styles.statValue}>
            {appointments.filter(a => {
              const today = new Date().toISOString().split('T')[0];
              return a.date === today;
            }).length}
          </div>
        </div>
      </div>

      <div className={styles.sectionsContainer}>
        <div className={styles.pendingAppointmentsSection}>
          <div className={styles.sectionHeader}>
            <h2>
              <FontAwesomeIcon icon={faClock} className={styles.sectionIcon} />
              Bekleyen Randevu Talepleri
            </h2>
          </div>
          
          {appointments.filter(a => a.status === 'pending').length === 0 ? (
            <div className={styles.emptyState}>
              <p>Bekleyen randevu talebi bulunmuyor.</p>
            </div>
          ) : (
            <div className={styles.appointmentsList}>
              {appointments
                .filter(a => a.status === 'pending')
                .map(appointment => (
                  <div key={appointment.id} className={styles.appointmentCard}>
                    <div className={styles.appointmentInfo}>
                      <h3>{appointment.patientName}</h3>
                      <div className={styles.appointmentMeta}>
                        <span>
                          <FontAwesomeIcon icon={faCalendarAlt} />
                          {appointment.date.split("T")[0]}
                        </span>
                        <span>
                          <FontAwesomeIcon icon={faClock} />
                          {appointment.date.split("T")[1].split(":").slice(0, 2).join(":")}
                        </span>
                      </div>
                      {appointment.notes && (
                        <p className={styles.appointmentNotes}>{appointment.notes}</p>
                      )}
                    </div>
                    <div className={styles.appointmentActions}>
                      <button 
                        className={styles.acceptButton}
                        onClick={() => handleAppointmentAction(appointment.id, 'accept')}
                      >
                        <FontAwesomeIcon icon={faCheckCircle} />
                        Onayla
                      </button>
                      <button 
                        className={styles.rejectButton}
                        onClick={() => handleAppointmentAction(appointment.id, 'reject')}
                      >
                        <FontAwesomeIcon icon={faTimesCircle} />
                        Reddet
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
