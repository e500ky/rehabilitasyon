import * as admin from 'firebase-admin';

// Servis hesabı için environment variable'ları kontrol et
if (!process.env.FIREBASE_PROJECT_ID) {
  throw new Error('FIREBASE_PROJECT_ID environment variable is not set');
}

// Admin SDK yapılandırması
let app: admin.app.App;

if (!admin.apps.length) {
  // Firebase Admin SDK yapılandırması
  app = admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // \n karakterlerini kullanmadan private key'i doğru formatta ayarlama
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
  });
} else {
  app = admin.app();
}

export const auth = app.auth();
export const db = app.firestore();

export default app;
