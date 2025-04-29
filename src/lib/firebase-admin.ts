import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Servis hesabı için environment variable'ları kontrol et
if (!process.env.FIREBASE_PROJECT_ID) {
  throw new Error('FIREBASE_PROJECT_ID environment variable is not set');
}

// Admin SDK yapılandırması
let app;

if (!getApps().length) {
  // Firebase Admin SDK yapılandırması
  app = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // \n karakterlerini kullanmadan private key'i doğru formatta ayarlama
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
  });
} else {
  app = getApps()[0];
}

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
