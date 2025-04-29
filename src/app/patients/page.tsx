'use client';

import DashboardLayout from '@/components/DashboardLayout';
import Modal from '@/components/Modal';
import ProgressChart from '@/components/ProgressChart';
import { useAuth } from '@/context/AuthContext';
import firestoreService from '@/lib/services/firestoreService';
import { ProgressDataPoint } from '@/types/user';
import {
    faCalendarPlus,
    faExclamationTriangle,
    faSearch,
    faSyncAlt,
    faTimes,
    faTrashAlt,
    faUser,
    faUserPlus
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './patients.module.css';

// Hasta veri tipi
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

export default function PatientsPage() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [patients, setPatients] = useState<PatientData[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<PatientData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<PatientData | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Kullanıcı ve hasta verilerini yükle
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
          
          // Sadece bakıcı rolünde olanlar bu sayfaya erişebilir
          if (profile.userType !== 'caregiver') {
            router.push('/dashboard');
            return;
          }
          
          // Bakıcının hastalarını yükle
          loadPatients();
        }
      } catch (err) {
        console.error('Kullanıcı profili yüklenirken bir hata oluştu:', err);
        setError('Kullanıcı profiliniz yüklenirken bir sorun oluştu.');
        setIsLoading(false);
      }
    };
    
    loadUserProfile();
  }, [currentUser, router]);

  // Arama filtresi
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

  // Hasta verilerini yükle
  const loadPatients = async () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Hastalar yükleniyor...');
      const loadedPatients = await firestoreService.getCaregiverPatients(currentUser.uid);
      
      if (Array.isArray(loadedPatients)) {
        // Her hasta için randevu sayısını getir
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
        setError('Hasta verileri geçersiz formatta.');
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

  // Hasta detaylarını göster
  const handleViewPatient = async (patient: PatientData) => {
    setIsLoading(true);
    
    try {
      console.log('Hasta detayları yükleniyor:', patient);
      
      // Hasta için ek verileri yükle
      const stats = await firestoreService.getUserStats(patient.id);
      const progress = await firestoreService.getUserProgress(patient.id);
      
      // İlerleme değerlerinin ortalamasını hesapla
      let progressAverage = 0;
      if (progress && progress.data && progress.data.length > 0) {
        const progressSum = progress.data.reduce((total: number, point: ProgressDataPoint) => total + point.progress, 0);
        progressAverage = Math.round(progressSum / progress.data.length);
        
        // Eğer stats null ise bir obje oluştur, değilse mevcut stats'i kullan
        const updatedStats = stats || {};
        // progressPercentage'ı hesaplanan ortalama değerle güncelle
        updatedStats.progressPercentage = progressAverage;
        
        const detailedPatient = {
          ...patient,
          stats: updatedStats,
          progress
        };
        
        console.log('Detaylı hasta verileri:', detailedPatient);
        setSelectedPatient(detailedPatient);
      } else {
        // İlerleme verisi yoksa mevcut verilerle devam et
        const detailedPatient = {
          ...patient,
          stats,
          progress
        };
        
        console.log('Detaylı hasta verileri:', detailedPatient);
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

  // Hasta-bakıcı ilişkisini silme işlemi
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
      
      // Hasta listesinden de kaldır
      setPatients(prev => prev.filter(p => p.id !== patient.id));
      setFilteredPatients(prev => prev.filter(p => p.id !== patient.id));
    
    } catch (err) {
      console.error("Hasta ilişkisi silinirken hata oluştu:", err);
      alert("Hasta kaldırılırken bir sorun oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  // Hasta detay modalı içeriği
  const renderPatientDetailModal = () => {
    if (!selectedPatient) return null;

    return (
      <Modal title={`Hasta Detayları: ${selectedPatient.name}`} onClose={handleCloseModal}>
        <div className={styles.modalContent}>
          <div className={styles.patientHeader}>
            <div className={styles.patientAvatar}>
              <FontAwesomeIcon icon={faUser} />
            </div>
            <div className={styles.patientInfo}>
              <h2>{selectedPatient.name}</h2>
              <p>{selectedPatient.email}</p>
            </div>

            <div className={styles.actionsSection}>
            <Link href={`/randevular/olustur?patientId=${selectedPatient.id}&patientName=${encodeURIComponent(selectedPatient.name)}&caregiverName=${encodeURIComponent(currentUser?.displayName || '')}`} className={styles.actionButton}>
              <FontAwesomeIcon icon={faCalendarPlus} />
              <span>Randevu Oluştur</span>
            </Link>
          </div>
          </div>
          
          <div className={styles.statsSection}>
            <h3 className={styles.sectionTitle}>İstatistikler</h3>
            <div className={styles.statsGrid}>
              <div className={styles.statItem}>
                <div className={styles.statTitle}>Randevular</div>
                <div className={styles.statValue}>
                  {selectedPatient.upcomingAppointments || 0}
                </div>
              </div>
              
              {selectedPatient.stats && (
                <>
                  <div className={styles.statItem}>
                      <div className={styles.statTitle}>Toplanan Elmalar</div>
                      <div className={styles.statValue}>{selectedPatient.stats.totalCollectedApples || 0}</div>
                  </div>
                  
                  <div className={styles.statItem}>
                    <div className={styles.statTitle}>İlerleme</div>
                    <div className={styles.statValue}>
                      %{selectedPatient.stats.progressPercentage || 0}
                    </div>
                  </div>
                  
                  
                  <div className={styles.statItem}>
                    <div className={styles.statTitle}>Maksimum Seviye</div>
                    <div className={styles.statValue}>
                      {selectedPatient.stats.maxLevel || 1}
                    </div>
                  </div>

                </>
              )}
            </div>
          </div>
          
          {selectedPatient.progress && selectedPatient.progress.data && (
            <div className={styles.chartSection}>
              <h3 className={styles.sectionTitle}>İlerleme Grafiği</h3>
              <div className={styles.chartContainer}>
                <ProgressChart data={selectedPatient.progress.data as ProgressDataPoint[]} height={300} />
              </div>
            </div>
          )}
        </div>
      </Modal>
    );
  };

  return (
    <DashboardLayout>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Hastalarım</h1>
          <div className={styles.headerActions}>
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

        {error && (
          <div className={styles.errorMessage}>
            <FontAwesomeIcon icon={faExclamationTriangle} />
            <p>{error}</p>
          </div>
        )}

        <div className={styles.searchBox}>
          <div className={styles.searchInput}>
            <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Hasta adı veya e-posta adresi ile ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className={styles.clearButton}
                onClick={() => setSearchQuery('')}
                title="Temizle"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className={styles.loading}>
            <FontAwesomeIcon icon={faSyncAlt} spin />
            <p>Hastalar yükleniyor...</p>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className={styles.emptyState}>
            <FontAwesomeIcon icon={faUser} className={styles.emptyIcon} />
            <p>
              {searchQuery
                ? 'Arama kriterlerinize uygun hasta bulunamadı.'
                : 'Henüz hiç hasta eklememişsiniz.'}
            </p>
            {!searchQuery && (
              <Link href="/patients/add" className={styles.emptyButton}>
                <FontAwesomeIcon icon={faUserPlus} />
                <span>İlk hastanızı ekleyin</span>
              </Link>
            )}
          </div>
        ) : (
          <div className={styles.patientsList}>
            {filteredPatients.map((patient) => (
              <div key={patient.id} className={styles.patientCard}>
                <div className={styles.patientAvatar}>
                  <FontAwesomeIcon icon={faUser} />
                </div>
                <div className={styles.patientInfo}>
                  <h3>{patient.name}</h3>
                  <p>{patient.email}</p>
                </div>
                <div className={styles.patientActions}>
                  <button 
                    className={styles.viewButton} 
                    onClick={() => handleViewPatient(patient)}
                  >
                    Detayları Görüntüle
                  </button>
                  <button 
                    className={styles.removeButton} 
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

        {/* Hasta Detay Modalı */}
        {showDetailModal && selectedPatient && renderPatientDetailModal()}
      </div>
    </DashboardLayout>
  );
}
