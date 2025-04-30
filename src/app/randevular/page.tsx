'use client';

import DashboardLayout from '@/components/DashboardLayout';
import Modal from '@/components/Modal';
import { useAuth } from '@/context/AuthContext';
import firestoreService from '@/lib/services/firestoreService';
import { AppointmentData, UserProfile } from '@/types/user';
import { useRouter } from 'next/navigation';

import {
  faAppleAlt,
  faCalendar,
  faCalendarCheck,
  faCalendarPlus,
  faCalendarTimes,
  faClipboardCheck,
  faExclamationTriangle,
  faFilter,
  faHourglass,
  faInfoCircle,
  faMapMarkedAlt,
  faSearch,
  faTimes,
  faTrashAlt,
  faUserMd
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { format, isAfter, isBefore, isToday, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useEffect, useState } from 'react';
import styles from './randevular.module.css';

export default function Randevular() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('upcoming');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showStartModal, setShowStartModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentData | null>(null);
  const [selectedLevel, setSelectedLevel] = useState(1);  const [caregivers, setCaregivers] = useState<{id: string, name: string}[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [newAppointment, setNewAppointment] = useState({
    caregiverId: '',
    caregiverName: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '09:00',
    type: 'Rehabilitasyon Seansı',
    notes: ''
  });

  const [basketPosition, setBasketPosition] = useState({
    x: 0,
    y: 0,
    z: 0
  });
  
  const [applePosition, setApplePosition] = useState({
    x: 0,
    y: 0,
    z: 0
  });
  
  const [dynamicConfigured, setDynamicConfigured] = useState(false);

  // Tüm randevuları silme işlemi için state'ler
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);

  useEffect(() => {
    if (!currentUser) return;

    const loadData = async () => {
      try {
        const profile = await firestoreService.getUserProfile(currentUser.uid);
        setUserProfile(profile);

        let appointmentsList: AppointmentData[] = [];
        
        if (profile?.userType === 'patient') {
          appointmentsList = await firestoreService.getPatientAppointments(currentUser.uid);
          
          const relations = await firestoreService.getCaregiverPatients(currentUser.uid);
          const caregiversList = await Promise.all(
            relations.map(async (relation) => {
              const caregiver = await firestoreService.getUserProfile(relation.caregiverId);
              return {
                id: relation.caregiverId,
                name: caregiver?.displayName || 'İsimsiz'
              };
            })
          );
          setCaregivers(caregiversList);
        } else {
          appointmentsList = await firestoreService.getCaregiverAppointments(currentUser.uid);
        }
        
        setAppointments(appointmentsList);
      } catch (err) {
        console.error("Veri yükleme hatası:", err);
        setError("Veriler yüklenirken bir hata oluştu.");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [currentUser]);

  const handleAddAppointment = async () => {
    if (!currentUser || !userProfile) return;
    
    try {
      const selectedCaregiver = caregivers.find(c => c.id === newAppointment.caregiverId);
      
      if (!selectedCaregiver) {
        alert('Lütfen bir Kullanıcı seçin');
        return;
      }
      
      const appointmentData: Omit<AppointmentData, 'id' | 'createdAt' | 'updatedAt'> = {
        patientId: currentUser.uid,
        patientName: userProfile.displayName,
        caregiverId: selectedCaregiver.id,
        caregiverName: selectedCaregiver.name,
        date: newAppointment.date,
        time: newAppointment.time,
        type: newAppointment.type,
        notes: newAppointment.notes,
        status: 'pending',
        currentLevel: 1,
        collectedApples: 0
      };
      
      await firestoreService.createAppointment(appointmentData);
      
      setNewAppointment({
        caregiverId: '',
        caregiverName: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        time: '09:00',
        type: 'Rehabilitasyon Seansı',
        notes: ''
      });
      setShowAddModal(false);
      
      const updatedAppointments = await firestoreService.getPatientAppointments(currentUser.uid);
      setAppointments(updatedAppointments);
      
    } catch (err) {
      console.error("Randevu oluşturma hatası:", err);
      alert("Randevu oluşturulurken bir hata oluştu.");
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!currentUser) return;
    
    if (window.confirm('Bu randevuyu iptal etmek istediğinizden emin misiniz?')) {
      try {
        await firestoreService.updateAppointmentStatus(appointmentId, 'cancelled');
        
        setAppointments(prev => 
          prev.map(appointment => 
            appointment.id === appointmentId 
              ? {...appointment, status: 'cancelled'} 
              : appointment
          )
        );
        
      } catch (err) {
        console.error("Randevu iptal hatası:", err);
        alert("Randevu iptal edilirken bir hata oluştu.");
      }
    }
  };

  const handleLevelChange = async (level: number) => {
    if (!selectedAppointment) return;
    
    try {
      await firestoreService.updateAppointmentLevel(selectedAppointment.id, level);
      
      setSelectedLevel(level);
      setSelectedAppointment(prev => prev ? {...prev, currentLevel: level} : null);
      
      setAppointments(prev => 
        prev.map(appointment => 
          appointment.id === selectedAppointment.id 
            ? {...appointment, currentLevel: level} 
            : appointment
        )
      );
      
      if (level === 9) {
        try {
          const positionData = await firestoreService.getAppointmentPositionData(selectedAppointment.id);
          
          if (positionData) {
            setBasketPosition(positionData.basketPosition || { x: 0, y: 0, z: 0 });
            setApplePosition(positionData.applePosition || { x: 0, y: 0, z: 0 });
            setDynamicConfigured(true);
          } else {
            setBasketPosition({ x: 0, y: 0, z: 0 });
            setApplePosition({ x: 0, y: 0, z: 0 });
            
            await firestoreService.saveAppointmentPositionData(
              selectedAppointment.id, 
              { x: 0, y: 0, z: 0 }, 
              { x: 0, y: 0, z: 0 }
            );
            
            setDynamicConfigured(true);
          }
        } catch (error) {
          console.error("Pozisyon verisi yüklenirken hata:", error);
        }
      } else if (dynamicConfigured) {
        await firestoreService.deleteAppointmentPositionData(selectedAppointment.id);
        setDynamicConfigured(false);
      }
      
    } catch (err) {
      console.error("Seviye güncelleme hatası:", err);
      alert("Seviye güncellenirken bir hata oluştu.");
    }
  };
  
  const handleBasketPositionChange = async (axis: 'x' | 'y' | 'z', value: string) => {
    if (!selectedAppointment || selectedLevel !== 9) return;
    
    const numValue = parseInt(value) || 0;
    const newBasketPosition = { ...basketPosition, [axis]: numValue };
    setBasketPosition(newBasketPosition);
    
    try {
      await firestoreService.updateAppointmentBasketPosition(selectedAppointment.id, newBasketPosition);
    } catch (error) {
      console.error("Sepet pozisyonu güncellenirken hata:", error);
    }
  };
  
  const handleApplePositionChange = async (axis: 'x' | 'y' | 'z', value: string) => {
    if (!selectedAppointment || selectedLevel !== 9) return;
    
    const numValue = parseInt(value) || 0;
    const newApplePosition = { ...applePosition, [axis]: numValue };
    setApplePosition(newApplePosition);
    
    try {
      await firestoreService.updateAppointmentApplePosition(selectedAppointment.id, newApplePosition);
    } catch (error) {
      console.error("Elma pozisyonu güncellenirken hata:", error);
    }
  };

  const handleStartAppointment = async (appointment: AppointmentData) => {
    try {
      const updatedAppointmentData = await firestoreService.getAppointment(appointment.id);
      
      const currentLevel = updatedAppointmentData?.currentLevel || appointment.currentLevel || 1;
      
      const collectedApples = updatedAppointmentData?.collectedApples !== undefined ? 
        updatedAppointmentData.collectedApples : 
        appointment.collectedApples || 0;
      
      
      if (appointment.status === 'pending') {
        await firestoreService.startAppointment(appointment.id, currentLevel, collectedApples);
      } else {
        await firestoreService.updateAppointmentLevel(appointment.id, currentLevel, collectedApples);
      }
      
      const updatedAppointment = { 
        ...appointment, 
        status: 'accepted', 
        currentLevel: currentLevel,
        collectedApples: collectedApples  
      };
      
      setAppointments(prev => 
        prev.map(app => 
          app.id === appointment.id 
            ? updatedAppointment 
            : app
        )
      );
      
      setSelectedAppointment(updatedAppointment);
      setSelectedLevel(currentLevel);
      setShowStartModal(true);
      
      startListeningToAppointmentData(appointment.id);
    } catch (err) {
      console.error("Randevu başlatma hatası:", err);
      alert("Randevu başlatılırken bir hata oluştu.");
    }
  };
  
  const startListeningToAppointmentData = (appointmentId: string) => {
    const unsubscribe = firestoreService.listenToAppointmentChanges(
      appointmentId,
      (updatedData) => {
        if (updatedData) {
          setSelectedAppointment(prevAppt => {
            if (prevAppt && prevAppt.id === appointmentId) {
              return {
                ...prevAppt,
                collectedApples: updatedData.collectedApples || 0,
                currentLevel: updatedData.currentLevel || prevAppt.currentLevel
              };
            }
            return prevAppt;
          });
          
          setAppointments(prevAppts => {
            return prevAppts.map(appt => 
              appt.id === appointmentId 
                ? {
                    ...appt,
                    collectedApples: updatedData.collectedApples || 0,
                    currentLevel: updatedData.currentLevel || appt.currentLevel
                  }
                : appt
            );
          });
        }
      }
    );
    
    return unsubscribe;
  };
  
  const handleCompleteSession = async () => {
    if (!selectedAppointment || !currentUser || userProfile?.userType !== 'caregiver') return;
    
    try {
      await firestoreService.updateAppointmentStatus(selectedAppointment.id, 'completed');
      
      await firestoreService.updateUserStatsOnCompletion(
        selectedAppointment.patientId, 
        selectedAppointment.currentLevel || 1, 
        selectedAppointment.collectedApples || 0
      );
      
      setAppointments(prev => 
        prev.map(appointment => 
          appointment.id === selectedAppointment.id 
            ? {...appointment, status: 'completed'} 
            : appointment
        )
      );
      
      setShowStartModal(false);
      setSelectedAppointment(null);
      
    } catch (err) {
      console.error("Randevu tamamlama hatası:", err);
      alert("Randevu tamamlanırken bir hata oluştu.");
    }
  };
  
  const handleDeleteAppointment = async (appointmentId: string) => {
    if (!currentUser) return;
    
    if (window.confirm('Bu randevuyu kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      try {
        await firestoreService.deleteAppointment(appointmentId);
        
        setAppointments(prev => prev.filter(appointment => appointment.id !== appointmentId));
        
      } catch (err) {
        console.error("Randevu silme hatası:", err);
        alert("Randevu silinirken bir hata oluştu.");
      }
    }
  };

  const handlePauseSession = () => {
    setShowStartModal(false);
  };
  
  const handleDeleteAllAppointments = async () => {
    if (!currentUser) return;
    
    setDeletingAll(true);
    try {
      // Tüm randevuları silme işlemi
      await firestoreService.deleteAllCaregiverAppointments(currentUser.uid);
      
      // Randevuların listesini güncelle
      setAppointments([]);
      setShowDeleteAllModal(false);
      
      // Başarılı mesajı göster
      setError(null);
      alert('Tüm randevular başarıyla silindi.');
    } catch (err) {
      console.error("Tüm randevuları silme hatası:", err);
      setError("Randevular silinirken bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setDeletingAll(false);
    }
  };
    const filteredAppointments = appointments.filter(appointment => {
    const appointmentDate = parseISO(appointment.date);
    
    // Durum filtresi
    let statusMatch = true;
    if (filter === 'upcoming') {
      statusMatch = (isToday(appointmentDate) || isAfter(appointmentDate, new Date())) && 
              (appointment.status === 'pending' || appointment.status === 'accepted');
    } else if (filter === 'pending') {
      statusMatch = appointment.status === 'pending';
    } else if (filter === 'accepted') {
      statusMatch = appointment.status === 'accepted';
    } else if (filter === 'completed') {
      statusMatch = appointment.status === 'completed';
    } else if (filter === 'cancelled') {
      statusMatch = appointment.status === 'cancelled';
    } else if (filter === 'today') {
      statusMatch = isToday(appointmentDate);
    } else if (filter === 'past') {
      statusMatch = isBefore(appointmentDate, new Date()) && !isToday(appointmentDate);
    } else if (filter === 'all') {
      statusMatch = true;
    }
      // Arama sorgusu filtrelemesi
    let searchMatch = true;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const patientName = appointment.patientName ? appointment.patientName.toLowerCase() : '';
      const caregiverName = appointment.caregiverName ? appointment.caregiverName.toLowerCase() : '';
      const appointmentType = appointment.type ? appointment.type.toLowerCase() : '';
      const formattedDate = format(appointmentDate, 'dd MMMM yyyy', { locale: tr }).toLowerCase();
      const notes = appointment.notes?.toLowerCase() || '';
      
      searchMatch = patientName.includes(query) || 
                   caregiverName.includes(query) ||
                   appointmentType.includes(query) ||
                   formattedDate.includes(query) ||
                   notes.includes(query);
    }
    
    return statusMatch && searchMatch;
  });

  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    const dateComparison = new Date(a.date).getTime() - new Date(b.date).getTime();
    if (dateComparison !== 0) return dateComparison;
    
    return a.time.localeCompare(b.time);
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return styles.pending;
      case 'accepted': return styles.accepted;
      case 'completed': return styles.completed;
      case 'cancelled': return styles.cancelled;
      default: return '';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Bekliyor';
      case 'accepted': return 'Başladı';
      case 'completed': return 'Tamamlandı';
      case 'cancelled': return 'İptal Edildi';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return faHourglass;
      case 'accepted': return faCalendarCheck;
      case 'completed': return faClipboardCheck;
      case 'cancelled': return faCalendarTimes;
      default: return faCalendar;
    }
  };

  return (
    <DashboardLayout>
      <div className={styles.randevularContainer}>
        <div className={styles.randevuHeader}>
          <h1>
            <FontAwesomeIcon icon={faCalendar} className={styles.headerIcon} />
            Randevularım
          </h1>
          
          {userProfile?.userType === 'patient' && caregivers.length > 0 && (
            <button 
              className={styles.addButton}
              onClick={() => setShowAddModal(true)}
            >
              <FontAwesomeIcon icon={faCalendarPlus} />
              Randevu Oluştur
            </button>
          )}

          {userProfile?.userType === 'caregiver' && (
            <button 
              className={styles.deleteAllButton}
              onClick={() => setShowDeleteAllModal(true)}
            >
              <FontAwesomeIcon icon={faTrashAlt} />
              Tüm Randevuları Sil
            </button>
          )}
        </div>

        {error && (
          <div className={styles.errorMessage}>
            <FontAwesomeIcon icon={faExclamationTriangle} className={styles.errorIcon} />
            <p>{error}</p>
          </div>
        )}
          {userProfile?.userType === 'caregiver' && (
          <div className={styles.searchContainer}>
            <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Hasta adı, tarih veya not ile ara..."
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className={styles.searchClearButton}
                onClick={() => setSearchQuery('')}
                title="Aramayı Temizle"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            )}
          </div>
        )}        {userProfile?.userType === 'caregiver' && searchQuery && (
          <div className={styles.searchResults}>
            <p>
              <FontAwesomeIcon icon={faSearch} className={styles.searchResultIcon} />
              <strong>&ldquo;{searchQuery}&rdquo;</strong> için {sortedAppointments.length} sonuç bulundu
              {sortedAppointments.length > 0 && filter !== 'all' && (
                <> ({filter === 'upcoming' ? 'yaklaşan' : filter === 'pending' ? 'bekleyen' : 
                     filter === 'accepted' ? 'onaylanan' : filter === 'completed' ? 'tamamlanan' : 
                     filter === 'cancelled' ? 'iptal edilen' : filter === 'today' ? 'bugünkü' : 'geçmiş'} randevularda)</>
              )}
            </p>
          </div>
        )}

        <div className={styles.filterContainer}>
          <div className={styles.filterLabel}>
            <FontAwesomeIcon icon={faFilter} className={styles.filterIcon} />
            Filtrele:
          </div>
          <div className={styles.filterButtons}>
            <button 
              className={`${styles.filterButton} ${filter === 'upcoming' ? styles.active : ''}`}
              onClick={() => setFilter('upcoming')}
            >
              Yaklaşan
            </button>
            <button 
              className={`${styles.filterButton} ${filter === 'pending' ? styles.active : ''}`}
              onClick={() => setFilter('pending')}
            >
              Bekleyen
            </button>
            <button 
              className={`${styles.filterButton} ${filter === 'accepted' ? styles.active : ''}`}
              onClick={() => setFilter('accepted')}
            >
              Onaylanan
            </button>
            <button 
              className={`${styles.filterButton} ${filter === 'completed' ? styles.active : ''}`}
              onClick={() => setFilter('completed')}
            >
              Tamamlanan
            </button>
            <button 
              className={`${styles.filterButton} ${filter === 'cancelled' ? styles.active : ''}`}
              onClick={() => setFilter('cancelled')}
            >
              İptal Edilenler
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className={styles.loading}>Randevular yükleniyor...</div>        ) : sortedAppointments.length === 0 ? (
          <div className={styles.emptyState}>
            {searchQuery ? (
              <>
                <p>Aramanızla eşleşen randevu bulunamadı.</p>
                <button 
                  className={styles.resetFilterButton} 
                  onClick={() => {
                    setSearchQuery('');
                    setFilter('all');
                  }}
                >
                  Aramaları ve Filtreleri Temizle
                </button>
              </>
            ) : (
              <>
                <p>Gösterilecek randevu bulunamadı.</p>
                <button 
                  className={styles.resetFilterButton} 
                  onClick={() => setFilter('all')}
                >
                  Tüm Randevuları Göster
                </button>
              </>
            )}
          </div>
        ) : (
          <div className={styles.randevuList}>
            {sortedAppointments.map((appointment) => (
              <div key={appointment.id} className={styles.appointmentCard}>
                <div className={styles.appointmentInfo}>                    <div className={styles.appointmentDate}>
                    {format(parseISO(appointment.date), 'dd MMMM yyyy', { locale: tr })}
                    <span className={styles.appointmentTime}>
                      {appointment.date.includes("T") 
                        ? appointment.date.split("T")[1].split(":").slice(0, 2).join(":")
                        : appointment.time || ""}
                    </span>
                    </div>
                  
                  {userProfile?.userType === 'patient' && (
                    <div className={styles.appointmentDoctor}>
                      <FontAwesomeIcon icon={faUserMd} className={styles.doctorIcon} />
                      {appointment.caregiverName}
                    </div>
                  )}
                  

                  {userProfile?.userType === 'caregiver' && (
                    <div className={styles.appointmentDoctor}>
                      <FontAwesomeIcon icon={faUserMd} className={styles.patientIcon} />
                      {appointment.patientName}
                    </div>
                  )}
                  
                  <div className={styles.appointmentType}>
                    {appointment.type}
                  </div>
                  
                  {appointment.notes && (
                    <div className={styles.appointmentNotes}>
                      {appointment.notes}
                    </div>
                  )}
                </div>
                
                <div className={styles.appointmentStatus}>
                  <span className={`${styles.statusBadge} ${getStatusColor(appointment.status)}`}>
                    <FontAwesomeIcon icon={getStatusIcon(appointment.status)} className={styles.statusIcon} />
                    {getStatusLabel(appointment.status)}
                  </span>
                  
                  {/* Randevu aksiyon butonları */}
                  {appointment.status === 'pending' && (
                    <div className={styles.appointmentActions}>
                      {userProfile?.userType === 'caregiver' && (
                        <>
                          <button 
                            className={styles.acceptButton}
                            onClick={() => handleStartAppointment(appointment)}
                          >
                            Başlat
                          </button>
                          <button 
                            className={styles.rejectButton}
                            onClick={() => handleCancelAppointment(appointment.id)}
                          >
                            Reddet
                          </button>
                        </>
                      )}
                      
                      {userProfile?.userType === 'patient' && (
                        <button 
                          className={styles.cancelButton}
                          onClick={() => handleCancelAppointment(appointment.id)}
                        >
                          İptal Et
                        </button>
                      )}
                    </div>
                  )}
                  
                  {appointment.status === 'accepted' && (
                    <div className={styles.appointmentActions}>
                      {userProfile?.userType === 'caregiver' && !showStartModal && (
                        <button 
                          className={styles.continueButton}
                          onClick={() => handleStartAppointment(appointment)}
                        >
                          Devam Et
                        </button>
                      )}
                      
                      <button 
                        className={styles.cancelButton}
                        onClick={() => handleCancelAppointment(appointment.id)}
                      >
                        İptal Et
                      </button>
                    </div>
                  )}
                  
                  {appointment.status === 'cancelled' && userProfile?.userType === 'caregiver' && (
                    <div className={styles.appointmentActions}>
                      <button 
                        className={styles.deleteButton}
                        onClick={() => handleDeleteAppointment(appointment.id)}
                        title="Randevuyu kalıcı olarak sil"
                      >
                        <FontAwesomeIcon icon={faTrashAlt} />
                        <span>Sil</span>
                      </button>
                    </div>
                  )}

                  {appointment.status === 'completed' && userProfile?.userType === 'caregiver' && (
                    <div className={styles.appointmentActions}>
                      <button 
                        className={styles.deleteButton}
                        onClick={() => handleDeleteAppointment(appointment.id)}
                        title="Randevuyu kalıcı olarak sil"
                      >
                        <FontAwesomeIcon icon={faTrashAlt} />
                        <span>Sil</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Randevu Oluşturma Modal */}
      {showAddModal && (
        <Modal title="Randevu Talebi Oluştur" onClose={() => setShowAddModal(false)}>
          <div className={styles.appointmentForm}>
            <div className={styles.formGroup}>
              <label>Kullanıcı</label>
              <select 
                value={newAppointment.caregiverId}
                onChange={(e) => setNewAppointment({
                  ...newAppointment, 
                  caregiverId: e.target.value,
                  caregiverName: caregivers.find(c => c.id === e.target.value)?.name || ''
                })}
                required
              >
                <option value="">-- Kullanıcı Seçin --</option>
                {caregivers.map(caregiver => (
                  <option key={caregiver.id} value={caregiver.id}>
                    {caregiver.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Tarih</label>
                <input 
                  type="date"
                  value={newAppointment.date}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  onChange={(e) => setNewAppointment({...newAppointment, date: e.target.value})}
                  required
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Saat</label>
                <input 
                  type="time"
                  value={newAppointment.time}
                  onChange={(e) => setNewAppointment({...newAppointment, time: e.target.value})}
                  required
                />
              </div>
            </div>
            
            <div className={styles.formGroup}>
              <label>Randevu Türü</label>
              <select 
                value={newAppointment.type}
                onChange={(e) => setNewAppointment({...newAppointment, type: e.target.value})}
                required
              >
                <option value="Rehabilitasyon Seansı">Rehabilitasyon Seansı</option>
                <option value="Kontrol">Kontrol</option>
                <option value="Değerlendirme">Değerlendirme</option>
                <option value="Danışmanlık">Danışmanlık</option>
              </select>
            </div>
            
            <div className={styles.formGroup}>
              <label>Notlar</label>
              <textarea 
                value={newAppointment.notes}
                onChange={(e) => setNewAppointment({...newAppointment, notes: e.target.value})}
                placeholder="Randevu ile ilgili eklemek istediğiniz notlar..."
                rows={3}
              ></textarea>
            </div>
            
            <div className={styles.formActions}>
              <button 
                type="button" 
                className={styles.cancelModalButton}
                onClick={() => setShowAddModal(false)}
              >
                İptal
              </button>
              <button 
                type="button" 
                className={styles.createButton}
                onClick={handleAddAppointment}
              >
                Randevu Oluştur
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Randevu Seansı Modal - Çarpı butonu ara verme fonksiyonuna bağlı */}
      {showStartModal && selectedAppointment && (
        <Modal title="Rehabilitasyon Seansı" onClose={handlePauseSession}>
          <div className={styles.startSessionForm}>
            {/* Header Bölümü */}
            <div className={styles.sessionHeader}>
              <div className={styles.sessionTitle}>
                <h3>VR Elma Toplama Oyunu - Seans Kontrol Paneli</h3>
                <p>
                  Seans devam ediyor. Aşağıdan seviyeyi değiştirebilirsiniz. Seviye değişiklikleri anında uygulanacaktır.
                </p>
              </div>
            </div>
            
            {/* Bilgi Kartları Bölümü */}
            <div className={styles.sessionInfoCards}>
              <div className={styles.infoCard}>
                <span className={styles.infoLabel}>Hasta Adı</span>
                <span className={styles.infoValue}>{selectedAppointment.patientName}</span>
              </div>
              
              <div className={styles.infoCard}>
                <span className={styles.infoLabel}>Şu anki Seviye</span>
                <span className={styles.infoValue}>{selectedLevel}</span>
                <div className={styles.appleProgress}>
                  <div 
                    className={styles.levelProgressBar} 
                    style={{ width: `${Math.min((selectedLevel || 0) * 100/9, 100)}%` }}
                  ></div>
                </div>
              </div>
              
              <div className={styles.infoCard}>
                <span className={styles.infoLabel}>Toplanan Elmalar</span>
                <span className={styles.infoValue}>{selectedAppointment.collectedApples || 0}</span>
                <div className={styles.appleProgress}>
                  <div 
                    className={styles.appleProgressBar} 
                    style={{ width: `${Math.min((selectedAppointment.collectedApples || 0) * 5/3, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            {/* Kontrol Paneli Bölümü */}
            <div className={styles.controlPanel}>
              <div className={styles.controlItem}>
                <label className={styles.controlLabel}>Seviye Seçin</label>
                <div className={styles.levelGrid}>
                  {Array.from({ length: 9 }, (_, i) => i + 1).map(level => (
                    <div 
                      key={level}
                      className={`${styles.levelBox} ${level === selectedLevel ? styles.selectedLevel : ''}`}
                    >
                      <FontAwesomeIcon 
                        icon={faInfoCircle} 
                        className={styles.levelInfoIcon}
                        title={`Seviye ${level} hakkında bilgi`}
                        onClick={() => {
                          router.push('/dashboard')
                        }}
                      />
                      <div className={styles.asd} onClick={() => {
                        handleLevelChange(level)
                      }}
                        style={{
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          flexDirection: 'column',
                          zIndex: 50,
                          width: '100%',
                          height: '100%',
                      }}>
                        <span className={styles.levelNumber}>{level}</span>
                        <span className={styles.levelText}>
                          {level == 9 ? "(Dinamik)": null}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Dinamik Seviye (9) için pozisyon ayarları */}
              {selectedLevel === 9 && (
                <div className={styles.dynamicLevelSettings}>
                  <h4 className={styles.dynamicSettingsTitle}>
                    <FontAwesomeIcon icon={faMapMarkedAlt} /> 
                    Dinamik Konum Ayarları
                  </h4>
                  <p className={styles.dynamicSettingsDescription}>
                    Sepet ve elma için konum değerlerini belirleyin. Bu değerler VR uygulamasında doğrudan uygulanacaktır.
                  </p>
                  
                  <div className={styles.positionGroups}>
                    {/* Sepet Pozisyonu */}
                    <div className={styles.positionGroup}>
                      <div className={styles.positionHeader}>
                        <FontAwesomeIcon icon={faMapMarkedAlt} className={styles.positionIcon} />
                        <h5>Sepet Konumu</h5>
                      </div>
                      <div className={styles.positionInputs}>
                        <div className={styles.positionInput}>
                          <label>X: [-3,3]</label>
                          <input
                            type="number"
                            value={basketPosition.x}
                            onChange={(e) => {
                              if (parseInt(e.target.value) > 3) {
                                setBasketPosition({ ...basketPosition, x: 3 });
                              } else if (parseInt(e.target.value) < -3) {
                                setBasketPosition({ ...basketPosition, x: -3 });
                              } else {
                                setBasketPosition({ ...basketPosition, x: parseInt(e.target.value) });
                              }
                              if (e.target.value === "")
                                setBasketPosition({ ...basketPosition, x: 0 });
                            }}
                            min="-3"
                            max="3"
                          />
                        </div>
                        <div className={styles.positionInput}>
                          <label>Y: [0,3]</label>
                          <input
                            type="number"
                            value={basketPosition.y}
                            onChange={(e) => {
                              if (parseInt(e.target.value) > 3) {
                                setBasketPosition({ ...basketPosition, y: 3 });
                              } else if (parseInt(e.target.value) < 0) {
                                setBasketPosition({ ...basketPosition, y: 0 });
                              } else {
                                setBasketPosition({ ...basketPosition, y: parseInt(e.target.value) });
                              }
                              if (e.target.value === "")
                                setBasketPosition({ ...basketPosition, y: 0 });
                            }}
                            min="0"
                            max="3"
                          />
                        </div>
                        <div className={styles.positionInput}>
                          <label>Z: [-3,3]</label>
                          <input
                            type="number"
                            value={basketPosition.z}
                            onChange={(e) => {
                              if (parseInt(e.target.value) > 3) {
                                setBasketPosition({ ...basketPosition, z: 3 });
                              } else if (parseInt(e.target.value) < -3) {
                                setBasketPosition({ ...basketPosition, z: -3 });
                              } else {
                                setBasketPosition({ ...basketPosition, z: parseInt(e.target.value) });
                              }
                              if (e.target.value === "")
                                setBasketPosition({ ...basketPosition, z: 0 });
                            }}
                            min="-3"
                            max="3"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Elma Pozisyonu */}
                    <div className={styles.positionGroup}>
                      <div className={styles.positionHeader}>
                        <FontAwesomeIcon icon={faAppleAlt} className={styles.positionIcon} />
                        <h5>Elma Konumu</h5>
                      </div>
                      <div className={styles.positionInputs}>
                        <div className={styles.positionInput}>
                          <label>X: [-3,3]</label>
                          <input
                            type="number"
                            value={applePosition.x}
                            onChange={(e) => {
                              if (parseInt(e.target.value) > 3) {
                                setApplePosition({ ...applePosition, x: 3 });
                              } else if (parseInt(e.target.value) < -3) {
                                setApplePosition({ ...applePosition, x: -3 });
                              } else {
                                setApplePosition({ ...applePosition, x: parseInt(e.target.value) });
                              }
                              if (e.target.value === "")
                                setApplePosition({ ...applePosition, x: 0 });
                            }}
                            min="-3"
                            max="3"
                          />
                        </div>
                        <div className={styles.positionInput}>
                          <label>Y: [0,3]</label>
                          <input
                            type="number"
                            value={applePosition.y}
                            onChange={(e) => {
                              if (parseInt(e.target.value) > 3) {
                                setApplePosition({ ...applePosition, y: 3 });
                              } else if (parseInt(e.target.value) < 0) {
                                setApplePosition({ ...applePosition, y: 0 });
                              } else {
                                setApplePosition({ ...applePosition, y: parseInt(e.target.value) });
                              }
                              if (e.target.value === "")
                                setApplePosition({ ...applePosition, z: 0 }); 
                            }}
                            min="0"
                            max="3"
                          />
                        </div>
                        <div className={styles.positionInput}>
                          <label>Z: [-3,3]</label>
                          <input
                            type="number"
                            value={applePosition.z}
                            onChange={(e) => {
                              if (parseInt(e.target.value) > 3) {
                                setApplePosition({ ...applePosition, z: 3 });
                              } else if (parseInt(e.target.value) < -3) {
                                setApplePosition({ ...applePosition, z: -3 });
                              } else {
                                setApplePosition({ ...applePosition, z: parseInt(e.target.value) });
                              }
                              if (e.target.value === "")
                                setApplePosition({ ...applePosition, z: 0 }); 
                            }}
                            min="-3"
                            max="3"
                          />
                        </div>
                      </div>
                    </div>
                    <div className={styles.formActions}>
                      <button 
                        type="button" 
                        className={styles.completeButton}
                        id="applyButton"
                        onClick={
                          async () => {
                            const button = document.getElementById("applyButton");
                            button.setAttribute("disabled", "true");
                            button.innerHTML = "Kaydedildi";
                            await firestoreService.updateAppointmentTotalPosition(
                              selectedAppointment.id, 
                              basketPosition, 
                              applePosition
                            );
                            
                            setDynamicConfigured(true);
                            setTimeout(() => {
                              button.removeAttribute("disabled");
                              button.innerHTML = "Konumları Kaydet";
                            }, 750);
                          }
                        }
                        style={{
                          marginTop: '-15px'
                        }}
                      >
                        Konumları Kaydet
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Alt Bilgi Bölümü */}
            <div className={styles.sessionFooter}>
              <div className={styles.footerInfo}>
                <p>Seans bittiğinde "Seansı Tamamla" butonuna tıklayınız.</p>
                <p>Seansı durdurmanız durumunda ilerleme kaydedilecektir.</p>
              </div>
              <div className={styles.formActions}>
                <button 
                  type="button" 
                  className={styles.completeButton}
                  onClick={handleCompleteSession}
                >
                  Seansı Tamamla
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Tüm Randevuları Sil Modal */}
      {showDeleteAllModal && (
        <Modal title="Tüm Randevuları Sil" onClose={() => setShowDeleteAllModal(false)}>
          <div className={styles.deleteAllModalContent}>
            <p>
              Tüm randevuları silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </p>
            <div className={styles.formActions}>
              <button 
                type="button" 
                className={styles.cancelModalButton}
                onClick={() => setShowDeleteAllModal(false)}
                disabled={deletingAll}
              >
                İptal
              </button>
              <button 
                type="button" 
                className={styles.deleteButton}
                onClick={handleDeleteAllAppointments}
                disabled={deletingAll}
              >
                {deletingAll ? 'Siliniyor...' : 'Tümünü Sil'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
}
