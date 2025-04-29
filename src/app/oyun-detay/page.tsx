'use client';

import Header from '@/components/Header';
import {
    faAppleAlt,
    faArrowRight,
    faBrain,
    faChartLine,
    faChartPie,
    faGamepad,
    faHandPointer,
    faLightbulb,
    faVrCardboard
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image from 'next/image';
import Link from 'next/link';
import styles from './oyun-detay.module.css';

export default function OyunDetay() {
  return (
    <>
      <Header />
      <div className={styles.container}>
        <div className={styles.heroSection}>
          <div className={styles.heroContent}>
            <h1 className={styles.title}>VR Elma Toplama Oyunu</h1>
            <p className={styles.subtitle}>
              Rehabilitasyonu eğlenceli ve etkili hale getiren sanal gerçeklik deneyimi
            </p>
          </div>
          <div className={styles.heroImageContainer}>
            <Image 
              src="/images/vr-apple-game.jpg" 
              alt="VR Elma Toplama Oyunu" 
              width={600} 
              height={400}
              className={styles.heroImage}
            />
          </div>
        </div>

        <div className={styles.contentSection}>
          <div className={styles.overviewSection}>
            <div className={styles.sectionIcon}>
              <FontAwesomeIcon icon={faAppleAlt} />
            </div>
            <h2 className={styles.sectionTitle}>Oyun Hakkında</h2>
            <div className={styles.overviewContent}>
              <div className={styles.textContent}>
                <p>
                  VR Elma Toplama oyunumuz, felçli hastaların motor becerilerini geliştirmek için özel olarak tasarlanmış, eğlenceli ve motive edici bir rehabilitasyon aracıdır. Sanal gerçeklik ortamında, hastalar renkli elmaları havadan yakalayıp doğru renkteki sepetlere yerleştirerek hem eğlenir hem de fiziksel fonksiyonlarını iyileştirirler.
                </p>
                <p>
                  Oyun, normal rehabilitasyon egzersizlerinin tekrar eden ve sıkıcı doğasını değiştirerek hastaların daha uzun süre ve daha istekli bir şekilde egzersiz yapmalarını sağlıyor. Üstelik tüm hareketler ve başarılar kaydedilerek ilerleme sürecini ölçülebilir hale getiriyor.
                </p>
              </div>
              <div className={styles.videoContainer}>
                <div className={styles.videoWrapper}>
                  <iframe 
                    width="560" 
                    height="315" 
                    src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
                    title="VR Elma Toplama Oyunu Tanıtım" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.featuresSection}>
            <h2 className={styles.sectionTitle}>Özellikler</h2>
            <div className={styles.featuresGrid}>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>
                  <FontAwesomeIcon icon={faVrCardboard} />
                </div>
                <h3>Sürükleyici VR Deneyimi</h3>
                <p>360° sanal gerçeklik ortamı ile gerçek dünya problemlerinden uzaklaşarak tamamen terapiye odaklanın.</p>
              </div>
              
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>
                  <FontAwesomeIcon icon={faHandPointer} />
                </div>
                <h3>Hareket Sensörleri</h3>
                <p>Hassas hareket sensörleri ile her el ve kol hareketiniz gerçek zamanlı olarak takip edilir ve oyuna yansıtılır.</p>
              </div>
              
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>
                  <FontAwesomeIcon icon={faGamepad} />
                </div>
                <h3>Zorluk Seviyeleri</h3>
                <p>Başlangıç seviyesinden ileri seviyeye kadar kişiselleştirilebilir zorluk dereceleri sunar.</p>
              </div>
              
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>
                  <FontAwesomeIcon icon={faChartPie} />
                </div>
                <h3>Performans Analizi</h3>
                <p>Her oturum sonrası detaylı performans analizleri ve iyileşme grafikleri ile ilerlemenizi takip edin.</p>
              </div>
              
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>
                  <FontAwesomeIcon icon={faBrain} />
                </div>
                <h3>Bilişsel Gelişim</h3>
                <p>Sadece fiziksel değil, bilişsel becerileri de geliştiren renk eşleştirme ve stratejik düşünme özellikleri.</p>
              </div>
              
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>
                  <FontAwesomeIcon icon={faLightbulb} />
                </div>
                <h3>Adaptif Öğrenme</h3>
                <p>Yapay zeka ile desteklenen sistem, kullanıcının performansına göre zorluk seviyesini otomatik ayarlar.</p>
              </div>
            </div>
          </div>
          
          <div className={styles.gameMechanicsSection}>
            <h2 className={styles.sectionTitle}>Oyun Mekanikleri</h2>
            <div className={styles.mechanicsContent}>
              <div className={styles.mechanicsImage}>
                <Image 
                  src="/images/game-mechanics.jpg" 
                  alt="Oyun Mekanikleri" 
                  width={400} 
                  height={400}
                  className={styles.roundedImage}
                />
              </div>
              <div className={styles.mechanicsList}>
                <div className={styles.mechanicItem}>
                  <h3>1. Elma Toplama</h3>
                  <p>Havada süzülen farklı renklerdeki elmaları elinizle yakalamalısınız. Her elma için yakalama hareket aralığı farklıdır, böylece farklı erişim aralıkları çalıştırılır.</p>
                </div>
                
                <div className={styles.mechanicItem}>
                  <h3>2. Renk Eşleştirme</h3>
                  <p>Her elmayı doğru renkli sepete yerleştirmelisiniz. Bu, hafıza ve bilişsel becerileri de geliştiren bir unsurdur.</p>
                </div>
                
                <div className={styles.mechanicItem}>
                  <h3>3. Zaman Yönetimi</h3>
                  <p>Belirli bir süre içinde mümkün olduğunca çok elma toplamalısınız. Bu, motor becerilerinizin hızını ve doğruluğunu geliştirir.</p>
                </div>
                
                <div className={styles.mechanicItem}>
                  <h3>4. Özel Elmalar</h3>
                  <p>Altın elmalar ekstra puan, parlayan elmalar süre uzatma gibi özel özellikler taşır ve oyuna heyecan katar.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className={styles.therapeuticBenefitsSection}>
            <h2 className={styles.sectionTitle}>Terapötik Faydalar</h2>
            <div className={styles.benefitsList}>
              <div className={styles.benefitItem}>
                <div className={styles.benefitIcon}><FontAwesomeIcon icon={faChartLine} /></div>
                <div>
                  <h3>Motor Becerilerin Gelişimi</h3>
                  <p>Üst ekstremite (kol, el, parmak) hareketlerini geliştirerek günlük yaşam aktivitelerinde bağımsızlık kazandırır.</p>
                </div>
              </div>
              
              <div className={styles.benefitItem}>
                <div className={styles.benefitIcon}><FontAwesomeIcon icon={faHandPointer} /></div>
                <div>
                  <h3>El-Göz Koordinasyonu</h3>
                  <p>Hareket eden nesneleri takip etme ve yakalama oyunlarıyla el-göz koordinasyonu geliştirilir.</p>
                </div>
              </div>
              
              <div className={styles.benefitItem}>
                <div className={styles.benefitIcon}><FontAwesomeIcon icon={faBrain} /></div>
                <div>
                  <h3>Nöroplastisite Desteği</h3>
                  <p>Tekrarlanan hareketler ve geri bildirimler sayesinde beyin-kas bağlantıları güçlenir ve yeni sinir yolları oluşumu teşvik edilir.</p>
                </div>
              </div>
              
              <div className={styles.benefitItem}>
                <div className={styles.benefitIcon}><FontAwesomeIcon icon={faGamepad} /></div>
                <div>
                  <h3>Motivasyon Artışı</h3>
                  <p>Oyunlaştırma unsurları, hastaların tedavi sürecine daha aktif katılımını ve motivasyonunu artırır.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className={styles.ctaSection}>
            <div className={styles.ctaContent}>
              <h2>VR Rehabilitasyon Deneyimini Keşfedin</h2>
              <p>Elma toplama oyunumuzu deneyimlemek ve rehabilitasyon sürecinizi dönüştürmek için hemen iletişime geçin.</p>
              <div className={styles.ctaButtons}>
                <Link href="/demo" className={styles.primaryButton}>
                  Demo İzle
                </Link>
                <Link href="/iletisim" className={styles.secondaryButton}>
                  İletişime Geç <FontAwesomeIcon icon={faArrowRight} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
