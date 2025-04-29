import { clientAuth } from '@/lib/firebase-client';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// Kayıt olma işlemi için API endpoint
export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();
    
    // Form doğrulama
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email ve şifre zorunludur' }, 
        { status: 400 }
      );
    }
    
    try {
      // Firebase ile kullanıcı oluşturma
      const userCredential = await createUserWithEmailAndPassword(clientAuth, email, password);
      
      // Kullanıcının displayName bilgisini güncelleme
      if (name) {
        await updateProfile(userCredential.user, { displayName: name });
      }
      
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
      console.error('Kayıt olma hatası:', error);
      
      // Firebase hata kodlarını anlamlı hata mesajlarına çevirme
      let errorMessage = 'Kayıt olma sırasında bir hata oluştu';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Bu e-posta adresi zaten kullanılıyor';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Geçersiz e-posta adresi';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Şifre en az 6 karakterden oluşmalıdır';
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
