import {
    faFacebookF,
    faInstagram,
    faLinkedinIn,
    faTwitter,
    faYoutube
} from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image from 'next/image';
import Link from 'next/link';
import styles from './LandingFooter.module.css';

const LandingFooter = () => {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <div className={styles.topSection}>
          <div className={styles.logoSection}>
            <Link href="/" className={styles.logoLink}>
              <Image
                src="/logo.png"
                alt="Rehabilitasyon Logo"
                width={120}
                height={50}
                className={styles.footerLogo}
              />
            </Link>
            <p className={styles.tagline}>
              İnme sonrası rehabilitasyon süreçlerinizi teknolojik çözümlerle destekleyerek hayatınızı kolaylaştırıyoruz.
            </p>
          </div>

          <div className={styles.linksSection}>
            <div className={styles.linkGroup}>
              <h3>Çözümlerimiz</h3>
              <ul>
                <li><Link href="/cozumlerimiz">Sanal Rehabilitasyon</Link></li>
                <li><Link href="/cozumlerimiz">Hareket Yakalama</Link></li>
                <li><Link href="/cozumlerimiz">Kişiselleştirilmiş Tedavi</Link></li>
                <li><Link href="/cozumlerimiz">Uzaktan Takip</Link></li>
              </ul>
            </div>

            <div className={styles.linkGroup}>
              <h3>Kurumsal</h3>
              <ul>
                <li><Link href="/hakkimizda">Hakkımızda</Link></li>
                <li><Link href="/bilimsel-arastirma">Bilimsel Araştırma</Link></li>
                <li><Link href="/kariyer">Kariyer</Link></li>
                <li><Link href="/iletisim">İletişim</Link></li>
              </ul>
            </div>

            <div className={styles.linkGroup}>
              <h3>Yardım & Destek</h3>
              <ul>
                <li><Link href="/sss">Sıkça Sorulan Sorular</Link></li>
                <li><Link href="/destek">Destek Merkezi</Link></li>
                <li><Link href="/dokumanlar">Kullanım Kılavuzları</Link></li>
                <li><Link href="/gizlilik-politikasi">Gizlilik Politikası</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className={styles.divider}></div>

        <div className={styles.bottomSection}>
          <p className={styles.copyright}>
            © {year} Rehabilitasyon Platformu. Tüm hakları saklıdır.
          </p>
          
          <div className={styles.socialLinks}>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
              <FontAwesomeIcon icon={faFacebookF} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
              <FontAwesomeIcon icon={faTwitter} />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
              <FontAwesomeIcon icon={faInstagram} />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
              <FontAwesomeIcon icon={faLinkedinIn} />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
              <FontAwesomeIcon icon={faYoutube} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
