# VR Rehabilitasyon Uygulaması

## Firebase Yapılandırması

Bu uygulama Firebase'i kullanır. Aşağıdaki ayarları Firebase konsolunda yapmanız gerekir:

### Firestore Güvenlik Kuralları

Firebase Console > Firestore Database > Rules sekmesinde aşağıdaki güvenlik kurallarını ekleyin:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /stats/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /progress/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Firebase Authentication

1. Firebase Console > Authentication > Sign-in method
2. Email/Password yöntemini etkinleştirin

### Firestore Database

1. Firebase Console > Firestore Database
2. "Create database" seçeneğini tıklayın
3. "Start in test mode" seçeneğini seçin (daha sonra güvenlik kurallarını ekleyeceksiniz)
4. Uygun bölgeyi seçin (örn. "eur3 (europe-west)")
5. "Enable" düğmesini tıklayın

## Ortam Değişkenleri

Uygulamanın kök dizininde `.env.local` dosyası oluşturun ve Firebase yapılandırma bilgilerinizi ekleyin:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## Kurulum

Uygulamayı kurmak için aşağıdaki komutları çalıştırın:

```bash
npm install
npm run dev
```
