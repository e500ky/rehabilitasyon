import { auth } from '@/lib/firebase';
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User
} from 'firebase/auth';
import firestoreService from './firestoreService';

interface LoginData {
  email: string;
  password: string;
  captchaToken?: string;
}

interface RegisterData {
  email: string;
  password: string;
  displayName: string;
  userType: 'patient' | 'caregiver';
  captchaToken?: string;
}

const authService = {
  // Kullanıcı kaydı
  register: async (userData: RegisterData): Promise<User> => {
    try {
      // reCAPTCHA kontrolü (bypass tokenlar ile esnek çalışma)
      const bypassTokens = [
        'dev_mode_bypass_token', 
        'missing_config_bypass_token', 
        'error_bypass_token',
        'render_error_bypass_token',
        'timeout_bypass_token',
        'init_error_bypass_token'
      ];
      
      // captchaToken varsa ve geçersizse hata fırlat
      // Ancak bypass tokenlerden biriyse kontrolü atla
      if (userData.captchaToken && 
          !bypassTokens.includes(userData.captchaToken) && 
          userData.captchaToken.length < 20) {
        throw new Error("Geçersiz reCAPTCHA doğrulaması. Lütfen tekrar deneyin.");
      }

      // Firebase ile kullanıcı kaydı
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
      );
      
      const user = userCredential.user;
      
      // Kullanıcı profilini güncelle
      await updateProfile(user, {
        displayName: userData.displayName
      });
      
      // Firestore'da kullanıcı profili oluştur
      await firestoreService.createUserProfile(user.uid, {
        uid: user.uid,
        displayName: userData.displayName,
        email: userData.email,
        userType: userData.userType,
        photoURL: user.photoURL || null
      });
      
      // Captcha token'ını kullanarak ekstra doğrulama yapabilirsiniz
      // Örnek: Bir Cloud Function çağrısı ile token'ı doğrulayabilirsiniz
      
      return user;
    } catch (error) {
      console.error("Kayıt hatası:", error);
      throw error;
    }
  },
  
  // Kullanıcı girişi
  login: async (loginData: LoginData): Promise<User> => {
    try {
      // reCAPTCHA kontrolü (bypass tokenlar ile esnek çalışma)
      const bypassTokens = [
        'dev_mode_bypass_token', 
        'missing_config_bypass_token', 
        'error_bypass_token',
        'render_error_bypass_token',
        'timeout_bypass_token',
        'init_error_bypass_token'
      ];
      
      // captchaToken varsa ve geçersizse hata fırlat
      // Ancak bypass tokenlerden biriyse kontrolü atla
      if (loginData.captchaToken && 
          !bypassTokens.includes(loginData.captchaToken) && 
          loginData.captchaToken.length < 20) {
        throw new Error("Geçersiz reCAPTCHA doğrulaması. Lütfen tekrar deneyin.");
      }

      const { email, password } = loginData;
      
      // Captcha token'ını kullanarak ekstra doğrulama yapabilirsiniz
      // Örnek: Bir Cloud Function çağrısı ile token'ı doğrulayabilirsiniz
      
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      
      return userCredential.user;
    } catch (error) {
      console.error("Giriş hatası:", error);
      throw error;
    }
  },
  
  // Çıkış yap
  signOut: async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Çıkış yapma hatası:', error);
      throw error;
    }
  },
  
  // Şifre sıfırlama e-postası gönder
  resetPassword: async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Şifre sıfırlama hatası:', error);
      throw error;
    }
  }
};

export default authService;
