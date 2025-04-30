'use client';

import { useTheme } from '@/context/ThemeContext';
import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styles from './ThemeToggle.module.css';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  
  console.log('Tema butonunda mevcut tema:', theme);

  return (
    <button 
      className={styles.themeToggle}
      onClick={toggleTheme}
      aria-label={`Tema değiştir: ${theme === 'light' ? 'koyu mod' : 'açık mod'}`}
      title={`Tema değiştir: ${theme === 'light' ? 'koyu mod' : 'açık mod'}`}
    >
      <FontAwesomeIcon 
        icon={faSun} 
        className={`${styles.themeIcon} ${styles.sunIcon}`} 
      />
      <FontAwesomeIcon 
        icon={faMoon} 
        className={`${styles.themeIcon} ${styles.moonIcon}`} 
      />
    </button>
  );
}