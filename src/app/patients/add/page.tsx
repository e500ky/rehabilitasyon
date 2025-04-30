'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import firestoreService from '@/lib/services/firestoreService';
import { UserProfile } from '@/types/user';
import { faArrowLeft, faExclamationTriangle, faPlus, faSearch, faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './add-patient.module.css';

export default function AddPatient() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [filteredPatients, setFilteredPatients] = useState<PatientData[]>([]);
  const [existingPatients, setExistingPatients] = useState<string[]>([]);
  
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
          
          if (profile.userType !== 'caregiver') {
            router.push('/dashboard');
          } else {
            const patients = await firestoreService.getCaregiverPatients(currentUser.uid);
            const patientIds = patients.map(patient => patient.id);
            setExistingPatients(patientIds);
          }
        }
      } catch (err) {
        console.error('Kullanıcı profili yükleme hatası:', err);
      }
    };
    
    loadUserProfile();
  }, [currentUser, router]);
  
  const handleSearch = async () => {
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) return;
    
    setIsLoading(true);
    setError(null);
    setSearchResults([]);
    
    try {
      
      const patients = await firestoreService.searchUsersByEmail(trimmedQuery, 'patient');
      
      if (patients.length === 0) {
        const allUsers = await firestoreService.searchUsersByEmail(trimmedQuery);
        
        if (allUsers.length > 0) {
          setError(`'${trimmedQuery}' e-posta adresine sahip bir kullanıcı bulundu, ancak bu kullanıcı 'hasta' rolünde değil. Sadece 'hasta' rolündeki kullanıcıları ekleyebilirsiniz.`);
        } else {
          setError(`'${trimmedQuery}' e-posta adresine sahip bir kullanıcı bulunamadı. Lütfen e-posta adresini kontrol edin.`);
        }
      } else {
        const filteredResults = patients.filter(patient => !existingPatients.includes(patient.uid));
        
        if (filteredResults.length === 0) {
          setError(`'${trimmedQuery}' e-posta adresine sahip hasta zaten listenizde bulunuyor.`);
        } else {
          setSearchResults(filteredResults);
        }
      }
    } catch (err: any) {
      console.error('Arama sırasında hata oluştu:', err);
      
      if (err.message.includes('güvenlik kurallarını kontrol edin')) {
         setError('İzin hatası: Kullanıcı arama izniniz yok gibi görünüyor. Firebase güvenlik kurallarını kontrol edin.');
      } else {
        setError(`Arama sırasında beklenmeyen bir hata oluştu: ${err.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddPatient = async (patientId: string, patientName: string) => {
    if (!currentUser) {
      console.error("Hasta eklenemedi: Kullanıcı oturumu bulunamadı!");
      setError("Oturumunuz sona ermiş olabilir. Lütfen tekrar giriş yapın.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      
      if (!currentUser.uid || typeof currentUser.uid !== 'string') {
        throw new Error("Geçersiz Kullanıcı ID'si: " + currentUser.uid);
      }
      
      if (!patientId || typeof patientId !== 'string') {
        throw new Error("Geçersiz hasta ID'si: " + patientId);
      }
      
      const relationId = await firestoreService.createCaregiverPatientRelation(currentUser.uid, patientId);
      
      setSuccessMessage(`${patientName} başarıyla hasta listenize eklendi!`);
      
      setSearchResults([]);
      setSearchQuery('');
      
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
      
    } catch (err: any) {
      console.error("Hasta ekleme hatası:", err);
      
      let errorMessage = "Hasta eklenirken bir hata oluştu.";
      
      if (err.code === 'permission-denied') {
        errorMessage = "İzin hatası: Firebase güvenlik kurallarını kontrol edin.";
      } else if (err.message) {
        errorMessage = `Hata: ${err.message}`;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className={styles.container}>
        <div className={styles.header}>
          <Link href="/dashboard" className={styles.backLink}>
            <FontAwesomeIcon icon={faArrowLeft} />
            <span>Ana Sayfaya Dön</span>
          </Link>
          <h1>Hasta Ekle</h1>
        </div>
        
        {error && (
          <div className={styles.errorMessage}>
            <FontAwesomeIcon icon={faExclamationTriangle} />
            <p>{error}</p>
          </div>
        )}
        
        {successMessage && (
          <div className={styles.successMessage}>
            <p>{successMessage}</p>
          </div>
        )}
        
        <div className={styles.searchContainer}>
          <h2>Hasta Ara</h2>
          <p>Hastanın e-posta adresini kullanarak arama yapın.</p>
          
          <div className={styles.searchBar}>
            <input 
              type="email" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="hasta@email.com"
              disabled={isLoading}
            />
            <button 
              className={styles.searchButton}
              onClick={handleSearch}
              disabled={isLoading || !searchQuery.trim()}
            >
              {isLoading ? 'Aranıyor...' : (
                <>
                  <FontAwesomeIcon icon={faSearch} />
                  <span>Ara</span>
                </>
              )}
            </button>
          </div>
        </div>
        
        {searchResults.length > 0 && (
          <div className={styles.resultsContainer}>
            <h2>Arama Sonuçları</h2>
            
            <div className={styles.resultsList}>
              {searchResults.map(patient => (
                <div key={patient.uid} className={styles.patientCard}>
                  <div className={styles.patientAvatar}>
                    {patient.photoURL ? (
                      <img src={patient.photoURL} alt={patient.displayName} />
                    ) : (
                      <FontAwesomeIcon icon={faUser} />
                    )}
                  </div>
                  
                  <div className={styles.patientInfo}>
                    <h3>{patient.displayName || 'İsimsiz Hasta'}</h3>
                    <p>{patient.email}</p>
                  </div>
                  
                  <button 
                    className={styles.addButton}
                    onClick={() => handleAddPatient(patient.uid, patient.displayName || 'İsimsiz Hasta')}
                    disabled={isLoading}
                  >
                    <FontAwesomeIcon icon={faPlus} />
                    <span>Ekle</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className={styles.infoBox}>
          <h3>Bilgi</h3>
          <p>
            Yalnızca sisteme kayıtlı olan ve hasta rolüne sahip kullanıcıları ekleyebilirsiniz. 
            Hasta rolündeki kullanıcıların e-posta adresini bilmelisiniz.
          </p>
          <p>
            Eğer hasta sisteme kaydolmamışsa, önce kayıt olmasını isteyebilirsiniz.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
