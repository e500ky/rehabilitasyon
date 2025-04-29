// Firebase App (temel Firebase SDK) ekleniyor
import { initializeApp } from "firebase/app";
// Firebase ürünleri için gerekli olanlar
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase yapılandırma bilgileri
const firebaseConfig = {
  apiKey: "AIzaSyAT-3wn1pkQd9ANTmrzaXoyx3imKR6DBfo",
  authDomain: "rehabilitasyon-ee609.firebaseapp.com",
  projectId: "rehabilitasyon-ee609",
  storageBucket: "rehabilitasyon-ee609.firebasestorage.app",
  messagingSenderId: "952115674678",
  appId: "1:952115674678:web:3c100eaeb4a6d1fe132297",
  measurementId: "G-T82SPMVF2C"
};

// Firebase'i başlat
const app = initializeApp(firebaseConfig);

// Kullanılacak Firebase servisleri
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
