import { ApplicationVerifier } from 'firebase/auth';

// Özel doğrulayıcı arayüzü
export interface CustomApplicationVerifier {
  type: string;
  verify: () => Promise<string>;
}

// Firebase Auth doğrulayıcı türleri
export type AuthVerifier = ApplicationVerifier | CustomApplicationVerifier;