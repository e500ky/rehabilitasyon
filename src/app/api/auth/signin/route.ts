import { clientAuth } from '@/lib/firebase-client';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    // Form doğrulama
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email ve şifre zorunludur' },
        { status: 400 }
      );
    }
    
    try {
      // Firebase ile oturum açma
      const userCredential = await signInWithEmailAndPassword(clientAuth, email, password);
      
      // Token oluşturma
      const token = await userCredential.user.getIdToken();
      
      // Cookie'ye token ayarlama
      cookies().set('auth-token', token, {
        maxAge: 60 * 60 * 24 * 7, // 7 gün
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/'
      });
      
      return NextResponse.json({
        success: true,
        user: {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: userCredential.user.displayName,
          emailVerified: userCredential.user.emailVerified
        }
      });
    } catch (error: any) {
      console.error('Oturum açma hatası:', error);
      
      // Firebase hata kodlarını anlamlı hata mesajlarına çevirme
      let errorMessage = 'Oturum açma sırasında bir hata oluştu';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'Kullanıcı bulunamadı';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Geçersiz şifre';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Geçersiz e-posta adresi';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'Kullanıcı hesabı devre dışı bırakılmış';
      }
      
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }
  } catch (error) {
    console.error('Sunucu hatası:', error);
    return NextResponse.json(
      { error: 'İstek işlenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
