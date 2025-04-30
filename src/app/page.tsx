'use client';

import Header from "@/components/Header";
import { useAuth } from "@/context/AuthContext";
import {
  faAppleAlt,
  faAward,
  faBrain,
  faChartLine,
  faClipboardCheck,
  faGamepad,
  faHandPointer,
  faVrCardboard
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Footer from "../components/Footer";
import styles from "./page.module.css";

export default function Home() {
  const { currentUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && currentUser) {
      router.push('/dashboard');
    }
  }, [currentUser, loading, router]);

  return (
    <>
      <Header />
      <div className={styles.page}>
        <main className={styles.main}>
          <section className={styles.hero}>
            <h1 className={styles.title}>VR Rehabilitasyon: Yeniden Hayata Bağlanın</h1>
            <p className={styles.description}>
              Felç sonrası rehabilitasyonda devrim: VR gözlük teknolojisi ile eğlenceli, ölçülebilir ve etkili egzersizler sunan yenilikçi sistem.
            </p>
            <div className={styles.ctaButtons}>
              <a href="/demo" className={styles.primaryButton}>
                <FontAwesomeIcon icon={faVrCardboard} className={styles.buttonIcon} />
                Demo İzle
              </a>
            </div>
          </section>
          
          <section className={styles.services} id="vr-rehabilitasyon">
            <h2 className={styles.sectionTitle}>VR Rehabilitasyon Oyunu</h2>
            <p className={styles.sectionDescription}>
              Sanal gerçeklik ortamında, neşeli ve motive edici bir atmosferde motor becerileri geliştiren "Elma Toplama" oyunuyla rehabilitasyon süreciniz artık daha keyifli.
            </p>
            
            <div className={styles.serviceCards}>
              <div className={styles.serviceCard}>
                <div className={styles.serviceIcon}>
                  <FontAwesomeIcon icon={faAppleAlt} size="3x" className={styles.featureIcon} />
                </div>
                <h3>Elma Toplama Oyunu</h3>
                <p>Havada süzülen renkli elmaları yakalayıp doğru sepetlere yerleştirerek el-göz koordinasyonu ve motor becerilerinizi geliştirin.</p>
                <a href="/" className={styles.serviceLink}>Detaylar</a>
              </div>
              
              <div className={styles.serviceCard}>
                <div className={styles.serviceIcon}>
                  <FontAwesomeIcon icon={faGamepad} size="3x" className={styles.featureIcon} />
                </div>
                <h3>Oyunlaştırılmış Terapi</h3>
                <p>Zorluk seviyeleri ile rehabilitasyon sürecini eğlenceli ve motive edici hale getirin.</p>
                <a href="/" className={styles.serviceLink}>Detaylar</a>
              </div>
              
              <div className={styles.serviceCard}>
                <div className={styles.serviceIcon}>
                  <FontAwesomeIcon icon={faBrain} size="3x" className={styles.featureIcon} />
                </div>
                <h3>Nöroplastisite Desteği</h3>
                <p>Beyin ve sinir sistemi rehabilitasyonu için özel tasarlanmış etkinliklerle iyileşme sürecini hızlandırın.</p>
                <a href="/" className={styles.serviceLink}>Detaylar</a>
              </div>
            </div>
          </section>
          
          <section className={styles.howItWorks}>
            <h2 className={styles.sectionTitle}>Nasıl Çalışır?</h2>
            <div className={styles.workflowContainer}>
              <div className={styles.workflowStep}>
                <div className={styles.workflowIcon}>
                  <FontAwesomeIcon icon={faVrCardboard} size="2x" />
                </div>
                <h3>1. VR Gözlük Takın</h3>
                <p>Ergonomik ve hafif VR gözlüğümüzü takarak sanal rehabilitasyon ortamına adım atın.</p>
              </div>
              
              <div className={styles.workflowStep}>
                <div className={styles.workflowIcon}>
                  <FontAwesomeIcon icon={faHandPointer} size="2x" />
                </div>
                <h3>2. Elmaları Yakalayın</h3>
                <p>Sanal ortamda beliren elmaları hareket ettirerek yakalayın ve doğru renkteki sepete yerleştirin.</p>
              </div>
              
              <div className={styles.workflowStep}>
                <div className={styles.workflowIcon}>
                  <FontAwesomeIcon icon={faAward} size="2x" />
                </div>
                <h3>3. Seviye Atlayın</h3>
                <p>Başarılı hareketlerle zorluk seviyelerini aşın ve yeni rekorlar kırın.</p>
              </div>
              
              <div className={styles.workflowStep}>
                <div className={styles.workflowIcon}>
                  <FontAwesomeIcon icon={faClipboardCheck} size="2x" />
                </div>
                <h3>4. Gelişiminizi Görün</h3>
                <p>Detaylı raporlar ve grafiklerle günlük, haftalık ve aylık ilerlemenizi takip edin.</p>
              </div>
            </div>
          </section>
          
          <section className={styles.about}>
            <h2 className={styles.sectionTitle}>Neden RWA?</h2>
            <div className={styles.aboutContent}>
              <div className={styles.aboutText}>
                <p>Geleneksel rehabilitasyon yöntemlerini modern teknolojiyle birleştirerek felç rehabilitasyonunda devrim yaratıyoruz. VR tabanlı "Elma Toplama" oyunumuz, klinik çalışmalarla etkinliği kanıtlanmış yenilikçi bir terapi yöntemidir.</p>
                <ul className={styles.aboutList}>
                  <li><FontAwesomeIcon icon={faChartLine} className={styles.listIcon} /> Ölçülebilir sonuçlar ve veri odaklı iyileşme</li>
                  <li><FontAwesomeIcon icon={faGamepad} className={styles.listIcon} /> Eğlenceli ve motive edici ortam</li>
                  <li><FontAwesomeIcon icon={faVrCardboard} className={styles.listIcon} /> Evden veya klinikten erişim imkanı</li>
                </ul>
                <a href="/bilimsel-arastirma" className={styles.aboutLink}>Araştırma Sonuçlarımız</a>
              </div>
              <div className={styles.aboutImage}>
                <Image src="/images/vr-rehabilitation.jpg" alt="VR Rehabilitasyon" width={500} height={350} className={styles.roundedImage} />
              </div>
            </div>
          </section>
          
          <section className={styles.testimonials}>
            <h2 className={styles.sectionTitle}>Kullanıcı Deneyimleri</h2>
            <div className={styles.testimonialCards}>
              <div className={styles.testimonialCard}>
                <div className={styles.testimonialContent}>
                  <p>"İnme sonrası sol kolumu hareket ettirmekte zorlanıyordum. VR oyunu ile rehabilitasyon, beni motive etti ve 3 ay içinde günlük işlerimi yapabilir hale geldim."</p>
                </div>
                <div className={styles.testimonialAuthor}>
                  <h4>Ahmet Y., 58</h4>
                  <p>İnme Rehabilitasyonu - 4 ay</p>
                </div>
              </div>
              
              <div className={styles.testimonialCard}>
                <div className={styles.testimonialContent}>
                  <p>"Oğluma oyun oynarken iyileştiğini söylemek çok keyifli. Geleneksel terapiden sıkılırken, VR oyunları ile rehabilitasyon seanslarını dört gözle bekliyor."</p>
                </div>
                <div className={styles.testimonialAuthor}>
                  <h4>Ayşe K., 42</h4>
                  <p>Pediatrik Rehabilitasyon Velisi</p>
                </div>
              </div>
              
              <div className={styles.testimonialCard}>
                <div className={styles.testimonialContent}>
                  <p>"Klinik ortamında kullandığımız VR rehabilitasyon sistemi, hastaların motivasyonunu artırıyor ve iyileşme sürecini yaklaşık %40 hızlandırıyor."</p>
                </div>
                <div className={styles.testimonialAuthor}>
                  <h4>Uzman Dr. Erdem Enes Ö.</h4>
                  <p>Nöroloji Uzmanı</p>
                </div>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}
