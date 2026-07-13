# Sistem Autentikasi Premium (Google, Facebook, Apple Sign-In)

Full-stack: **Backend** (Node.js + Express + MongoDB, Clean Architecture) dan
**Frontend** (React + Vite + Tailwind CSS + Framer Motion).

---

## 1. Struktur Proyek

```
auth-system/
├── backend/
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── config/db.js                     # Koneksi MongoDB
│       ├── models/User.js                   # Skema data user
│       ├── services/
│       │   ├── oauthProviders.service.js     # Verifikasi token ke Google/FB/Apple
│       │   ├── auth.service.js               # Find-or-create user (login/register otomatis)
│       │   └── token.service.js              # JWT access & refresh token
│       ├── controllers/auth.controller.js    # Endpoint login, refresh, logout, profil
│       ├── middlewares/
│       │   ├── auth.middleware.js            # Proteksi route (requireAuth, requireAdmin)
│       │   ├── rateLimiter.js                # Anti brute-force
│       │   └── errorHandler.js               # Error handler global
│       ├── routes/
│       │   ├── auth.routes.js
│       │   └── user.routes.js
│       ├── utils/
│       │   ├── encryption.js                 # Enkripsi & hashing token
│       │   └── apiResponse.js
│       ├── app.js
│       └── server.js
│
├── frontend-html/              # ALTERNATIF: versi HTML/CSS/JS murni, tanpa React/build tool
│   ├── index.html               # Halaman Login
│   ├── dashboard.html           # Halaman terproteksi
│   ├── README.md                # Panduan khusus versi ini
│   └── assets/css|js/...
│
└── frontend/                    # Versi React + Vite + Tailwind
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── index.html                            # Memuat SDK resmi Google/FB/Apple
    ├── .env.example
    └── src/
        ├── main.jsx / App.jsx
        ├── context/AuthContext.jsx            # State login global + Auto Login
        ├── services/api.js                    # Axios + auto refresh token
        ├── components/
        │   ├── SocialButton.jsx
        │   ├── ProviderIcons.jsx
        │   ├── ErrorDialog.jsx
        │   ├── ThemeToggle.jsx
        │   └── ProtectedRoute.jsx
        ├── pages/
        │   ├── Login.jsx
        │   └── Dashboard.jsx
        └── styles/index.css
```

---

## 2. Instalasi

### Backend
```bash
cd backend
npm install
cp .env.example .env      # lalu isi semua nilainya (lihat bagian 3 & 4)
npm run dev                # jalan di http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev                # jalan di http://localhost:5173
```

Pastikan MongoDB sudah berjalan (lokal via `mongod`, atau pakai MongoDB Atlas
dan isi `MONGO_URI` dengan connection string Atlas).

---

## 3. Cara Membuat Kredensial OAuth

### A. Google OAuth
1. Buka **https://console.cloud.google.com/** → buat project baru.
2. Menu **APIs & Services → OAuth consent screen** → isi nama app, email, dsb → simpan.
3. Menu **Credentials → Create Credentials → OAuth client ID**.
4. Pilih tipe **Web application**.
5. Di **Authorized JavaScript origins**, tambahkan `http://localhost:5173` (dan domain produksi nanti).
6. Klik Create → salin **Client ID** ke `GOOGLE_CLIENT_ID` (backend & frontend) dan **Client Secret** ke `GOOGLE_CLIENT_SECRET`.

### B. Facebook Login
1. Buka **https://developers.facebook.com/apps** → **Create App** → pilih tipe "Consumer".
2. Di dashboard app, tambahkan produk **Facebook Login** → pilih **Web**.
3. Isi **Site URL**: `http://localhost:5173`.
4. Di **Settings → Basic**, salin **App ID** → `FACEBOOK_APP_ID`, dan **App Secret** → `FACEBOOK_APP_SECRET`.
5. Di **Facebook Login → Settings**, tambahkan `http://localhost:5173/` ke **Valid OAuth Redirect URIs**.
6. Selama masih Development Mode, tambahkan akun tester di **Roles → Test Users**.

### C. Apple Sign In
1. Buka **https://developer.apple.com/account/resources/identifiers/list** (butuh Apple Developer Program, berbayar).
2. Buat **App ID** dengan capability **Sign In with Apple** diaktifkan → ini jadi `APPLE_CLIENT_ID` (format `com.namaperusahaan.app`, disebut juga Bundle Identifier).
3. Buat **Services ID** terpisah (untuk web) → aktifkan Sign In with Apple → set:
   - **Domain**: domain frontend Anda
   - **Return URL**: `https://domainanda.com/auth/apple/callback` → ini `APPLE_REDIRECT_URI`
4. Di menu **Keys**, buat key baru dengan capability **Sign In with Apple** → unduh file `.p8` (hanya bisa diunduh sekali!). Ini isi `APPLE_PRIVATE_KEY`.
5. Catat **Key ID** (`APPLE_KEY_ID`) dan **Team ID** (`APPLE_TEAM_ID`, terlihat di pojok kanan atas halaman developer account).

---

## 4. Contoh File `.env`

### backend/.env
```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb://127.0.0.1:27017/auth_system
JWT_ACCESS_SECRET=string_acak_panjang
JWT_REFRESH_SECRET=string_acak_panjang_lain
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=30d
TOKEN_ENCRYPTION_KEY=string_acak_32_karakter
GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxx
FACEBOOK_APP_ID=xxxx
FACEBOOK_APP_SECRET=xxxx
APPLE_CLIENT_ID=com.yourcompany.yourapp
APPLE_TEAM_ID=XXXXXXXXXX
APPLE_KEY_ID=XXXXXXXXXX
APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
```

### frontend/.env
```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
VITE_FACEBOOK_APP_ID=xxxx
VITE_APPLE_CLIENT_ID=com.yourcompany.yourapp
VITE_APPLE_REDIRECT_URI=https://yourdomain.com/auth/apple/callback
```

Gunakan `openssl rand -base64 32` untuk membuat string acak yang aman.

---

## 5. Alur Kerja Autentikasi

1. **Frontend** memuat SDK resmi Google Identity Services, Facebook SDK, dan
   Sign in with Apple JS (dimuat langsung di `index.html`).
2. Saat pengguna menekan salah satu tombol, SDK resmi menampilkan popup login
   milik provider (bukan buatan sendiri) → mengembalikan token (`idToken`,
   `accessToken`, atau `identityToken`).
3. Token tersebut dikirim ke **backend** (`POST /api/auth/google|facebook|apple`).
4. Backend **memverifikasi ulang token langsung ke server resmi provider**
   (Google Auth Library, Facebook Graph API, atau Apple public key) — token
   dari client tidak pernah dipercaya begitu saja.
5. Backend mencari user berdasarkan `provider` + `providerId`:
   - **Sudah ada** → update `lastLogin`, langsung login (tidak membuat akun baru).
   - **Belum ada** → membuat akun baru otomatis (register otomatis), username dibuat otomatis jika kosong.
6. Backend membuat **access token** (JWT umur pendek, dikirim di response body,
   disimpan di memori frontend saja — bukan localStorage) dan **refresh token**
   (JWT umur panjang, dienkripsi lalu disimpan di **cookie httpOnly + Secure +
   SameSite=Strict** — tidak bisa diakses JavaScript/XSS).
7. Saat access token kedaluwarsa, frontend otomatis memanggil
   `POST /api/auth/refresh` untuk mendapat access token baru tanpa perlu login ulang
   (mendukung Auto Login / Remember Me).
8. Logout memanggil `POST /api/auth/logout`, menghapus refresh token dari DB
   dan cookie.

---

## 6. Keamanan yang Diterapkan

- OAuth 2.0 standar resmi via SDK asli tiap provider (Google Identity
  Services, Facebook SDK, Sign in with Apple JS).
- Semua token diverifikasi ulang di backend (audience, signature, expiry) —
  mencegah token palsu/dimanipulasi.
- Access token hanya disimpan di memori JS (hilang saat reload), tidak pernah
  di localStorage/sessionStorage → mengurangi risiko pencurian via XSS.
- Refresh token disimpan sebagai **hash SHA-256** di database (bukan
  plaintext), dan sebagai **cookie httpOnly terenkripsi AES** di client.
- `helmet` untuk header keamanan, `cors` dibatasi ke origin frontend saja
  dengan `credentials: true`.
- Rate limiting pada endpoint login untuk mencegah brute-force.
- `SameSite=Strict` pada cookie sebagai proteksi CSRF.
- Validasi & sanitasi input (email, nama) sebelum disimpan ke database.
- Middleware `requireAuth` melindungi seluruh route yang butuh login;
  `requireAdmin` untuk route khusus admin.

---

## 7. Menjalankan Proyek

1. Jalankan MongoDB.
2. `cd backend && npm install && npm run dev`
3. `cd frontend && npm install && npm run dev`
4. Buka `http://localhost:5173/login`.

Setelah kredensial OAuth di `.env` diisi dengan benar, ketiga tombol
(Google, Facebook, Apple) akan langsung berfungsi.
