# 🚀 Panduan Memulai (Backend BLT Mpanau) - Khusus FE Team

Halo Rekan Frontend (Junior & Intern)! Selamat bergabung di project **BLT Mpanau**. Dokumen ini dibuat khusus untuk membantu kalian menjalankan backend ini di laptop masing-masing dan mulai "ngobrol" dengan API-nya.

---

## 1. Persiapan Alat (Prerequisites)
Sebelum mulai, pastikan sudah install:
- **Node.js**: Versi 18 ke atas.
- **pnpm**: Pengganti npm yang lebih cepat (`npm install -g pnpm`).
- **MySQL/MariaDB**: Database untuk menyimpan data.

---

## 2. Cara Menjalankan di Lokal (Setup)

### Langkah 1: Install Library
Buka terminal di folder project ini, lalu jalankan:
```bash
pnpm install
```

### Langkah 2: Setup Environment (`.env`)
Buat file baru bernama `.env` di folder utama (copy dari `.env.example` jika ada, atau buat manual) dan isi seperti ini:
```env
DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/bltMpanau"
PORT=8000
JWT_SECRET="bebas-diisi-apa-saja-rahasia"
```
*Ganti `USER` dan `PASSWORD` sesuai database MySQL kamu.*

### Langkah 3: Setup Database
Jalankan dua perintah ini agar tabel-tabelnya muncul di MySQL kamu dan ada data Admin bawaan:
```bash
npx prisma db push
npx prisma db seed
```

### Langkah 4: Jalankan Server
```bash
pnpm run dev
```
Sekarang backend kamu jalan di: `http://localhost:8000`

---

## 3. Cara Menggunakan API (Authentication & JWT)

Hampir semua API di sini diproteksi. Bayangkan kamu sedang masuk ke gedung:
1. **Login** (`POST /api/auth/login`): Ini seperti kamu lapor resepsionis (kirim username & pass). Resepsionis akan kasih kamu **Kartu Izin** (Token JWT).
2. **Pakai Token**: Setiap mau masuk ke ruangan (panggil API lain), kamu harus tunjukkan kartu itu di **Header** request kamu.

**Caranya di Frontend:**
Di header request (Axios/Fetch), tambahkan:
`Authorization: Bearer <ISI_TOKEN_KAMU>`

---

## 4. Daftar Alamat API (Endpoint Reference)

### 🧱 Autentikasi (`/api/auth`)
| Method | Endpoint | Fungsi | Butuh Token? |
| :--- | :--- | :--- | :--- |
| POST | `/login` | Masuk ke sistem | Tidak |
| POST | `/logout` | Keluar sistem | Tidak |
| GET | `/me` | Cek data diri user yang sedang login | **Ya** |

### 👥 Manajemen Warga (`/api/warga`)
| Method | Endpoint | Fungsi | Butuh Token? |
| :--- | :--- | :--- | :--- |
| POST | `/generate` | Buat User & Warga baru (Admin only) | **Ya** |
| GET | `/` | Ambil semua daftar warga | **Ya** |

---

## 5. Kamus Error (HTTP Status Code)
Kalau kamu dapat error dari backend, perhatikan angkanya:
- **400 (Bad Request)**: Data yang kamu kirim kurang atau salah (misal: NIK lupa diisi).
- **401 (Unauthorized)**: Kamu belum login atau lupa kirim Token.
- **403 (Forbidden)**: Token kamu salah, sudah expired (lewat 30 menit), atau kamu bukan Admin.
- **404 (Not Found)**: Jalan (endpoint) yang kamu tuju tidak ada.
- **500 (Internal Server Error)**: Ada kesalahan di sisi kodingan backend (Hubungi tim BE!).

---

## 6. Tips Uji Coba API
Kalian bisa pakai alat bantu seperti:
- **Postman** (Paling populer).
- **Thunder Client** (Extension di VS Code, sangat disarankan).

**Tips Postman:**
1. Hit login dulu.
2. Copy token dari hasil JSON response.
3. Di request selanjutnya, buka tab **Authorization** -> Pilih **Bearer Token** -> Masukkan token tadi.

---

Semangat kodingnya! Kalau bingung, jangan sungkan tanya ya. Kita semua di sini belajar bareng. 🥂🚀
