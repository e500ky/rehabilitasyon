export interface SignUpData {
  email: string;
  password: string;
  name?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  emailVerified: boolean;
  photoURL?: string | null;
  createdAt?: string;
}

class AuthService {
  // Kullanıcı kaydı
  async signUp({ email, password, name }: SignUpData): Promise<User> {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Kayıt olma hatası');
      }
      
      return data.user;
    } catch (error) {
      console.error('Kayıt olma servis hatası:', error);
      throw error;
    }
  }

  // Kullanıcı girişi
  async signIn({ email, password }: SignInData): Promise<User> {
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Oturum açma hatası');
      }
      
      return data.user;
    } catch (error) {
      console.error('Oturum açma servis hatası:', error);
      throw error;
    }
  }

  // Oturumu kapat
  async signOut(): Promise<void> {
    try {
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Oturum kapatma hatası');
      }
    } catch (error) {
      console.error('Oturum kapatma servis hatası:', error);
      throw error;
    }
  }

  // Kullanıcı bilgilerini al
  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await fetch('/api/auth/user', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // 401 durumunda kullanıcının oturum açmadığını düşünüyoruz
      if (response.status === 401) {
        return null;
      }

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Kullanıcı bilgisi alma hatası');
      }
      
      return data.user;
    } catch (error) {
      console.error('Kullanıcı bilgisi alma servis hatası:', error);
      return null;
    }
  }

  // Şifre sıfırlama e-postası gönder
  async sendPasswordReset(email: string): Promise<void> {
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Şifre sıfırlama hatası');
      }
    } catch (error) {
      console.error('Şifre sıfırlama servis hatası:', error);
      throw error;
    }
  }
}

export default new AuthService();
