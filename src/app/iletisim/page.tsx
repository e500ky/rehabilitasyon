'use client';

import Header from '@/components/Header';
import {
  faBuilding,
  faCheckCircle,
  faClock,
  faEnvelope,
  faMapMarkerAlt,
  faPaperPlane,
  faPhone,
  faSpinner,
  faUser
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';
import Footer from '../../components/Footer';
import styles from './iletisim.module.css';

export default function Iletisim() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    organization: '',
    subject: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      
      setIsSubmitted(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        organization: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      console.error('Form gönderme hatası:', error);
      setError('Form gönderilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <div className={styles.container}>
        <div className={styles.heroSection}>
          <h1 className={styles.title}>İletişim</h1>
          <p className={styles.subtitle}>
            Sorularınız için bizimle iletişime geçin veya VR rehabilitasyon sistemimiz hakkında demo talep edin.
          </p>
        </div>

        <div className={styles.contentSection}>
          <div className={styles.contactInfoSidebar}>
            <div className={styles.contactCard}>
              <h2>İletişim Bilgileri</h2>
              
              <div className={styles.contactItem}>
                <FontAwesomeIcon icon={faMapMarkerAlt} className={styles.contactIcon} />
                <div>
                  <h3>Adres</h3>
                  <p>Teknoloji Vadisi, İnovasyon Caddesi<br />No: 42, 34000<br />İstanbul, Türkiye</p>
                </div>
              </div>
              
              <div className={styles.contactItem}>
                <FontAwesomeIcon icon={faPhone} className={styles.contactIcon} />
                <div>
                  <h3>Telefon</h3>
                  <p>+90 (212) 456 78 90</p>
                  <p>+90 (532) 123 45 67</p>
                </div>
              </div>
              
              <div className={styles.contactItem}>
                <FontAwesomeIcon icon={faEnvelope} className={styles.contactIcon} />
                <div>
                  <h3>E-posta</h3>
                  <p>info@vrrehabilitasyon.com</p>
                  <p>destek@vrrehabilitasyon.com</p>
                </div>
              </div>
              
              <div className={styles.contactItem}>
                <FontAwesomeIcon icon={faClock} className={styles.contactIcon} />
                <div>
                  <h3>Çalışma Saatleri</h3>
                  <p>Pazartesi - Cuma: 09:00 - 18:00</p>
                  <p>Cumartesi: 10:00 - 15:00</p>
                  <p>Pazar: Kapalı</p>
                </div>
              </div>
            </div>
            
            <div className={styles.mapContainer}>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3008.2185555978053!2d28.978404115351786!3d41.04811397929616!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cab7650656bd63%3A0x8ca058b28c20b6c3!2zVGFrc2ltIE1leWRhbsSxLCBHw7xtw7zFn3N1eXUsIDM0NDM1IEJleW_En2x1L8Swc3RhbmJ1bA!5e0!3m2!1str!2str!4v1653932241283!5m2!1str!2str"
                width="100%"
                height="250"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Konum"
              ></iframe>
            </div>
          </div>

          <div className={styles.contactForm}>
            <div className={styles.formHeader}>
              <h2>Bize Ulaşın</h2>
              <p>Sorularınız için aşağıdaki formu doldurun, size en kısa sürede dönüş yapacağız.</p>
            </div>
            
            {isSubmitted ? (
              <div className={styles.successMessage}>
                <FontAwesomeIcon icon={faCheckCircle} className={styles.successIcon} />
                <h3>Mesajınız Alındı!</h3>
                <p>Formunuz başarıyla gönderilmiştir. Ekibimiz en kısa sürede sizinle iletişime geçecektir.</p>
                <button 
                  className={styles.newMessageButton}
                  onClick={() => setIsSubmitted(false)}
                >
                  Yeni Mesaj Gönder
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className={styles.form}>
                {error && <div className={styles.errorMessage}>{error}</div>}
                
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="name">
                      <FontAwesomeIcon icon={faUser} className={styles.inputIcon} />
                      Ad Soyad*
                    </label>
                    <input 
                      type="text" 
                      id="name" 
                      name="name" 
                      value={formData.name}
                      onChange={handleChange}
                      required 
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="email">
                      <FontAwesomeIcon icon={faEnvelope} className={styles.inputIcon} />
                      E-posta Adresi*
                    </label>
                    <input 
                      type="email" 
                      id="email" 
                      name="email" 
                      value={formData.email}
                      onChange={handleChange}
                      required 
                    />
                  </div>
                </div>
                
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="phone">
                      <FontAwesomeIcon icon={faPhone} className={styles.inputIcon} />
                      Telefon
                    </label>
                    <input 
                      type="tel" 
                      id="phone" 
                      name="phone" 
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="organization">
                      <FontAwesomeIcon icon={faBuilding} className={styles.inputIcon} />
                      Kurum/Şirket
                    </label>
                    <input 
                      type="text" 
                      id="organization" 
                      name="organization" 
                      value={formData.organization}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="subject">Konu*</label>
                  <select 
                    id="subject" 
                    name="subject" 
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seçiniz</option>
                    <option value="demo">Demo Talebi</option>
                    <option value="info">Bilgi Talebi</option>
                    <option value="support">Teknik Destek</option>
                    <option value="partnership">İş Birliği</option>
                    <option value="other">Diğer</option>
                  </select>
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="message">Mesajınız*</label>
                  <textarea 
                    id="message" 
                    name="message" 
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>
                
                <div className={styles.formFooter}>
                  <p className={styles.requiredNote}>* Zorunlu alanlar</p>
                  <button 
                    type="submit" 
                    className={styles.submitButton} 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} spin className={styles.spinnerIcon} />
                        Gönderiliyor...
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faPaperPlane} className={styles.submitIcon} />
                        Gönder
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}
