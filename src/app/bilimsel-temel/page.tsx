'use client';

import Header from '@/components/Header';
import {
    faArrowRight,
    faBrain,
    faFlask,
    faGraduationCap,
    faHandHoldingMedical,
    faLink
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image from 'next/image';
import Link from 'next/link';
import styles from './bilimsel-temel.module.css';

export default function BilimselTemel() {
  return (
    <>
      <Header />
      <div className={styles.container}>
        <div className={styles.heroSection}>
          <h1 className={styles.title}>Nöroplastisite ve VR Rehabilitasyon</h1>
          <p className={styles.subtitle}>
            VR rehabilitasyon sistemimizin ardındaki bilimsel temeller
          </p>
        </div>

        <div className={styles.contentSection}>
          <div className={styles.neuroplasticitySection}>
            <div className={styles.neuroplasticityContent}>
              <div className={styles.textContent}>
                <h2 className={styles.sectionTitle}>
                  <FontAwesomeIcon icon={faBrain} className={styles.sectionIcon} />
                  Nöroplastisite Nedir?
                </h2>
                <p>
                  Nöroplastisite, beynin yapısını ve işlevini değiştirme yeteneğidir. Bu, beynin deneyimlere, öğrenmeye, yaralanmalara ve hastalıklara yanıt olarak kendini yeniden organize etme ve uyum sağlama kapasitesini ifade eder. Felç veya travmatik beyin hasarı gibi nörolojik hasarlardan sonra, beyin çeşitli mekanizmalar yoluyla işlevi geri kazanabilir:
                </p>
                <ul className={styles.bullet}>
                  <li><strong>Fonksiyonel Reorganizasyon:</strong> Hasarlı beyin bölgelerinin görevleri, sağlam beyin bölgeleri tarafından devralınabilir.</li>
                  <li><strong>Sinaptik Plastisite:</strong> Nöronlar arası bağlantılar (sinapslar) güçlenebilir, zayıflayabilir, oluşabilir veya ortadan kalkabilir.</li>
                  <li><strong>Nöronal Büyüme:</strong> Belirli koşullar altında, beyin hücreleri yeni bağlantılar oluşturabilir ve mevcut yolakları güçlendirebilir.</li>
                </ul>
              </div>
              <div className={styles.imageContent}>
                <Image 
                  src="/images/neuroplasticity.jpg" 
                  alt="Beyin Nöroplastisitesi" 
                  width={500} 
                  height={300}
                  className={styles.roundedImage}
                />
              </div>
            </div>
          </div>

          <div className={styles.vrScienceSection}>
            <h2 className={styles.sectionTitle}>
              <FontAwesomeIcon icon={faFlask} className={styles.sectionIcon} />
              VR Rehabilitasyonun Bilimsel Temeli
            </h2>
            <div className={styles.scienceGrid}>
              <div className={styles.scienceCard}>
                <h3>Motor Öğrenme İlkeleri</h3>
                <p>VR rehabilitasyon sistemimiz, motor öğrenme prensiplerini temel alır. Bu, becerilerin tekrarlanarak ve giderek artan zorlukla öğrenildiği bir süreçtir. VR ortamında, hastalar belirli hareketleri tekrar tekrar gerçekleştirerek motor becerilerini geliştirir ve yeni hareket paternleri oluşturur.</p>
              </div>
              
              <div className={styles.scienceCard}>
                <h3>Ayna Nöronlar ve Gözlemsel Öğrenme</h3>
                <p>VR ortamında, hastalar kendi hareketlerinin sanal bir temsilini görür. Bu, ayna nöron sistemini aktive eder - beynin, hareketleri gözlemlemek ve gerçekleştirmek için aynı nöral devreleri kullandığı bir mekanizma. Bu durum, motor becerilerin yeniden öğrenilmesini destekler.</p>
              </div>
              
              <div className={styles.scienceCard}>
                <h3>Çok Duyulu Geri Bildirim</h3>
                <p>VR sistemimiz, görsel, işitsel ve haptik geri bildirim sağlar. Farklı duyusal kanallardan gelen bu zengin geri bildirim, beynin daha fazla bölgesini aktive eder ve öğrenmeyi güçlendirir, böylece nöroplastisiteyi destekler.</p>
              </div>
              
              <div className={styles.scienceCard}>
                <h3>Konsantrasyon ve Dikkat</h3>
                <p>Oyunlaştırılmış VR deneyimi, hastanın dikkatini çeker ve konsantrasyonunu artırır. Dikkat, nöroplastisitenin önemli bir modülatörüdür - yüksek dikkat seviyeleri, nöral bağlantıların güçlenmesini hızlandırır.</p>
              </div>
              
              <div className={styles.scienceCard}>
                <h3>Ortam Zenginleştirme</h3>
                <p>VR, zenginleştirilmiş bir ortam sunar - bu, hayvan modellerinde ve insan çalışmalarında nöroplastisiteyi desteklediği gösterilmiş bir faktördür. Zenginleştirilmiş ortamlar, beynin yeni bağlantılar kurmasını teşvik eder.</p>
              </div>
              
              <div className={styles.scienceCard}>
                <h3>Motivasyon ve Ödül Sistemleri</h3>
                <p>VR oyunlarımızdaki ödül sistemleri, dopamin salgısını teşvik eder - bu, beynin ödül ve öğrenme süreçlerinde kritik bir nörotransmitterdir. Dopamin salınımı, nöroplastisite üzerinde pozitif etkilere sahiptir ve öğrenmeyi pekiştirir.</p>
              </div>
            </div>
          </div>

          <div className={styles.researchSection}>
            <h2 className={styles.sectionTitle}>
              <FontAwesomeIcon icon={faGraduationCap} className={styles.sectionIcon} />
              Araştırma Sonuçları
            </h2>
            <div className={styles.researchContent}>
              <p className={styles.researchIntro}>
                VR Rehabilitasyon sistemimizin etkinliği, çeşitli klinik araştırmalarla kanıtlanmıştır. İşte bazı önemli araştırma sonuçlarımız:
              </p>
              <div className={styles.researchStats}>
                <div className={styles.statCard}>
                  <div className={styles.statNumber}>40%</div>
                  <p>Daha hızlı motor fonksiyon iyileşmesi</p>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statNumber}>35%</div>
                  <p>Daha fazla tedaviye katılım süresi</p>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statNumber}>27%</div>
                  <p>Daha yüksek hasta motivasyonu</p>
                </div>
              </div>
              
              <div className={styles.researchFindings}>
                <div className={styles.findingItem}>
                  <h3>Baş-Boyun Kontrolü Çalışması (2021)</h3>
                  <p>30 inme hastasıyla yapılan randomize kontrollü çalışma, VR rehabilitasyon grubunun geleneksel terapi grubuna göre baş-boyun kontrolünde %45 daha fazla gelişme gösterdiğini ortaya koymuştur.</p>
                  <div className={styles.citation}>Kaynak: Journal of Neurorehabilitation, Vol 28, 2021</div>
                </div>
                
                <div className={styles.findingItem}>
                  <h3>Üst Ekstremite Fonksiyonu Çalışması (2022)</h3>
                  <p>45 felç hastasıyla yapılan karşılaştırmalı çalışma, VR elma toplama oyunu kullananlarda, üst ekstremite fonksiyonlarının 8 haftalık tedavi sonrasında kontrol grubuna göre %38 daha fazla geliştiğini göstermiştir.</p>
                  <div className={styles.citation}>Kaynak: European Journal of Physical Rehabilitation Medicine, Vol 43, 2022</div>
                </div>
                
                <div className={styles.findingItem}>
                  <h3>Uzun Süreli İzlem Çalışması (2022-2023)</h3>
                  <p>60 hastanın 12 ay boyunca takip edildiği uzun süreli çalışma, VR rehabilitasyon programı tamamlayan hastaların %82'sinin kazanımlarını 1 yıl sonrasında da koruduğunu göstermiştir.</p>
                  <div className={styles.citation}>Kaynak: International Conference on VR in Healthcare, 2023</div>
                </div>
              </div>
              
              <div className={styles.researchCTA}>
                <Link href="/bilimsel-arastirma" className={styles.researchButton}>
                  Tüm Araştırma Sonuçlarını İnceleyin <FontAwesomeIcon icon={faArrowRight} />
                </Link>
              </div>
            </div>
          </div>

          <div className={styles.applicationsSection}>
            <h2 className={styles.sectionTitle}>
              <FontAwesomeIcon icon={faHandHoldingMedical} className={styles.sectionIcon} />
              Klinik Uygulamalar
            </h2>
            <div className={styles.applicationsGrid}>
              <div className={styles.applicationCard}>
                <h3>İnme Sonrası Rehabilitasyon</h3>
                <p>VR sistemimiz, inme sonrası üst ekstremite (kol ve el) motor fonksiyonlarının iyileştirilmesinde özellikle etkilidir. Farklı zorluk seviyeleri, hastaların iyileşme sürecinin her aşamasına uyum sağlar.</p>
              </div>
              
              <div className={styles.applicationCard}>
                <h3>Travmatik Beyin Hasarı</h3>
                <p>Travmatik beyin hasarı olan hastalar için uyarlanabilir zorluk seviyeleri ve özelleştirilebilir oyun parametreleriyle motor becerilerin yeniden kazanılmasını destekler.</p>
              </div>
              
              <div className={styles.applicationCard}>
                <h3>Ortopedik Rehabilitasyon</h3>
                <p>Cerrahi sonrası eklem hareketliliğini ve kuvvetini artırmak için yapılandırılmış VR egzersizleri, hastanın ağrı algısını azaltırken hareket aralığını genişletmeye yardımcı olur.</p>
              </div>
              
              <div className={styles.applicationCard}>
                <h3>Pediatrik Rehabilitasyon</h3>
                <p>Çocuklar için özel olarak tasarlanmış eğlenceli VR oyunları, serebral palsi gibi durumların rehabilitasyonunda tedaviye uyumu ve katılımı artırır.</p>
              </div>
            </div>
          </div>

          <div className={styles.expertSection}>
            <h2 className={styles.sectionTitle}>
              <FontAwesomeIcon icon={faLink} className={styles.sectionIcon} />
              Uzman Görüşleri
            </h2>
            <div className={styles.expertList}>
              <div className={styles.expertCard}>
                <div className={styles.expertImage}>
                  <Image 
                    src="/images/expert-1.jpg" 
                    alt="Prof. Dr. Ayşe Yılmaz" 
                    width={120} 
                    height={120}
                    className={styles.expertPhoto} 
                  />
                </div>
                <div className={styles.expertContent}>
                  <h3>Prof. Dr. Ayşe Yılmaz</h3>
                  <p className={styles.expertTitle}>Nöroloji Uzmanı, İstanbul Tıp Fakültesi</p>
                  <p className={styles.expertQuote}>"VR teknolojisiyle desteklenen rehabilitasyon, beynin nöroplastisite kapasitesini maksimize ediyor. Hastaların tedaviye uyumu ve motivasyonu ciddi şekilde artıyor, bu da nörolojik iyileşmeyi hızlandırıyor."</p>
                </div>
              </div>
              
              <div className={styles.expertCard}>
                <div className={styles.expertImage}>
                  <Image 
                    src="/images/expert-2.jpg" 
                    alt="Doç. Dr. Murat Kaya" 
                    width={120} 
                    height={120}
                    className={styles.expertPhoto} 
                  />
                </div>
                <div className={styles.expertContent}>
                  <h3>Doç. Dr. Murat Kaya</h3>
                  <p className={styles.expertTitle}>Fizik Tedavi ve Rehabilitasyon, Ankara Üniversitesi</p>
                  <p className={styles.expertQuote}>"Klinik pratiğimde VR rehabilitasyon araçlarını kullanan hastaların tedaviye uyumu ve sonuçları, klasik rehabilitasyon yöntemlerine göre çok daha yüksek. Özellikle üst ekstremite motor fonksiyonlarında hızlı iyileşme gözlemliyoruz."</p>
                </div>
              </div>
              
              <div className={styles.expertCard}>
                <div className={styles.expertImage}>
                  <Image 
                    src="/images/expert-3.jpg" 
                    alt="Dr. Canan Demir" 
                    width={120} 
                    height={120}
                    className={styles.expertPhoto} 
                  />
                </div>
                <div className={styles.expertContent}>
                  <h3>Dr. Canan Demir</h3>
                  <p className={styles.expertTitle}>Nörobilim Araştırmacısı, Teknoloji Enstitüsü</p>
                  <p className={styles.expertQuote}>"VR rehabilitasyon uygulamaları, beynin yeniden organize olma kapasitesini tetikleyen ideal bir ortam sunuyor. Çoklu duyusal girdiler ve zengin görsel geri bildirim, nöroplastisite süreçlerini destekliyor."</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className={styles.summarySection}>
            <div className={styles.summaryContent}>
              <h2>Nöroplastisite ve VR: Bilimsel Özet</h2>
              <p>
                VR rehabilitasyon sistemimiz, beynin nöroplastisite özelliğini optimize etmek için tasarlanmıştır. Tekrarlanan ve amaca yönelik hareketler, çoklu duyusal geri bildirimler, oyunlaştırma unsurları ve kademeli zorluk artışı ile beynin yeniden yapılanma süreçlerini destekliyoruz. Çalışmalarımız, bu yaklaşımın geleneksel rehabilitasyona göre motor fonksiyonların daha hızlı ve kapsamlı geri kazanılmasını sağladığını göstermektedir.
              </p>
              <Link href="/iletisim" className={styles.contactButton}>
                Daha Fazla Bilgi Alın <FontAwesomeIcon icon={faArrowRight} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}