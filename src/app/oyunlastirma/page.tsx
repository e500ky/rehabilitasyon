'use client';

import Header from '@/components/Header';
import {
    faArrowRight,
    faArrowUp,
    faChartLine,
    faGamepad,
    faMedal,
    faSmile,
    faStopwatch,
    faTrophy,
    faUsers
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image from 'next/image';
import Link from 'next/link';
import styles from './oyunlastirma.module.css';

export default function Oyunlastirma() {
  return (
    <>
      <Header />
      <div className={styles.container}>
        <div className={styles.heroSection}>
          <div className={styles.heroContent}>
            <h1 className={styles.title}>Oyunlaştırılmış Rehabilitasyon</h1>
            <p className={styles.subtitle}>
              VR rehabilitasyon sürecimizde oyunlaştırma unsurlarıyla motivasyon ve iyileşme sürecini hızlandırıyoruz
            </p>
          </div>
        </div>

        <div className={styles.contentSection}>
          <div className={styles.introSection}>
            <div className={styles.introGrid}>
              <div className={styles.introText}>
                <h2 className={styles.sectionTitle}>Oyunlaştırma Nedir?</h2>
                <p>
                  Oyunlaştırma, oyun dışı bağlamlarda oyun tasarım unsurlarının ve oyun prensiplerinin kullanılmasıdır. Rehabilitasyon alanında oyunlaştırma, tedavi sürecini daha eğlenceli ve motive edici hale getirerek hastaların tedaviye katılımını artırmayı ve sonuçlarını iyileştirmeyi hedefler.
                </p>
                <p>
                  VR Rehabilitasyon sistemimizde kullandığımız oyunlaştırma unsurları, hastaların tedavi sürecine daha aktif katılımını teşvik eder, motivasyonlarını yüksek tutar ve iyileşme süreçlerini hızlandırır. Geleneksel rehabilitasyon yöntemlerinin sıkıcı ve tekrar eden doğasını eğlenceli bir deneyime dönüştürerek, tedavi uyumunu artırıyoruz.
                </p>
              </div>
              <div className={styles.introImage}>
                <Image 
                  src="/images/gamification.jpg" 
                  alt="Oyunlaştırma Konsepti" 
                  width={500} 
                  height={350}
                  className={styles.roundedImage}
                />
              </div>
            </div>
          </div>

          <div className={styles.elementsSection}>
            <h2 className={styles.sectionTitle}>Oyunlaştırma Unsurlarımız</h2>
            <div className={styles.elementsGrid}>
              <div className={styles.elementCard}>
                <div className={styles.elementIcon}>
                  <FontAwesomeIcon icon={faTrophy} />
                </div>
                <h3>Puan ve Ödüller</h3>
                <p>Her başarılı hareket ve tamamlanan görev için puan kazanın. Farklı seviyelerde madalya ve rozetler toplayarak başarılarınızı sergileyebilirsiniz.</p>
              </div>
              
              <div className={styles.elementCard}>
                <div className={styles.elementIcon}>
                  <FontAwesomeIcon icon={faChartLine} />
                </div>
                <h3>İlerleme Çizelgeleri</h3>
                <p>Günlük, haftalık ve aylık ilerleme grafikleri ile gelişiminizi somut olarak görün ve hedeflerinize ne kadar yaklaştığınızı takip edin.</p>
              </div>
              
              <div className={styles.elementCard}>
                <div className={styles.elementIcon}>
                  <FontAwesomeIcon icon={faArrowUp} />
                </div>
                <h3>Zorluk Seviyeleri</h3>
                <p>Başlangıç seviyesinden uzmanlık seviyesine kadar kademeli olarak zorlaşan seviyeler ile sürekli gelişim sağlayın ve sıkılmadan ilerleyin.</p>
              </div>
              
              <div className={styles.elementCard}>
                <div className={styles.elementIcon}>
                  <FontAwesomeIcon icon={faUsers} />
                </div>
                <h3>Sosyal Rekabet</h3>
                <p>Lider tabloları ile diğer kullanıcılarla rekabet edin veya takımlar halinde işbirliği yaparak ortak hedeflere ulaşın.</p>
              </div>
              
              <div className={styles.elementCard}>
                <div className={styles.elementIcon}>
                  <FontAwesomeIcon icon={faMedal} />
                </div>
                <h3>Başarılar</h3>
                <p>Özel hareketleri tamamlamak, belirli süreleri aşmak gibi çeşitli kriterlere bağlı başarılar açarak motivasyonunuzu artırın.</p>
              </div>
              
              <div className={styles.elementCard}>
                <div className={styles.elementIcon}>
                  <FontAwesomeIcon icon={faStopwatch} />
                </div>
                <h3>Günlük Görevler</h3>
                <p>Her gün yeni görevler ve hedeflerle rehabilitasyon rutininizi zenginleştirin ve düzenli katılımınızı artırın.</p>
              </div>
            </div>
          </div>

          <div className={styles.benefitsSection}>
            <h2 className={styles.sectionTitle}>Oyunlaştırmanın Faydaları</h2>
            <div className={styles.benefitsList}>
              <div className={styles.benefitItem}>
                <div className={styles.benefitNumber}>01</div>
                <div className={styles.benefitContent}>
                  <h3>Artan Motivasyon</h3>
                  <p>Oyunlaştırma, hastanın tedaviye istekle katılmasını sağlayarak motivasyonunu artırır. Geleneksel rehabilitasyon egzersizlerini yapmak yerine bir oyunu oynamak daha eğlenceli ve motive edicidir.</p>
                </div>
              </div>
              
              <div className={styles.benefitItem}>
                <div className={styles.benefitNumber}>02</div>
                <div className={styles.benefitContent}>
                  <h3>Daha Uzun Egzersiz Süreleri</h3>
                  <p>Oyunla meşgul olan hastalar, farkında olmadan daha uzun süre egzersiz yaparlar. Bu, geleneksel yöntemlere göre daha fazla tekrar ve daha uzun süreli rehabilitasyon oturumları anlamına gelir.</p>
                </div>
              </div>
              
              <div className={styles.benefitItem}>
                <div className={styles.benefitNumber}>03</div>
                <div className={styles.benefitContent}>
                  <h3>Ölçülebilir İlerleme</h3>
                  <p>Puanlar, seviyeler ve başarılar gibi oyunlaştırma metrikleri, hastanın ve terapistin ilerlemeyi somut olarak görmesini sağlar. Bu veri odaklı yaklaşım, tedavi planını optimize etmeye yardımcı olur.</p>
                </div>
              </div>
              
              <div className={styles.benefitItem}>
                <div className={styles.benefitNumber}>04</div>
                <div className={styles.benefitContent}>
                  <h3>Anında Geri Bildirim</h3>
                  <p>Oyun içi geri bildirim mekanizmaları, hastaların hareketlerinin doğruluğunu anında görmelerini sağlar. Bu, doğru hareket paternlerinin daha hızlı öğrenilmesine yardımcı olur.</p>
                </div>
              </div>
              
              <div className={styles.benefitItem}>
                <div className={styles.benefitNumber}>05</div>
                <div className={styles.benefitContent}>
                  <h3>Sosyal Etkileşim</h3>
                  <p>Çok oyunculu modlar ve sosyal karşılaştırma özellikleri, rehabilitasyon sürecine sosyal bir boyut katar, yalnızlık hissini azaltır ve rekabet/işbirliği ile motivasyonu artırır.</p>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.testimonialsSection}>
            <h2 className={styles.sectionTitle}>Kullanıcı Deneyimleri</h2>
            <div className={styles.testimonialsList}>
              <div className={styles.testimonialCard}>
                <div className={styles.testimonialContent}>
                  <p>"Elma toplama oyunundaki başarı ve puan sistemi beni sürekli daha iyisini yapmaya teşvik etti. Oyun oynarken rehabilitasyon yaptığımı bile unutuyorum."</p>
                </div>
                <div className={styles.testimonialAuthor}>
                  <Image 
                    src="/images/testimonial-1.jpg" 
                    alt="Ahmet Yılmaz" 
                    width={60} 
                    height={60}
                    className={styles.testimonialImage} 
                  />
                  <div>
                    <h4>Ahmet Yılmaz, 52</h4>
                    <p>İnme Hastası - 3 Ay Tedavi</p>
                  </div>
                </div>
              </div>
              
              <div className={styles.testimonialCard}>
                <div className={styles.testimonialContent}>
                  <p>"Oğlum, geleneksel fizik tedavi egzersizlerini yapmak istemiyordu. VR oyunları ile artık tedavi saatlerini dört gözle bekliyor ve arkadaşlarıyla skorlarını karşılaştırıyor."</p>
                </div>
                <div className={styles.testimonialAuthor}>
                  <Image 
                    src="/images/testimonial-2.jpg" 
                    alt="Zeynep Kaya" 
                    width={60} 
                    height={60}
                    className={styles.testimonialImage} 
                  />
                  <div>
                    <h4>Zeynep Kaya</h4>
                    <p>Hasta Yakını</p>
                  </div>
                </div>
              </div>
              
              <div className={styles.testimonialCard}>
                <div className={styles.testimonialContent}>
                  <p>"Oyunlaştırma unsurları sayesinde hastalarım artık egzersizleri daha uzun süre ve daha istekli yapıyorlar. Bu da tedavinin etkinliğini ciddi şekilde artırıyor."</p>
                </div>
                <div className={styles.testimonialAuthor}>
                  <Image 
                    src="/images/testimonial-3.jpg" 
                    alt="Dr. Mehmet Demir" 
                    width={60} 
                    height={60}
                    className={styles.testimonialImage} 
                  />
                  <div>
                    <h4>Dr. Mehmet Demir</h4>
                    <p>Fizyoterapist</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className={styles.researchSection}>
            <div className={styles.researchContent}>
              <div className={styles.researchIcon}>
                <FontAwesomeIcon icon={faSmile} />
              </div>
              <h2>Oyunlaştırma ve Bilimsel Araştırmalar</h2>
              <p>Yapılan klinik çalışmalar, oyunlaştırılmış rehabilitasyon yöntemlerinin geleneksel yöntemlere göre %40'a varan oranda daha hızlı iyileşme sağladığını göstermektedir. Oyunlaştırma unsurları, hastaların tedaviye uyumunu artırarak rehabilitasyon sürecinin etkinliğini yükseltir.</p>
              <Link href="/bilimsel-arastirma" className={styles.researchLink}>
                Bilimsel Araştırmalarımız <FontAwesomeIcon icon={faArrowRight} className={styles.researchLinkIcon} />
              </Link>
            </div>
          </div>

          <div className={styles.ctaSection}>
            <h2>VR Rehabilitasyon Oyunlarımızı Deneyimleyin</h2>
            <p>Siz de VR rehabilitasyon deneyimini yaşamak ve oyunlaştırılmış tedavi sürecinin parçası olmak ister misiniz?</p>
            <div className={styles.ctaButtons}>
              <Link href="/demo" className={styles.primaryButton}>
                Demo İste <FontAwesomeIcon icon={faGamepad} />
              </Link>
              <Link href="/iletisim" className={styles.secondaryButton}>
                Bizimle İletişime Geç
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
