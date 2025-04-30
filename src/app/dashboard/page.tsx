'use client';

import DashboardLayout from '@/components/DashboardLayout';
import Modal from '@/components/Modal';
import PatientDashboard from '@/components/PatientDashboard';
import ProgressChart from '@/components/ProgressChart';
import { useAuth } from '@/context/AuthContext';
import firestoreService from '@/lib/services/firestoreService';
import { AppointmentData, ProgressDataPoint } from '@/types/user';
import {
  faCalendarAlt,
  faCalendarCheck,
  faCalendarPlus,
  faExclamationTriangle,
  faHospitalUser,
  faSearch,
  faSyncAlt,
  faTimes,
  faTrashAlt,
  faUser,
  faUserPlus,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { format, parseISO } from 'date-fns';
import tr from 'date-fns/locale/tr';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import patientStyles from '../patients/patients.module.css';
import styles from './dashboard.module.css';

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

export default function Dashboard() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [patients, setPatients] = useState<PatientData[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<PatientData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<PatientData | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  const [upcomingAppointments, setUpcomingAppointments] = useState<AppointmentData[]>([]);

  useEffect(() => {
    if (!currentUser) {
      router.push('/oturum-ac');
      return;
    }

    const loadUserData = async () => {
      try {
        const profile = await firestoreService.getUserProfile(currentUser.uid);
        setUserProfile(profile);

        if (profile?.userType === 'caregiver') {
          loadPatients();
          loadCaregiverAppointments();
        } else {
          loadPatientAppointments();
        }
      } catch (err) {
        console.error('Veri yükleme hatası:', err);
        setError('Verileriniz yüklenirken bir sorun oluştu.');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [currentUser, router]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredPatients(patients);
    } else {
      const filtered = patients.filter(patient => {
        const searchLower = searchQuery.toLowerCase();
        const nameLower = patient.name?.toLowerCase() || '';
        const emailLower = patient.email?.toLowerCase() || '';
        
        return nameLower.includes(searchLower) || emailLower.includes(searchLower);
      });
      
      setFilteredPatients(filtered);
    }
  }, [searchQuery, patients]);

  const loadPatients = async () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    
    try {
      const loadedPatients = await firestoreService.getCaregiverPatients(currentUser.uid);
      
      if (Array.isArray(loadedPatients)) {
        const patientsWithAppointments = await Promise.all(
          loadedPatients.map(async (patient) => {
            const upcomingAppointments = await firestoreService.getPatientUpcomingAppointmentsCount(patient.id);
            return {
              ...patient,
              upcomingAppointments
            };
          })
        );
        
        setPatients(patientsWithAppointments);
        setFilteredPatients(patientsWithAppointments);
      } else {
        console.error('Beklenmeyen veri formatı:', loadedPatients);
        setPatients([]);
        setFilteredPatients([]);
      }
    } catch (err) {
      console.error('Hastalar yüklenirken hata:', err);
      setError('Hasta verileriniz yüklenirken bir sorun oluştu.');
      setPatients([]);
      setFilteredPatients([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPatientAppointments = async () => {
    if (!currentUser) return;
    
    try {
      const appointments = await firestoreService.getPatientAppointments(currentUser.uid);
      
      const upcoming = appointments.filter(app => {
        const appDate = parseISO(app.date);
        return appDate >= new Date() && (app.status === 'pending' || app.status === 'accepted');
      }).slice(0, 5);
      
      setUpcomingAppointments(upcoming);
    } catch (error) {
      console.error('Randevu yükleme hatası:', error);
    }
  };
  
  const loadCaregiverAppointments = async () => {
    if (!currentUser) return;
    
    try {
      const appointments = await firestoreService.getCaregiverAppointments(currentUser.uid);
      
      const upcoming = appointments.filter(app => {
        const appDate = parseISO(app.date);
        return appDate >= new Date() && app.status === 'accepted';
      }).slice(0, 5); 
      
      setUpcomingAppointments(upcoming);
    } catch (error) {
      console.error('Randevu yükleme hatası:', error);
    }
  };

  const handleViewPatient = async (patient: PatientData) => {
    setIsLoading(true);
    
    try {
      
      const stats = await firestoreService.getUserStats(patient.id);
      const progress = await firestoreService.getUserProgress(patient.id);
        let progressAverage = 0;
      if (progress && progress.data && progress.data.length > 0) {
        const progressSum = progress.data.reduce((total: number, point: ProgressDataPoint) => total + point.progress, 0);
        progressAverage = progressSum / progress.data.length;
        
        const updatedStats = stats || {};
        updatedStats.progressPercentage = progressAverage;
        
        const detailedPatient = {
          ...patient,
          stats: updatedStats,
          progress
        };
        
        setSelectedPatient(detailedPatient);
      } else {
        const detailedPatient = {
          ...patient,
          stats,
          progress
        };
        
        setSelectedPatient(detailedPatient);
      }
      
      setShowDetailModal(true);
    } catch (err) {
      console.error('Hasta detayları yüklenirken hata:', err);
      alert('Hasta detayları yüklenirken bir sorun oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedPatient(null);
  };

  const handleRemovePatient = async (patient: PatientData) => {
    if (!patient.relationId) {
      alert("Bu hasta için ilişki bilgisi bulunamadı.");
      return;
    }
    
    const confirmDelete = window.confirm(`${patient.name} adlı hastayı listenizden kaldırmak istediğinizden emin misiniz?`);
    if (!confirmDelete) return;

    setIsLoading(true);
    try {
      await firestoreService.deleteCaregiverPatientRelation(patient.relationId);
      
      setPatients(prev => prev.filter(p => p.id !== patient.id));
      setFilteredPatients(prev => prev.filter(p => p.id !== patient.id));
    
    } catch (err) {
      console.error("Hasta ilişkisi silinirken hata oluştu:", err);
      alert("Hasta kaldırılırken bir sorun oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderPatientDetailModal = () => {
    if (!selectedPatient) return null;

    return (
      <Modal title={`Hasta Detayları: ${selectedPatient.name}`} onClose={handleCloseModal}>
        <div className={patientStyles.modalContent}>
          <div className={patientStyles.patientHeader}>
            <div className={patientStyles.patientAvatar}>
              <FontAwesomeIcon icon={faUser} />
            </div>
            <div className={patientStyles.patientInfo}>
              <h2>{selectedPatient.name}</h2>
              <p>{selectedPatient.email}</p>
            </div>

            <div className={patientStyles.actionsSection}>
              <Link href={`/randevular/olustur?patientId=${selectedPatient.id}&patientName=${encodeURIComponent(selectedPatient.name)}&caregiverName=${encodeURIComponent(currentUser?.displayName || '')}`} className={patientStyles.actionButton}>
                <FontAwesomeIcon icon={faCalendarPlus} />
                <span>Randevu Oluştur</span>
              </Link>
            </div>
          </div>
          
          <div className={patientStyles.statsSection}>
            <h3 className={patientStyles.sectionTitle}>İstatistikler</h3>
            <div className={patientStyles.statsGrid}>
              <div className={patientStyles.statItem}>
                <div className={patientStyles.statTitle}>Toplam Seans</div>
                <div className={patientStyles.statValue}>
                  {selectedPatient.stats?.sessionsCount || 0}
                </div>
              </div>
              
              {selectedPatient.stats && (
                <>
                  <div className={patientStyles.statItem}>
                    <div className={patientStyles.statTitle}>Toplanan Elmalar</div>
                    <div className={patientStyles.statValue}>{selectedPatient.stats.totalCollectedApples || 0}</div>
                  </div>
                  
                  <div className={patientStyles.statItem}>                    <div className={patientStyles.statTitle}>İlerleme</div>
                    <div className={patientStyles.statValue}>
                      %{isNaN(selectedPatient.stats.progressPercentage || 0) ? 0 : (selectedPatient.stats.progressPercentage || 0).toFixed(2)}
                    </div>
                  </div>
                  
                  <div className={patientStyles.statItem}>
                    <div className={patientStyles.statTitle}>Maksimum Seviye</div>
                    <div className={patientStyles.statValue}>
                      {selectedPatient.stats.maxLevel || 1}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          
          {selectedPatient.progress && selectedPatient.progress.data && (
            <div className={patientStyles.chartSection}>
              <h3 className={patientStyles.sectionTitle}>İlerleme Grafiği</h3>
              <div className={patientStyles.chartContainer}>
                <ProgressChart data={selectedPatient.progress.data as ProgressDataPoint[]} height={300} />
              </div>
            </div>
          )}
        </div>
      </Modal>
    );
  };

  const renderCaregiverDashboard = () => {
    return (
      <div className={styles.dashboard}>
        <div className={styles.welcomeSection}>
          <h1>Hoş Geldiniz, {userProfile?.displayName || 'Kullanıcı'}</h1>
          <p>Rehabilitasyon platformuna hoş geldiniz. Bugün size yardımcı olmak için buradayız.</p>
        </div>
        
        <div className={styles.statsOverview}>
          <div className={styles.statCard}>
            <div className={styles.statCardIconContainer} style={{ backgroundColor: '#4CAF50' }}>
              <FontAwesomeIcon icon={faHospitalUser} className={styles.statCardIcon} />
            </div>
            <div className={styles.statCardContent}>
              <h3 className={styles.statCardTitle}>Toplam Hastanız</h3>
              <div className={styles.statCardValue}>{patients.length}</div>
            </div>
          </div>
          
          <div className={styles.statCard}>
            <div className={styles.statCardIconContainer} style={{ backgroundColor: '#2196F3' }}>
              <FontAwesomeIcon icon={faCalendarCheck} className={styles.statCardIcon} />
            </div>
            <div className={styles.statCardContent}>
              <h3 className={styles.statCardTitle}>Aktif  Randevular</h3>
              <div className={styles.statCardValue}>{upcomingAppointments.length}</div>
            </div>
          </div>
        </div>

        <div className={styles.sectionHeader}>
          <h2>
            <FontAwesomeIcon icon={faHospitalUser} className={styles.sectionIcon} />
            Hastalarım
          </h2>
          <div className={styles.sectionActions}>
            <button
              className={styles.refreshButton}
              onClick={loadPatients}
              disabled={isLoading}
              title="Yenile"
            >
              <FontAwesomeIcon icon={faSyncAlt} spin={isLoading} />
            </button>
            <Link href="/patients/add" className={styles.addButton}>
              <FontAwesomeIcon icon={faUserPlus} />
              <span>Hasta Ekle</span>
            </Link>
          </div>
        </div>

        <div className={patientStyles.searchBox}>
          <div className={patientStyles.searchInput}>
            <FontAwesomeIcon icon={faSearch} className={patientStyles.searchIcon} />
            <input
              type="text"
              placeholder="Hasta adı veya e-posta adresi ile ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className={patientStyles.clearButton}
                onClick={() => setSearchQuery('')}
                title="Temizle"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className={patientStyles.loading}>
            <FontAwesomeIcon icon={faSyncAlt} spin />
            <p>Hastalar yükleniyor...</p>
          </div>
        ) : error ? (
          <div className={patientStyles.errorMessage}>
            <FontAwesomeIcon icon={faExclamationTriangle} />
            <p>{error}</p>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className={patientStyles.emptyState}>
            <FontAwesomeIcon icon={faUser} className={patientStyles.emptyIcon} />
            <p>
              {searchQuery
                ? 'Arama kriterlerinize uygun hasta bulunamadı.'
                : 'Henüz hiç hasta eklememişsiniz.'}
            </p>
            {!searchQuery && (
              <Link href="/patients/add" className={patientStyles.emptyButton}>
                <FontAwesomeIcon icon={faUserPlus} />
                <span>İlk hastanızı ekleyin</span>
              </Link>
            )}
          </div>
        ) : (
          <div className={patientStyles.patientsList}>
            {filteredPatients.map((patient) => (
              <div key={patient.id} className={patientStyles.patientCard}>
                <div className={patientStyles.patientAvatar}>
                  <FontAwesomeIcon icon={faUser} />
                </div>
                <div className={patientStyles.patientInfo}>
                  <h3>{patient.name}</h3>
                  <p>{patient.email}</p>
                </div>
                <div className={patientStyles.patientActions}>
                  <button 
                    className={patientStyles.viewButton} 
                    onClick={() => handleViewPatient(patient)}
                  >
                    Detayları Görüntüle
                  </button>
                  <button 
                    className={patientStyles.removeButton} 
                    onClick={() => handleRemovePatient(patient)}
                    title="Hastayı listenizden kaldırın"
                  >
                    <FontAwesomeIcon icon={faTrashAlt} /> Kaldır
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {upcomingAppointments.length > 0 && (
          <>
            <div className={styles.sectionHeader}>
              <h2>
                <FontAwesomeIcon icon={faCalendarAlt} className={styles.sectionIcon} />
                Başlayan Randevular
              </h2>
              <Link href="/randevular" className={styles.viewAllLink}>
                Tümünü Görüntüle
              </Link>
            </div>
            
            <div className={styles.appointmentsList}>
              {upcomingAppointments.map((appointment) => {
                const appointmentDate = parseISO(appointment.date);
                const dateString = format(appointmentDate, 'dd MMMM yyyy', { locale: tr });
                
                return (
                  <div key={appointment.id} className={styles.appointmentItem}>
                    <div className={styles.appointmentIcon}>
                      <FontAwesomeIcon icon={faCalendarCheck} />
                    </div>
                    <div className={styles.appointmentDetails}>
                      <div className={styles.appointmentTitle}>
                        <span className={styles.patientName}>{appointment.patientName}</span>
                        <span className={styles.appointmentType}>{appointment.type}</span>
                      </div>
                      <div className={styles.appointmentTime}>
                        {dateString}, {appointment.time}
                      </div>
                    </div>
                    <Link href={`/randevular?id=${appointment.id}`} className={styles.viewAppointmentButton}>
                      Seansa Git
                    </Link>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    );
  };
  
  return (
    <DashboardLayout>
      {isLoading && !userProfile ? (
        <div className={styles.loadingContainer}>
          <FontAwesomeIcon icon={faSyncAlt} spin className={styles.loadingIcon} />
          <p>Veriler yükleniyor...</p>
        </div>
      ) : userProfile?.userType === 'caregiver' ? (
        renderCaregiverDashboard()
      ) : (
        <PatientDashboard userProfile={userProfile} />
      )}

      {showDetailModal && selectedPatient && renderPatientDetailModal()}
    </DashboardLayout>
  );
}
