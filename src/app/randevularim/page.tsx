'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import firestoreService from '@/lib/services/firestoreService';
import { formatDate } from '@/utils/formatters';
import {
    faCalendarAlt,
    faClock,
    faExclamationTriangle,
    faLocationDot,
    faSearch,
    faSyncAlt,
    faTimes,
    faUser
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './randevularim.module.css';

interface Appointment {
  id: string;
  patientId: string;
  caregiverId: string;
  date: string;
  location: string;
  notes?: string;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  caregiverName?: string;
}

const statusLabels: Record<string, { label: string; className: string }> = {
  pending: { label: 'Beklemede', className: styles.statusPending },
  accepted: { label: 'Onaylandı', className: styles.statusAccepted },
  completed: { label: 'Tamamlandı', className: styles.statusCompleted },
  cancelled: { label: 'İptal Edildi', className: styles.statusCancelled }
};

export default function PatientAppointmentsPage() {
  const { currentUser } = useAuth();
  const router = useRouter();
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [caregivers, setCaregivers] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Kullanıcı kontrolü ve randevuları yükleme
  useEffect(() => {
    if (!currentUser) {
      router.push('/oturum-ac');
      return;
    }
    
    loadAppointments();
  }, [currentUser, router]);
  
  // Arama ve filtreleme işlemleri
  useEffect(() => {
    if (appointments.length > 0) {
      let filtered = [...appointments];
      
      // Durum filtreleme
      if (filterStatus !== 'all') {
        filtered = filtered.filter(appointment => appointment.status === filterStatus);
      }
      
      // Arama filtreleme
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(appointment => {
          const caregiverName = caregivers[appointment.caregiverId]?.displayName?.toLowerCase() || '';
          const location = appointment.location.toLowerCase();
          
          return caregiverName.includes(query) || 
                 location.includes(query) ||
                 formatDate(appointment.date).toLowerCase().includes(query);
        });
      }
      
      setFilteredAppointments(filtered);
    }
  }, [appointments, searchQuery, filterStatus, caregivers]);

  const loadAppointments = async () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Hasta olarak kendi randevularını getir
      const appointmentsData = await firestoreService.getPatientAppointments(currentUser.uid);
      console.log('Randevular yüklendi:', appointmentsData);
      
      // Randevuların bakıcı bilgilerini yükle
      const caregiverIds = [...new Set(appointmentsData.map(appt => appt.caregiverId))];
      const caregiversData: Record<string, any> = {};
      
      // Her bakıcının bilgilerini al
      await Promise.all(caregiverIds.map(async (id) => {
        try {
          const profile = await firestoreService.getUserProfile(id);
          if (profile) {
            caregiversData[id] = profile;
          }
        } catch (err) {
          console.error(`Bakıcı bilgileri alınamadı (${id}):`, err);
        }
      }));
      
      setCaregivers(caregiversData);
      
      // Randevuları tarih sırasına göre sırala (en yakın önce)
      const sortedAppointments = appointmentsData
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      setAppointments(sortedAppointments);
      setFilteredAppointments(sortedAppointments);
    } catch (err) {
      console.error('Randevular yüklenirken hata:', err);
      setError('Randevularınız yüklenirken bir sorun oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const viewAppointmentDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailsModal(true);
  };
  
  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedAppointment(null);
  };
  
  const formatAppointmentTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusClass = (status: string) => {
    return statusLabels[status]?.className || '';
  };

  const getStatusLabel = (status: string) => {
    return statusLabels[status]?.label || status;
  };

  const getCaregiverName = (caregiverId: string) => {
    return caregivers[caregiverId]?.displayName || 'İsim Bulunamadı';
  };

  return (
    <DashboardLayout>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.title}>
            <h1>Randevularım</h1>
            <p className={styles.subtitle}>Bakıcılarınızla olan randevularınızı görüntüleyin ve yönetin</p>
          </div>
          <button
            className={styles.refreshButton}
            onClick={loadAppointments}
            disabled={isLoading}
            title="Yenile"
          >
            <FontAwesomeIcon icon={faSyncAlt} spin={isLoading} />
          </button>
        </div>

        {error && (
          <div className={styles.errorMessage}>
            <FontAwesomeIcon icon={faExclamationTriangle} />
            <p>{error}</p>
          </div>
        )}

        <div className={styles.filtersRow}>
          <div className={styles.searchBox}>
            <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Bakıcı, tarih veya konum ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
            {searchQuery && (
              <button
                className={styles.clearButton}
                onClick={() => setSearchQuery('')}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            )}
          </div>

          <div className={styles.statusFilter}>
            <span>Durum: </span>
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className={styles.statusSelect}
            >
              <option value="all">Tümü</option>
              <option value="pending">Beklemede</option>
              <option value="accepted">Onaylandı</option>
              <option value="completed">Tamamlandı</option>
              <option value="cancelled">İptal Edildi</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className={styles.loading}>
            <FontAwesomeIcon icon={faSyncAlt} spin />
            <p>Randevularınız yükleniyor...</p>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className={styles.emptyState}>
            <FontAwesomeIcon icon={faCalendarAlt} className={styles.emptyIcon} />
            <h3>Hiç randevunuz yok!</h3>
            <p>
              {searchQuery || filterStatus !== 'all'
                ? 'Arama kriterlerinize uygun randevu bulunamadı.'
                : 'Henüz bakıcılarınız tarafından oluşturulmuş bir randevunuz bulunmuyor.'}
            </p>
          </div>
        ) : (
          <div className={styles.appointmentsList}>
            {filteredAppointments.map(appointment => (
              <div 
                key={appointment.id} 
                className={styles.appointmentCard}
                onClick={() => viewAppointmentDetails(appointment)}
              >
                <div className={styles.appointmentHeader}>
                  <div className={styles.appointmentDate}>
                    <FontAwesomeIcon icon={faCalendarAlt} />
                    <span>{formatDate(appointment.date)}</span>
                  </div>
                  <div className={`${styles.appointmentStatus} ${getStatusClass(appointment.status)}`}>
                    {getStatusLabel(appointment.status)}
                  </div>
                </div>
                
                <div className={styles.appointmentBody}>
                  <div className={styles.appointmentDetail}>
                    <FontAwesomeIcon icon={faClock} />
                    <span>{formatAppointmentTime(appointment.date)}</span>
                  </div>
                  
                  <div className={styles.appointmentDetail}>
                    <FontAwesomeIcon icon={faLocationDot} />
                    <span>{appointment.location}</span>
                  </div>
                  
                  <div className={styles.appointmentDetail}>
                    <FontAwesomeIcon icon={faUser} />
                    <span>Bakıcı: {getCaregiverName(appointment.caregiverId)}</span>
                  </div>
                </div>
                
                <div className={styles.appointmentFooter}>
                  <button className={styles.detailsButton}>
                    Detayları Görüntüle
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Randevu Detay Modalı */}
        {showDetailsModal && selectedAppointment && (
          <div className={styles.modalOverlay} onClick={closeDetailsModal}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>Randevu Detayları</h2>
                <button className={styles.closeButton} onClick={closeDetailsModal}>
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
              
              <div className={styles.modalBody}>
                <div className={`${styles.appointmentStatus} ${getStatusClass(selectedAppointment.status)}`}>
                  {getStatusLabel(selectedAppointment.status)}
                </div>
                
                <div className={styles.detailItem}>
                  <div className={styles.detailLabel}>
                    <FontAwesomeIcon icon={faCalendarAlt} />
                    <span>Tarih</span>
                  </div>
                  <div className={styles.detailValue}>
                    {formatDate(selectedAppointment.date)}
                  </div>
                </div>
                
                <div className={styles.detailItem}>
                  <div className={styles.detailLabel}>
                    <FontAwesomeIcon icon={faClock} />
                    <span>Saat</span>
                  </div>
                  <div className={styles.detailValue}>
                    {formatAppointmentTime(selectedAppointment.date)}
                  </div>
                </div>
                
                <div className={styles.detailItem}>
                  <div className={styles.detailLabel}>
                    <FontAwesomeIcon icon={faLocationDot} />
                    <span>Konum</span>
                  </div>
                  <div className={styles.detailValue}>
                    {selectedAppointment.location}
                  </div>
                </div>
                
                <div className={styles.detailItem}>
                  <div className={styles.detailLabel}>
                    <FontAwesomeIcon icon={faUser} />
                    <span>Bakıcı</span>
                  </div>
                  <div className={styles.detailValue}>
                    {getCaregiverName(selectedAppointment.caregiverId)}
                  </div>
                </div>
                
                {selectedAppointment.notes && (
                  <div className={styles.notes}>
                    <h3>Notlar</h3>
                    <p>{selectedAppointment.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
