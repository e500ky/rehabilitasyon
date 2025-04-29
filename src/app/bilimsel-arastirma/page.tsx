'use client';

import Footer from '@/components/LandingFooter';
import Header from '@/components/LandingHeader';
import {
    faArrowRight,
    faChartLine,
    faDownload,
    faFlask,
    faLightbulb,
    faMicroscope
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image from 'next/image';
import Link from 'next/link';
import styles from './page.module.css';

const ScientificResearchPage = () => {
  return (
    <>
      <Header />
      <div className={styles.container}>
        <div className={styles.heroSection}>
          <div className={styles.heroContent}>
            <h1 className={styles.title}>Bilimsel Araştırmalarımız</h1>
            <p className={styles.subtitle}>
              Rehabilitasyon platformumuz, en son bilimsel araştırmalarla desteklenen kanıta dayalı tedavi yöntemleri sunar.
            </p>
          </div>
          <div className={styles.heroImage}>
            <Image 
              src="/images/research.jpg" 
              alt="Bilimsel Araştırma" 
              width={500} 
              height={300} 
              className={styles.image}
            />
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <FontAwesomeIcon icon={faFlask} className={styles.icon} />
            Araştırmalarımız ve Bulgularımız
          </h2>
          <p className={styles.sectionText}>
            İnme sonrası rehabilitasyon sürecinde sanal gerçeklik ve hareket yakalama teknolojilerinin etkilerini araştıran çalışmalarımız, geleneksel tedavi yöntemlerine göre anlamlı iyileşme oranları göstermektedir. Platformumuz, bu bilimsel veriler ışığında sürekli olarak geliştirilmekte ve optimize edilmektedir.
          </p>
          
          <div className={styles.researchGrid}>
            <div className={styles.researchCard}>
              <h3 className={styles.cardTitle}>Sanal Gerçeklik Rehabilitasyonu Etkileri</h3>
              <p className={styles.cardText}>
                70 hasta ile gerçekleştirilen randomize kontrollü çalışmamızda, haftada 3 seans 8 haftalık VR tabanlı rehabilitasyon programının üst ekstremite fonksiyonlarında %42 oranında iyileşme sağladığı görülmüştür.
              </p>
              <a href="#" className={styles.downloadLink}>
                <FontAwesomeIcon icon={faDownload} className={styles.downloadIcon} />
                Araştırma Makalesini İndir
              </a>
            </div>
            
            <div className={styles.researchCard}>
              <h3 className={styles.cardTitle}>Hareket Yakalama Teknolojisi Analizi</h3>
              <p className={styles.cardText}>
                Hareket yakalama sensörlerinin milisaniye düzeyindeki hassasiyetle hasta hareketlerini analiz etmesinin, rehabilitasyon protokollerinin kişiselleştirme oranını %67 arttırdığını belgeledik.
              </p>
              <a href="#" className={styles.downloadLink}>
                <FontAwesomeIcon icon={faDownload} className={styles.downloadIcon} />
                Araştırma Makalesini İndir
              </a>
            </div>
          </div>
        </div>
        
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <FontAwesomeIcon icon={faMicroscope} className={styles.icon} />
            Vaka Çalışmalarımız
          </h2>
          
          <div className={styles.caseStudyContainer}>
            <div className={styles.caseStudy}>
              <h3>Vaka Çalışması #1: İskemik İnme Sonrası İyileşme</h3>
              <p>
                56 yaşındaki erkek hasta, sol taraf hemiparezi ile platformumuzu kullanarak 12 haftalık rehabilitasyon programı sonrasında Fugl-Meyer Değerlendirmesinde 22 puandan 48 puana ulaşmıştır.
              </p>
            </div>
            
            <div className={styles.caseStudy}>
              <h3>Vaka Çalışması #2: Kronik İnme Rehabilitasyonu</h3>
              <p>
                İnme sonrası 2 yıl geçmiş olmasına rağmen, 63 yaşındaki kadın hasta, 16 haftalık interaktif program sonrasında günlük yaşam aktivitelerinde %35 oranında bağımsızlık artışı göstermiştir.
              </p>
            </div>
          </div>
        </div>

        <div className={styles.statsSection}>
          <h2 className={styles.sectionTitle}>
            <FontAwesomeIcon icon={faChartLine} className={styles.icon} />
            Araştırma İstatistiklerimiz
          </h2>
          
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statValue}>42%</div>
              <div className={styles.statLabel}>Motor Fonksiyonlarda İyileşme</div>
            </div>
            
            <div className={styles.statCard}>
              <div className={styles.statValue}>67%</div>
              <div className={styles.statLabel}>Kişiselleştirme Artışı</div>
            </div>
            
            <div className={styles.statCard}>
              <div className={styles.statValue}>89%</div>
              <div className={styles.statLabel}>Hasta Memnuniyeti</div>
            </div>
            
            <div className={styles.statCard}>
              <div className={styles.statValue}>3.5x</div>
              <div className={styles.statLabel}>Motivasyon Artışı</div>
            </div>
          </div>
        </div>
        
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <FontAwesomeIcon icon={faLightbulb} className={styles.icon} />
            Araştırma İş Birliklerimiz
          </h2>
          <p className={styles.sectionText}>
            Platformumuz, Türkiye'nin önde gelen üniversiteleri ve araştırma hastaneleri ile iş birliği yaparak sürekli olarak geliştirilmektedir. Bu iş birlikleri sayesinde, son teknoloji ve kanıta dayalı en etkili rehabilitasyon yöntemlerini hastalarımıza sunabiliyoruz.
          </p>
          
          <div className={styles.partnerLogos}>
            {/* Partner logoları burada yer alacak */}
            <div className={styles.partnerLogo}>Üniversite Logo</div>
            <div className={styles.partnerLogo}>Hastane Logo</div>
            <div className={styles.partnerLogo}>Araştırma Merkezi Logo</div>
          </div>
        </div>
        
        <div className={styles.ctaSection}>
          <h2>Bilimsel Temelli Rehabilitasyon Yolculuğunuza Başlayın</h2>
          <p>Kanıta dayalı rehabilitasyon programlarımız ve kişiselleştirilmiş tedavi planlarımızla iyileşme sürecinizi hızlandırın.</p>
          <Link href="/kayit-ol" className={styles.ctaButton}>
            Hemen Kaydolun
            <FontAwesomeIcon icon={faArrowRight} className={styles.buttonIcon} />
          </Link>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ScientificResearchPage;
