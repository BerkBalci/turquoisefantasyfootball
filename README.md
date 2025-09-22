# 🏆 Turquoise Fantasy Football

Modern web teknolojileri kullanılarak geliştirilmiş kapsamlı bir Fantasy Football yönetim platformu. Kullanıcıların takım oluşturmasına, oyuncu yönetmesine ve maç haftalarını takip etmesine olanak sağlayan tam özellikli bir uygulama.

## ✨ Özellikler

### 👥 Kullanıcı Yönetimi
- 🔐 Güvenli kullanıcı kayıt ve giriş sistemi
- 🛡️ JWT token tabanlı kimlik doğrulama
- 🔒 Bcrypt ile şifre hashleme
- 👑 Admin paneli ile kullanıcı yönetimi

### ⚽ Takım ve Oyuncu Yönetimi
- 🏟️ Takım oluşturma ve düzenleme
- 👤 Oyuncu ekleme, düzenleme ve silme
- 📊 Pozisyon bazlı oyuncu kategorileri (Kaleci, Defans, Orta Saha, Forvet)
- 🎯 Takım oluşturucu arayüzü

### 🗓️ Maç ve Hafta Yönetimi
- 📅 Maç haftası oluşturma ve yönetimi
- ⚽ Maç programlama ve sonuç girişi
- 🏆 Puanlama sistemi
- 📈 İstatistik takibi

### 🎨 Modern Arayüz
- 📱 Responsive tasarım
- 🎯 Kullanıcı dostu arayüz
- ⚡ Hızlı ve akıcı deneyim
- 🔔 Gerçek zamanlı bildirimler


## 🛠️ Teknolojiler

### Backend
- **Node.js** - Server-side JavaScript runtime
- **Express.js** - Web framework
- **MySQL** - İlişkisel veritabanı
- **JWT** - Token tabanlı kimlik doğrulama
- **Bcrypt** - Şifre hashleme
- **CORS** - Cross-origin resource sharing

### Frontend
- **React.js** - Kullanıcı arayüzü kütüphanesi
- **React Router** - Sayfa yönlendirme
- **Axios** - HTTP istekleri
- **CSS3** - Modern stil tasarımı

## 🚀 Kurulum

### Gereksinimler
- Node.js (v14 veya üzeri)
- MySQL (XAMPP ile birlikte gelir)
- npm veya yarn

### 1. Veritabanı Kurulumu
1. XAMPP'ı başlatın ve MySQL servisini çalıştırın
2. phpMyAdmin'e gidin (http://localhost/phpmyadmin)
3. `backend/database.sql` dosyasını çalıştırarak veritabanını oluşturun

### 2. Backend Kurulumu
```bash
cd backend
npm install
npm start
```
Backend http://localhost:5000 adresinde çalışacak.

### 3. Frontend Kurulumu
```bash
cd frontend
npm install
npm start
```
Frontend http://localhost:3000 adresinde çalışacak.

## 📖 Kullanım

1. Uygulamayı başlattıktan sonra http://localhost:3000 adresine gidin
2. "Kayıt Ol" linkine tıklayarak yeni hesap oluşturun
3. Oluşturduğunuz bilgilerle giriş yapın
4. Admin iseniz yönetim paneli, kullanıcı iseniz dashboard görüntülenecek

## 📁 Proje Yapısı

```
TurquoiseFantasyFootball/
├── backend/
│   ├── config.js          # Veritabanı konfigürasyonu
│   ├── database.sql       # Veritabanı şeması
│   ├── db.js             # Veritabanı bağlantısı
│   ├── server.js         # Ana server dosyası
│   └── package.json      # Backend bağımlılıkları
├── frontend/
│   ├── public/
│   │   └── index.html    # Ana HTML dosyası
│   ├── src/
│   │   ├── components/   # React bileşenleri
│   │   │   ├── AdminPanel.js
│   │   │   ├── Dashboard.js
│   │   │   ├── Login.js
│   │   │   ├── Signup.js
│   │   │   ├── TeamManagement.js
│   │   │   ├── PlayerManagement.js
│   │   │   ├── MatchManagement.js
│   │   │   └── ...
│   │   ├── contexts/
│   │   │   └── AuthContext.js
│   │   ├── App.js        # Ana uygulama bileşeni
│   │   └── index.js      # Uygulama giriş noktası
│   └── package.json      # Frontend bağımlılıkları
└── README.md
```

## 🎯 Özellik Detayları

### Admin Paneli
- Kullanıcı yönetimi
- Takım ve oyuncu ekleme/düzenleme
- Maç haftası oluşturma
- Maç sonuçları girişi
- Puanlama sistemi yönetimi

### Kullanıcı Dashboard
- Takım oluşturma
- Oyuncu seçimi
- Maç sonuçlarını görüntüleme
- Puan takibi



### Proje Kullanımı
- Canlı maç sonuçları ve istatistiklerini tamamen manuel yönetebilirsiniz.
- 
- Eğer canlı maç sonuçları ve istatistikler için herhangi bir api kullanacaksanız entegre edebilirsiniz.
- 
- Fikstürleri manuel olarak girip kullanıcıların fantasy takımlarını oluşturmasını sağlayabilirsiniz.
- 
- Maçlar tamamlandıktan sonra her oyuncunun istatistiklerini manuel olarak girip haftayı kapatıp puan hesaplaması yapabilirisiniz.
- 
- Kullanıcıların kurdukları takım puanları hesaplanır ve arkadaşlarınızla kendi fantasy liginizde eğlenebilirsiniz.
- 
- Puanlama sistemi ile her istatistiğe verilecek puanı değiştirebilir kendi liginizi dizayn edebilirsiniz.
