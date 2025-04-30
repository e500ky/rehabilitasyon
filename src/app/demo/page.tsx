'use client';

import Header from '@/components/Header';
import {
    faCalendarAlt,
    faCheckCircle,
    faEnvelope,
    faPaperPlane,
    faPlay,
    faSpinner,
    faVrCardboard
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import styles from './demo.module.css';

export default function Demo() {
  const [activeTab, setActiveTab] = useState('vr-demo');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    interestedIn: 'demo'
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(0);

  const demoVideos = [
    {
      id: 1,
      title: 'Elma Toplama Oyunu',
      description: 'VR ortamında çeşitli renkli elmaları toplayarak hem eğlenin hem de motor becerilerinizi geliştirin.',
      thumbnail: '/images/demo-thumbnail-1.jpg',
      video: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    },
    {
      id: 2,
      title: 'İlerleme Takip Sistemi',
      description: 'Gelişiminizi gerçek zamanlı olarak izleyin ve nasıl ilerlediğinizi görün.',
      thumbnail: '/images/demo-thumbnail-2.jpg',
      video: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    },
    {
      id: 3,
      title: 'Terapist Etkileşimleri',
      description: 'Uzman terapistlerimizin VR rehabilitasyon sürecinde nasıl yardımcı olduğunu görün.',
      thumbnail: '/images/demo-thumbnail-3.jpg',
      video: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: '',
        interestedIn: 'demo'
      });
    } catch (error) {
      console.error('Form error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className={styles.container}>
        <div className={styles.heroSection}>
          <div className={styles.heroContent}>
            <h1 className={styles.title}>VR Rehabilitasyon Demo</h1>
            <p className={styles.subtitle}>
              Rehabilitasyon deneyimimizi izleyin veya kişisel bir demo talep edin
            </p>
          </div>
        </div>

        <div className={styles.contentSection}>
          {/* Tab Navigation */}
          <div className={styles.tabNavigation}>
            <button 
              className={`${styles.tabButton} ${activeTab === 'vr-demo' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('vr-demo')}
            >
              <FontAwesomeIcon icon={faVrCardboard} className={styles.tabIcon} />
              Video Demo
            </button>
            <button 
              className={`${styles.tabButton} ${activeTab === 'request-demo' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('request-demo')}
            >
              <FontAwesomeIcon icon={faCalendarAlt} className={styles.tabIcon} />
              Demo Talep Et
            </button>
          </div>

          {/* Tab Content */}
          <div className={styles.tabContent}>
            {/* VR Demo Tab */}
            {activeTab === 'vr-demo' && (
              <div className={styles.demoTabContent}>
                <div className={styles.videoPlayer}>
                  <div className={styles.videoWrapper}>
                    <iframe 
                      src={demoVideos[currentVideo].video} 
                      title={demoVideos[currentVideo].title}
                      frameBorder="0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen
                    ></iframe>
                  </div>
                  <h2 className={styles.videoTitle}>{demoVideos[currentVideo].title}</h2>
                  <p className={styles.videoDescription}>{demoVideos[currentVideo].description}</p>
                </div>

                <div className={styles.videoGallery}>
                  <h3 className={styles.galleryTitle}>Diğer Demolar</h3>
                  <div className={styles.thumbnailsContainer}>
                    {demoVideos.map((video, index) => (
                      <div 
                        key={video.id} 
                        className={`${styles.thumbnail} ${currentVideo === index ? styles.activeThumbnail : ''}`}
                        onClick={() => setCurrentVideo(index)}
                      >
                        <div className={styles.thumbnailImage}>
                          <Image 
                            src={video.thumbnail} 
                            alt={video.title} 
                            width={160}
                            height={90}
                          />
                          <div className={styles.playOverlay}>
                            <FontAwesomeIcon icon={faPlay} className={styles.playIcon} />
                          </div>
                        </div>
                        <h4 className={styles.thumbnailTitle}>{video.title}</h4>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Request Demo Tab */}
            {activeTab === 'request-demo' && (
              <div className={styles.requestDemoContent}>
                {submitted ? (
                  <div className={styles.successMessage}>
                    <FontAwesomeIcon icon={faCheckCircle} className={styles.successIcon} />
                    <h2>Demo Talebiniz Alındı!</h2>
                    <p>Talebiniz başarıyla kaydedilmiştir. Ekibimiz en kısa sürede sizinle iletişime geçecektir.</p>
                    <button 
                      className={styles.resetButton} 
                      onClick={() => setSubmitted(false)}
                    >
                      Yeni Demo Talebi
                    </button>
                  </div>
                ) : (
                  <>
                    <div className={styles.requestInfo}>
                      <h2 className={styles.requestTitle}>Kişisel Demo İsteyin</h2>
                      <p className={styles.requestDescription}>
                        VR rehabilitasyon sistemimiz hakkında daha fazla bilgi almak ve kişisel bir demo ayarlamak için aşağıdaki formu doldurun. Uzmanlarımız 24 saat içinde sizinle iletişime geçecektir.
                      </p>
                      <div className={styles.requestBenefits}>
                        <div className={styles.benefitItem}>
                          <div className={styles.benefitIcon}>1</div>
                          <div>
                            <h3>Kişisel Demo</h3>
                            <p>Size özel düzenlenmiş bir demo ile sistemin tüm özelliklerini tanıyın.</p>
                          </div>
                        </div>
                        <div className={styles.benefitItem}>
                          <div className={styles.benefitIcon}>2</div>
                          <div>
                            <h3>Uzman Rehberliği</h3>
                            <p>Sistemimizi bir uzman eşliğinde deneyimleyin ve sorularınızı sorun.</p>
                          </div>
                        </div>
                        <div className={styles.benefitItem}>
                          <div className={styles.benefitIcon}>3</div>
                          <div>
                            <h3>Kişiselleştirilmiş Rapor</h3>
                            <p>Demo sonrası ihtiyaçlarınıza özel hazırlanmış bir değerlendirme raporu alın.</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className={styles.requestForm}>
                      <h3>Demo Talep Formu</h3>
                      <form onSubmit={handleSubmit}>
                        <div className={styles.formGroup}>
                          <label htmlFor="name">Ad Soyad *</label>
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
                          <label htmlFor="email">E-posta Adresi *</label>
                          <input 
                            type="email" 
                            id="email" 
                            name="email" 
                            value={formData.email}
                            onChange={handleChange}
                            className={styles.emailInput}
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label htmlFor="phone">Telefon</label>
                          <input 
                            type="tel" 
                            id="phone" 
                            name="phone" 
                            value={formData.phone}
                            onChange={handleChange}
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label htmlFor="interestedIn">İlgilendiğiniz Demo Türü *</label>
                          <select 
                            id="interestedIn" 
                            name="interestedIn"
                            value={formData.interestedIn}
                            onChange={handleChange}
                            required
                          >
                            <option value="demo">VR Rehabilitasyon Demosu</option>
                            <option value="product-info">Ürün Bilgisi</option>
                            <option value="pricing">Fiyatlandırma</option>
                            <option value="consultation">Rehabilitasyon Danışmanlığı</option>
                          </select>
                        </div>
                        <div className={styles.formGroup}>
                          <label htmlFor="message">Mesajınız</label>
                          <textarea 
                            id="message" 
                            name="message" 
                            rows={4}
                            value={formData.message}
                            onChange={handleChange}
                            placeholder="Demo ile ilgili özel istekleriniz veya sorularınız varsa belirtebilirsiniz."
                          ></textarea>
                        </div>
                        <button 
                          type="submit" 
                          className={styles.submitButton}
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <FontAwesomeIcon icon={faSpinner} spin className={styles.spinIcon} />
                              Gönderiliyor...
                            </>
                          ) : (
                            <>
                              <FontAwesomeIcon icon={faPaperPlane} className={styles.sendIcon} />
                              Demo Talep Et
                            </>
                          )}
                        </button>
                      </form>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Call to action section */}
        <div className={styles.ctaSection}>
          <div className={styles.ctaContent}>
            <h2>VR Rehabilitasyon Hakkında Daha Fazla Bilgi Alın</h2>
            <p>Sistemimiz, hasta sonuçları ve güncel araştırmalarımız hakkında detaylı bilgileri inceleyebilirsiniz.</p>
            <div className={styles.ctaButtons}>
              <Link href="/bilimsel-arastirma" className={styles.primaryButton}>
                Bilimsel Araştırmalarımız
              </Link>
              <Link href="/iletisim" className={styles.secondaryButton}>
                <FontAwesomeIcon icon={faEnvelope} className={styles.buttonIcon} />
                Bize Ulaşın
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
