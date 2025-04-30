import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';
import styles from './PasswordInput.module.css';

interface PasswordInputProps {
  id?: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  id,
  name,
  value,
  onChange,
  placeholder = "Şifre",
  required = false,
  className,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = (e: React.MouseEvent) => {
    e.preventDefault(); 
    setShowPassword(!showPassword);
  };

  return (
    <div className={styles.passwordInputContainer}>
      <input
        id={id}
        type={showPassword ? "text" : "password"}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`${styles.passwordInput} ${className || ''}`}
      />
      <button
        type="button"
        onClick={togglePasswordVisibility}
        className={styles.visibilityToggle}
        tabIndex={-1}
        aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
      >
        <FontAwesomeIcon 
          icon={showPassword ? faEyeSlash : faEye}
          className={styles.visibilityIcon} 
        />
      </button>
    </div>
  );
};

export default PasswordInput;
