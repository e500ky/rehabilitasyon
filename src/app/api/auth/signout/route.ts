import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Auth cookie'sini silme
    cookies().delete('auth-token');
    
    return NextResponse.json({
      success: true,
      message: 'Oturum kapatıldı'
    });
  } catch (error) {
    console.error('Oturum kapatma hatası:', error);
    return NextResponse.json(
      { error: 'İstek işlenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
