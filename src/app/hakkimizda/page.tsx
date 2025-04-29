'use client';

import Header from '@/components/Header';
import { faChartLine, faHandshake, faLightbulb, faUsers, faVrCardboard } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image from 'next/image';
import Footer from '../../components/Footer';
import styles from './hakkimizda.module.css';

export default function Hakkimizda() {
  return (
    <>
      <Header />
      <div className={styles.container}>
        <div className={styles.heroSection}>
          <h1 className={styles.title}>Hakkımızda</h1>
          <p className={styles.subtitle}>
            VR Rehabilitasyon yolculuğumuz ve değerlerimiz
          </p>
        </div>

        <div className={styles.contentSection}>
          <div className={styles.mainContent}>
            <section className={styles.aboutSection}>
              <div className={styles.textContent}>
                <h2 className={styles.sectionTitle}>Hikayemiz</h2>
                <div className={styles.hikaye}>
                  <p>
                    • RWA (Rehabilitation With Apples), 2025 yılında bir grup yazılım geliştiricinin bir araya gelerek felçli hastaların rehabilitasyon süreçlerini daha etkili ve eğlenceli hale getirmek için kurduğu bir teknoloji girişimidir.
                  </p>
                  <p>
                    • Geleneksel rehabilitasyon yöntemlerinin monotonluğunun hastaların motivasyonunu düşürdüğünü ve iyileşme süreçlerini yavaşlattığını fark ettik. Ekip liderimiz Muhammet Alp Erdem öncülüğünde, bu soruna çözüm aramak için RWA' yı (Rehabilitation With Apples) kurduk.
                  </p>
                </div>
              </div>
              <div className={styles.imageContainer}>
                <Image 
                  src="/logo.png" 
                  alt="Ekibimiz" 
                  width={500} 
                  height={300} 
                  className={styles.aboutImage}
                />
              </div>
            </section>

            <section className={styles.missionSection}>
              <h2 className={styles.sectionTitle}>Misyonumuz ve Vizyonumuz</h2>
              <div className={styles.missionVisionContainer}>
                <div className={styles.missionBox}>
                  <h3>Misyonumuz</h3>
                  <p>
                    Felç sonrası rehabilitasyona ihtiyaç duyan bireylerin iyileşme sürecini, güncel teknoloji ve kanıta dayalı yöntemlerle hızlandırmak, hastaların bağımsızlıklarını yeniden kazanmalarına yardımcı olmak.
                  </p>
                </div>
                <div className={styles.visionBox}>
                  <h3>Vizyonumuz</h3>
                  <p>
                    Rehabilitasyon alanında sanal gerçeklik teknolojisinin öncüsü olarak, global çapta etkili, erişilebilir ve kişiselleştirilmiş çözümler sunarak iyileşme süreçlerini dönüştürmek.
                  </p>
                </div>
              </div>
            </section>

            <section className={styles.valuesSection}>
              <h2 className={styles.sectionTitle}>Değerlerimiz</h2>
              <div className={styles.valuesGrid}>
                <div className={styles.valueCard}>
                  <div className={styles.valueIcon}>
                    <FontAwesomeIcon icon={faUsers} />
                  </div>
                  <h3>İnsan Odaklılık</h3>
                  <p>Her hastanın benzersiz ihtiyaçlarını ve hedeflerini önceliklendiriyoruz.</p>
                </div>
                <div className={styles.valueCard}>
                  <div className={styles.valueIcon}>
                    <FontAwesomeIcon icon={faLightbulb} />
                  </div>
                  <h3>İnovasyon</h3>
                  <p>Sürekli yeni teknolojileri keşfederek rehabilitasyon süreçlerini iyileştiriyoruz.</p>
                </div>
                <div className={styles.valueCard}>
                  <div className={styles.valueIcon}>
                    <FontAwesomeIcon icon={faHandshake} />
                  </div>
                  <h3>İşbirliği</h3>
                  <p>Hastalar, terapistler ve ailelerle iş birliği yaparak en iyi sonuçları hedefliyoruz.</p>
                </div>
                <div className={styles.valueCard}>
                  <div className={styles.valueIcon}>
                    <FontAwesomeIcon icon={faChartLine} />
                  </div>
                  <h3>Kanıta Dayalı Yaklaşım</h3>
                  <p>Tüm ürün ve hizmetlerimizi bilimsel araştırmalara ve klinik verilere dayandırıyoruz.</p>
                </div>
              </div>
            </section>
            
            <section className={styles.teamSection}>
              <h2 className={styles.sectionTitle}>Ekibimiz</h2>
              <div className={styles.teamGrid}>
                <div className={styles.teamMember}>
                  <h3>Muhammet Alp Erdem</h3>
                  <p>Oyun Geliştirme</p>
                  <b><p>(Ekip Lideri)</p></b>
                </div>
                <div className={styles.teamMember}>
                  <h3>Arda Ceylan</h3>
                  <p>Oyun Geliştirme</p>
                </div>
                <div className={styles.teamMember}>
                  <h3>Arda Balcı</h3>
                  <p>Web & DB Sistemleri Geliştirme</p>
                </div>
                <div className={styles.teamMember}>
                  <h3>Fırat Tuna Arslan</h3>
                  <p>Web & DB Sistemleri Geliştirme</p>
                </div>
              </div>
            </section>
          </div>
        </div>
        
        <div className={styles.ctaSection}>
          <div className={styles.ctaContent}>
            <FontAwesomeIcon icon={faVrCardboard} className={styles.ctaIcon} />
            <h2>Sizin için neler yapabiliriz?</h2>
            <p>VR rehabilitasyon çözümlerimiz hakkında daha fazla bilgi edinmek veya bir demo talep etmek için bizimle iletişime geçin.</p>
            <a href="/iletisim" className={styles.ctaButton}>İletişime Geçin</a>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}
