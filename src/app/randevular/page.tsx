'use client';

import DashboardLayout from '@/components/DashboardLayout';
import Modal from '@/components/Modal';
import { useAuth } from '@/context/AuthContext';
import firestoreService from '@/lib/services/firestoreService';
import { AppointmentData, UserProfile } from '@/types/user';
import {
  faCalendar,
  faCalendarCheck,
  faCalendarPlus,
  faCalendarTimes,
  faClipboardCheck,
  faExclamationTriangle,
  faFilter,
  faHourglass,
  faTrashAlt,
  faUserMd
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { format, isAfter, isBefore, isToday, parseISO } from 'date-fns';
import tr from 'date-fns/locale/tr';
import { useEffect, useState } from 'react';
import styles from './randevular.module.css';

export default function Randevular() {
  const { currentUser } = useAuth();
  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('upcoming');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showStartModal, setShowStartModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentData | null>(null);
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [caregivers, setCaregivers] = useState<{id: string, name: string}[]>([]);
  
  // Yeni randevu form verileri
  const [newAppointment, setNewAppointment] = useState({
    caregiverId: '',
    caregiverName: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '09:00',
    type: 'Rehabilitasyon Seansı',
    notes: ''
  });

  useEffect(() => {
    if (!currentUser) return;

    const loadData = async () => {
      try {
        // Kullanıcı profilini yükle
        const profile = await firestoreService.getUserProfile(currentUser.uid);
        setUserProfile(profile);

        // Randevuları yükle
        let appointmentsList: AppointmentData[] = [];
        
        if (profile?.userType === 'patient') {
          // Hasta için randevular
          appointmentsList = await firestoreService.getPatientAppointments(currentUser.uid);
          
          // Bakıcıları yükle
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
          // Bakıcı için randevular
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
      // Seçilen bakıcı bilgilerini al
      const selectedCaregiver = caregivers.find(c => c.id === newAppointment.caregiverId);
      
      if (!selectedCaregiver) {
        alert('Lütfen bir bakıcı seçin');
        return;
      }
      
      // Yeni randevu oluştur
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
      
      // Firestore'a ekle
      await firestoreService.createAppointment(appointmentData);
      
      // Form temizle ve modalı kapat
      setNewAppointment({
        caregiverId: '',
        caregiverName: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        time: '09:00',
        type: 'Rehabilitasyon Seansı',
        notes: ''
      });
      setShowAddModal(false);
      
      // Randevuları yeniden yükle
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
        
        // Listeyi güncelle
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

  // Seviye değişikliklerini anında Firebase'e gönderen fonksiyon
  const handleLevelChange = async (level: number) => {
    if (!selectedAppointment) return;
    
    try {
      // Firebase'e seviye güncellemesini anında gönder
      await firestoreService.updateAppointmentLevel(selectedAppointment.id, level);
      
      // State'leri güncelle
      setSelectedLevel(level);
      setSelectedAppointment(prev => prev ? {...prev, currentLevel: level} : null);
      
      // Genel randevu listesini güncelle
      setAppointments(prev => 
        prev.map(appointment => 
          appointment.id === selectedAppointment.id 
            ? {...appointment, currentLevel: level} 
            : appointment
        )
      );
      
    } catch (err) {
      console.error("Seviye güncelleme hatası:", err);
      alert("Seviye güncellenirken bir hata oluştu.");
    }
  };

  // Randevu başlatma işlemi - seansı hemen başlat
  const handleStartAppointment = async (appointment: AppointmentData) => {
    try {
      // Önce güncel randevu verilerini Firebase'den al
      const updatedAppointmentData = await firestoreService.getAppointment(appointment.id);
      
      // Eğer randevu daha önce başlatıldıysa, mevcut verileri kullan
      // Firebase'den alınan verileri öncelikli olarak kullan, yoksa appointment'taki verileri al
      const currentLevel = updatedAppointmentData?.currentLevel || appointment.currentLevel || 1;
      
      // Toplanan elma sayısını Firebase'ten al, yoksa mevcut değeri kullan
      const collectedApples = updatedAppointmentData?.collectedApples !== undefined ? 
        updatedAppointmentData.collectedApples : 
        appointment.collectedApples || 0;
      
      console.log("Randevu verileri:", { currentLevel, collectedApples, updatedAppointmentData });
      
      // Randevuyu accepted olarak işaretle (eğer pending durumundaysa)
      if (appointment.status === 'pending') {
        // Eğer yeni başlatılıyorsa elma sayısını sıfırlama, mevcut değeri kullan
        await firestoreService.startAppointment(appointment.id, currentLevel, collectedApples);
      } else {
        // Eğer devam ediyorsa, sadece seviyeyi güncelle, elma sayısını değiştirme
        await firestoreService.updateAppointmentLevel(appointment.id, currentLevel, collectedApples);
      }
      
      // State'i güncelle - collectedApples değerini koru
      const updatedAppointment = { 
        ...appointment, 
        status: 'accepted', 
        currentLevel: currentLevel,
        collectedApples: collectedApples  // Toplanan elma sayısını koru
      };
      
      setAppointments(prev => 
        prev.map(app => 
          app.id === appointment.id 
            ? updatedAppointment 
            : app
        )
      );
      
      // Modalı açmak için state'i ayarla
      setSelectedAppointment(updatedAppointment);
      setSelectedLevel(currentLevel);
      setShowStartModal(true);
      
      // Başlatıldıktan sonra, randevu verilerini anlık dinlemeye başla
      startListeningToAppointmentData(appointment.id);
    } catch (err) {
      console.error("Randevu başlatma hatası:", err);
      alert("Randevu başlatılırken bir hata oluştu.");
    }
  };
  
  // Firebase'den randevu verilerini anlık dinle
  const startListeningToAppointmentData = (appointmentId: string) => {
    // Firebase'den anlık güncellemeleri dinle
    const unsubscribe = firestoreService.listenToAppointmentChanges(
      appointmentId,
      (updatedData) => {
        if (updatedData) {
          // Seçili randevu state'ini güncelle
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
          
          // Genel randevu listesini de güncelle
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
    
    // Modal kapatıldığında dinlemeyi sonlandır
    return unsubscribe;
  };
  
  // Randevuyu tamamla
  const handleCompleteSession = async () => {
    if (!selectedAppointment || !currentUser || userProfile?.userType !== 'caregiver') return;
    
    try {
      // Randevuyu tamamlandı olarak işaretle
      await firestoreService.updateAppointmentStatus(selectedAppointment.id, 'completed');
      
      // Hasta stats'ini güncelle
      await firestoreService.updateUserStatsOnCompletion(
        selectedAppointment.patientId, 
        selectedAppointment.currentLevel || 1, 
        selectedAppointment.collectedApples || 0
      );
      
      // Listeyi güncelle
      setAppointments(prev => 
        prev.map(appointment => 
          appointment.id === selectedAppointment.id 
            ? {...appointment, status: 'completed'} 
            : appointment
        )
      );
      
      // Modalı kapat
      setShowStartModal(false);
      setSelectedAppointment(null);
      
    } catch (err) {
      console.error("Randevu tamamlama hatası:", err);
      alert("Randevu tamamlanırken bir hata oluştu.");
    }
  };
  
  // Randevu filtreleme
  const filteredAppointments = appointments.filter(appointment => {
    const appointmentDate = parseISO(appointment.date);
    
    if (filter === 'all') return true;
    if (filter === 'upcoming') {
      return (isToday(appointmentDate) || isAfter(appointmentDate, new Date())) && 
             (appointment.status === 'pending' || appointment.status === 'accepted');
    }
    if (filter === 'pending') return appointment.status === 'pending';
    if (filter === 'accepted') return appointment.status === 'accepted';
    if (filter === 'completed') return appointment.status === 'completed';
    if (filter === 'cancelled') return appointment.status === 'cancelled';
    if (filter === 'today') return isToday(appointmentDate);
    if (filter === 'past') return isBefore(appointmentDate, new Date()) && !isToday(appointmentDate);
    
    return true;
  });

  // Tarihe göre sıralama
  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    // Tarihleri karşılaştır
    const dateComparison = new Date(a.date).getTime() - new Date(b.date).getTime();
    if (dateComparison !== 0) return dateComparison;
    
    // Tarihler aynıysa saatleri karşılaştır
    return a.time.localeCompare(b.time);
  });

  // Randevu durumuna göre renk
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return styles.pending;
      case 'accepted': return styles.accepted;
      case 'completed': return styles.completed;
      case 'cancelled': return styles.cancelled;
      default: return '';
    }
  };

  // Durum etiketi
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Bekliyor';
      case 'accepted': return 'Onaylandı';
      case 'completed': return 'Tamamlandı';
      case 'cancelled': return 'İptal Edildi';
      default: return status;
    }
  };

  // Durum ikonu
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return faHourglass;
      case 'accepted': return faCalendarCheck;
      case 'completed': return faClipboardCheck;
      case 'cancelled': return faCalendarTimes;
      default: return faCalendar;
    }
  };

  // Randevuya ara verme fonksiyonu
  const handlePauseSession = () => {
    // Sadece modalı kapat, randevu durumunu değiştirme
    setShowStartModal(false);
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
        </div>

        {error && (
          <div className={styles.errorMessage}>
            <FontAwesomeIcon icon={faExclamationTriangle} className={styles.errorIcon} />
            <p>{error}</p>
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
          <div className={styles.loading}>Randevular yükleniyor...</div>
        ) : sortedAppointments.length === 0 ? (
          <div className={styles.emptyState}>
            <p>Gösterilecek randevu bulunamadı.</p>
            <button 
              className={styles.resetFilterButton} 
              onClick={() => setFilter('all')}
            >
              Tüm Randevuları Göster
            </button>
          </div>
        ) : (
          <div className={styles.randevuList}>
            {sortedAppointments.map((appointment) => (
              <div key={appointment.id} className={styles.appointmentCard}>
                <div className={styles.appointmentInfo}>
                    <div className={styles.appointmentDate}>
                    {format(parseISO(appointment.date), 'dd MMMM yyyy', { locale: tr })}
                    <span className={styles.appointmentTime}>{appointment.date.split("T")[1].split(":").slice(0, 2).join(":")}</span>
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
                          className={styles.completeButton}
                          onClick={() => handleStartAppointment(appointment)}
                        >
                          Seansa Devam Et
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
              <label>Bakıcı</label>
              <select 
                value={newAppointment.caregiverId}
                onChange={(e) => setNewAppointment({
                  ...newAppointment, 
                  caregiverId: e.target.value,
                  caregiverName: caregivers.find(c => c.id === e.target.value)?.name || ''
                })}
                required
              >
                <option value="">-- Bakıcı Seçin --</option>
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
                <label className={styles.controlLabel}>Seviye Ayarla (1-10)</label>
                <select 
                  value={selectedLevel}
                  onChange={(e) => handleLevelChange(parseInt(e.target.value))}
                  required
                  className={styles.levelSelect}
                >
                  {Array.from({ length: 10 }, (_, i) => i + 1).map(level => (
                    <option key={level} value={level}>
                      Seviye {level}
                    </option>
                  ))}
                </select>
                <div className={styles.levelIndicator}>
                  {Array.from({ length: 10 }, (_, i) => (
                    <div 
                      key={i} 
                      className={`${styles.levelDot} ${i < selectedLevel ? styles.activeDot : ''}`}
                    ></div>
                  ))}
                </div>
              </div>
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
    </DashboardLayout>
  );
}
