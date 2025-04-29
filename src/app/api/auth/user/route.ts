import { auth } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Cookie'den token alma
    const authToken = cookies().get('auth-token')?.value;
    
    if (!authToken) {
      return NextResponse.json(
        { error: 'Oturum açılmamış' },
        { status: 401 }
      );
    }
    
    try {
      // Firebase Admin ile token doğrulama
      const decodedToken = await auth.verifyIdToken(authToken);
      
      // Kullanıcı bilgilerini alma
      const userRecord = await auth.getUser(decodedToken.uid);
      
      return NextResponse.json({
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName,
          emailVerified: userRecord.emailVerified,
          photoURL: userRecord.photoURL,
          createdAt: userRecord.metadata.creationTime
        }
      });
    } catch (error) {
      console.error('Token doğrulama hatası:', error);
      cookies().delete('auth-token'); // Geçersiz token'ı sil
      return NextResponse.json(
        { error: 'Geçersiz veya süresi dolmuş oturum' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Kullanıcı bilgisi alma hatası:', error);
    return NextResponse.json(
      { error: 'İstek işlenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
