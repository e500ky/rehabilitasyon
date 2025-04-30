'use client';

import Modal from '@/components/Modal';
import { useAuth } from '@/context/AuthContext';
import firestoreService from '@/lib/services/firestoreService';
import {
    faCalendarAlt,
    faCalendarPlus,
    faChartLine,
    faGamepad,
    faInfo,
    faSpinner,
    faSync,
    faTrophy,
    faUser
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './PatientDetailModal.module.css';

interface PatientData {
  id: string;
  name: string;
  email: string;
  relationId?: string;
  upcomingAppointments?: number;
  lastAppointmentDate?: string;
  stats?: any;
  progress?: any;
}

interface PatientDetailModalProps {
  patient: PatientData;
  onClose: () => void;
}

export default function PatientDetailModal({ patient, onClose }: PatientDetailModalProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const router = useRouter();
  const { currentUser } = useAuth();
  const [isRefreshingAppointments, setIsRefreshingAppointments] = useState(false);
  const [appointmentsCount, setAppointmentsCount] = useState(patient.upcomingAppointments || 0);

  const refreshAppointmentsCount = async () => {
    if (!patient.id) return;
    
    setIsRefreshingAppointments(true);
    try {
      const count = await firestoreService.getPatientUpcomingAppointmentsCount(patient.id);
      setAppointmentsCount(count);
    } catch (error) {
      console.error("Randevu sayısı yükleme hatası:", error);
    } finally {
      setIsRefreshingAppointments(false);
    }
  };

  useEffect(() => {
    refreshAppointmentsCount();
  }, [patient.id]);

  const getLastProgressData = () => {
    if (!patient.progress?.data || patient.progress.data.length === 0) {
      return null;
    }
    return patient.progress.data.slice(-1)[0];
  };

  const lastProgress = getLastProgressData();

  const handleCreateAppointment = () => {
    onClose(); 
    const caregiverName = encodeURIComponent(currentUser?.displayName || '');
    router.push(`/randevular/olustur?patientId=${patient.id}&patientName=${encodeURIComponent(patient.name)}&caregiverName=${caregiverName}`);
  };
  
  return (
    <Modal title={`Hasta: ${patient.name}`} onClose={onClose}>
      <div className={styles.modalContent}>
        <div className={styles.patientHeader}>
          <div className={styles.patientAvatar}>
            <FontAwesomeIcon icon={faUser} />
          </div>
          <div className={styles.patientBasicInfo}>
            <h2>{patient.name}</h2>
            <p>{patient.email}</p>
          </div>
        </div>

        <div className={styles.tabs}>
          <button
            className={`${styles.tabButton} ${activeTab === 'overview' ? styles.active : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <FontAwesomeIcon icon={faInfo} className={styles.tabIcon} />
            Genel Bilgiler
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === 'progress' ? styles.active : ''}`}
            onClick={() => setActiveTab('progress')}
          >
            <FontAwesomeIcon icon={faChartLine} className={styles.tabIcon} />
            İlerleme
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === 'appointments' ? styles.active : ''}`}
            onClick={() => setActiveTab('appointments')}
          >
            <FontAwesomeIcon icon={faCalendarAlt} className={styles.tabIcon} />
            Randevular
          </button>
        </div>

        <div className={styles.tabContent}>
          {/* Genel Bakış Sekmesi */}
          {activeTab === 'overview' && (
            <div className={styles.overviewTab}>
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <div className={styles.statIcon}>
                    <FontAwesomeIcon icon={faCalendarAlt} />
                  </div>
                  <div className={styles.statInfo}>
                    <h3>Randevular</h3>
                    <div className={styles.statValue}>
                      {isRefreshingAppointments ? (
                        <FontAwesomeIcon icon={faSpinner} spin />
                      ) : (
                        appointmentsCount
                      )}
                    </div>
                  </div>
                </div>
                
                {patient.stats && (
                  <>
                    <div className={styles.statCard}>
                      <div className={styles.statIcon}>
                        <FontAwesomeIcon icon={faGamepad} />
                      </div>
                      <div className={styles.statInfo}>
                        <h3>Toplanan Elmalar</h3>
                        <div className={styles.statValue}>{patient.stats?.collectedApples || 0}</div>
                      </div>
                    </div>
                    
                    <div className={styles.statCard}>
                      <div className={styles.statIcon}>
                        <FontAwesomeIcon icon={faChartLine} />
                      </div>
                      <div className={styles.statInfo}>
                        <h3>İlerleme</h3>
                        <div className={styles.statValue}>%{patient.stats?.progressPercentage || 0}</div>
                      </div>
                    </div>

                    
                    <div className={styles.statCard}>
                      <div className={styles.statIcon}>
                        <FontAwesomeIcon icon={faTrophy} />
                      </div>
                      <div className={styles.statInfo}>
                        <h3>Seviye</h3>
                        <div className={styles.statValue}>{patient.stats?.currentLevel || 1}</div>
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              {lastProgress && (
                <div className={styles.lastProgressSection}>
                  <h3>Son İlerleme Kaydı</h3>
                  <div className={styles.lastProgressCard}>
                    <div className={styles.progressDetail}>
                      <span className={styles.progressLabel}>Tarih:</span>
                      <span className={styles.progressValue}>
                        {new Date(lastProgress.date).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                    <div className={styles.progressDetail}>
                      <span className={styles.progressLabel}>İlerleme Oranı:</span>
                      <span className={styles.progressValue}>{lastProgress.progress}%</span>
                    </div>
                    <div className={styles.progressDetail}>
                      <span className={styles.progressLabel}>Ağrı Seviyesi:</span>
                      <span className={styles.progressValue}>{lastProgress.painLevel}/10</span>
                    </div>
                  </div>
                </div>
              )}

              <div className={styles.actionButtons}>
                <button 
                  onClick={handleCreateAppointment}
                  className={styles.actionButton}
                >
                  <FontAwesomeIcon icon={faCalendarPlus} />
                  <span>Randevu Oluştur</span>
                </button>
                
                <Link href={`/patients/${patient.id}`} className={styles.actionButton}>
                  <FontAwesomeIcon icon={faChartLine} />
                  <span>Hasta Detayları</span>
                </Link>
              </div>
            </div>
          )}

          {/* İlerleme Sekmesi */}
          {activeTab === 'progress' && (
            <div className={styles.progressTab}>
              <h3 className={styles.sectionTitle}>İlerleme Grafiği</h3>
              
              {patient.progress && patient.progress.data && patient.progress.data.length > 0 ? (
                <>
                  <div className={styles.progressDataTable}>
                    <h4>İlerleme Verileri</h4>
                    <div className={styles.tableContainer}>
                      <table className={styles.dataTable}>
                        <thead>
                          <tr>
                            <th>Tarih</th>
                            <th>İlerleme</th>
                          </tr>
                        </thead>
                        <tbody>
                          {patient.progress.data.map((item: any, index: number) => (
                            <tr key={index}>
                              <td>{new Date(item.date).toLocaleDateString('tr-TR')}</td>
                              <td>{item.progress}%</td>
                              <td>{item.painLevel}/10</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : (
                <div className={styles.emptyState}>
                  <FontAwesomeIcon icon={faChartLine} className={styles.emptyIcon} />
                  <p>Bu hasta için henüz ilerleme verisi bulunmuyor.</p>
                </div>
              )}
              
              <div className={styles.actionButtons}>
                <button 
                  onClick={handleCreateAppointment}
                  className={styles.actionButton}
                >
                  <FontAwesomeIcon icon={faCalendarPlus} />
                  <span>Randevu Oluştur</span>
                </button>
              </div>
            </div>
          )}

          {/* Randevular Sekmesi */}
          {activeTab === 'appointments' && (
            <div className={styles.appointmentsTab}>
              <h3 className={styles.sectionTitle}>
                Randevular 
                <button 
                  onClick={refreshAppointmentsCount} 
                  className={styles.refreshButton}
                  disabled={isRefreshingAppointments}
                >
                  <FontAwesomeIcon 
                    icon={faSync} 
                    spin={isRefreshingAppointments} 
                    title="Randevu sayısını yenile"
                  />
                </button>
              </h3>
              
              {appointmentsCount > 0 ? (
                <div className={styles.appointmentsList}>
                  <p className={styles.appointmentsInfo}>
                    Bu hasta için {appointmentsCount} adet randevu planlanmış.
                  </p>
                  
                  <Link href={`/randevular?patientId=${patient.id}`} className={styles.viewAllLink}>
                    <FontAwesomeIcon icon={faCalendarAlt} />
                    <span>Tüm randevuları görüntüle</span>
                  </Link>
                  
                  <div className={styles.actionButtons}>
                    <button 
                      onClick={handleCreateAppointment}
                      className={styles.actionButton}
                    >
                      <FontAwesomeIcon icon={faCalendarPlus} />
                      <span>Yeni Randevu Oluştur</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <FontAwesomeIcon icon={faCalendarAlt} className={styles.emptyIcon} />
                  <p>Bu hasta için henüz bir randevu planlanmamış.</p>
                  
                  <button 
                    onClick={handleCreateAppointment}
                    className={styles.actionButton}
                  >
                    <FontAwesomeIcon icon={faCalendarPlus} />
                    <span>Randevu Oluştur</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
