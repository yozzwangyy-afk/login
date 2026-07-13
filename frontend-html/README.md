# Frontend — HTML / CSS / JavaScript Murni (Vanilla)

Versi ini **tidak butuh Node.js, npm, React, atau build tool apa pun**.
Cukup HTML, CSS, dan JavaScript biasa. Backend yang dipakai tetap sama
(folder `backend/` di proyek ini).

## Struktur

```
frontend-html/
├── index.html          # Halaman Login
├── dashboard.html       # Halaman terproteksi (contoh setelah login)
└── assets/
    ├── css/style.css    # Semua styling: glass card, dark/light mode, animasi
    └── js/
        ├── config.js       # Isi API_URL & kredensial provider di sini
        ├── api.js          # fetch wrapper + auto refresh token
        ├── ui-helpers.js   # toast, error dialog, theme toggle
        ├── auth.js         # logic tombol Google/Facebook/Apple
        └── dashboard.js    # route guard + tampilkan profil + logout
```

## Cara Menjalankan

Karena browser modern memblokir cookie & `fetch` credentials pada halaman
yang dibuka langsung lewat `file://`, halaman ini **harus dijalankan lewat
server lokal sederhana**, bukan double-click file:

```bash
cd frontend-html

# Pilih salah satu cara berikut:
npx serve -l 5173 .
# atau
python3 -m http.server 5173
```

Lalu buka **http://localhost:5173**.

## Konfigurasi

1. Buka `assets/js/config.js`, isi:
   ```js
   window.APP_CONFIG = {
     API_URL: 'http://localhost:5000/api',
     GOOGLE_CLIENT_ID: '...',
     FACEBOOK_APP_ID: '...',
     APPLE_CLIENT_ID: 'com.yourcompany.yourapp',
     APPLE_REDIRECT_URI: 'https://yourdomain.com/auth/apple/callback',
   };
   ```
2. Pastikan di `backend/.env`, `CLIENT_URL` diisi sesuai origin tempat
   `frontend-html` dijalankan (mis. `http://localhost:5173`), karena backend
   membatasi CORS hanya untuk origin ini.
3. Untuk panduan lengkap membuat kredensial Google/Facebook/Apple, lihat
   `README.md` utama di root proyek.

## Cara Kerja (sama dengan versi React)

- `index.html` memuat SDK resmi Google Identity Services, Facebook SDK, dan
  Sign in with Apple JS langsung dari CDN masing-masing provider.
- Saat tombol ditekan, SDK resmi menampilkan popup akun asli milik provider.
- Token hasil popup dikirim ke backend (`/api/auth/google|facebook|apple`),
  backend memverifikasi ulang ke server resmi tiap provider sebelum membuat
  sesi.
- Access token disimpan di variabel JavaScript (memori), bukan
  localStorage — supaya tidak mudah dicuri lewat XSS. Refresh token
  tersimpan di cookie httpOnly terenkripsi, dikelola sepenuhnya oleh backend.
- `dashboard.html` melakukan route guard: memanggil `/auth/refresh` dan
  `/auth/me` sebelum menampilkan konten; jika gagal, otomatis redirect ke
  halaman login.
