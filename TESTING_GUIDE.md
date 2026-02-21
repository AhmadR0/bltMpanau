# Panduan Pengujian API (Login & JWT)

Kamu bisa menggunakan **Postman**, **Insomnia**, atau perintah **cURL** di terminal untuk menguji API ini.

## 1. Persiapan Data (Seed)
Pastikan kamu sudah menjalankan seed agar akun admin tersedia di database:
```bash
npx prisma db seed
```
**Kredensial Default (berdasarkan seed.ts):**
- **Username**: `admin001`
- **Password**: `12345` (berdasarkan `seed.ts`)

---

## 2. Skenario Pengujian

### A. Login untuk Mendapatkan Token
Kita harus login dulu untuk mendapatkan "kunci" (JWT) agar bisa mengakses API yang diproteksi.

**Perintah cURL:**
```bash
curl -X POST http://localhost:8000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username": "admin001", "password": "12345"}'
```

**Hasil yang diharapkan (Simpan `token`-nya!):**
```json
{
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": { "id": 1, "username": "admin001", "role": "ADMIN" }
  }
}
```

---

### B. Mengakses Profile (API Terproteksi)
Gunakan token yang kamu dapatkan dari langkah sebelumnya untuk mengakses endpoint `/me`.

**Perintah cURL:**
*(Ganti `<TOKEN_KAMU>` dengan token asli)*
```bash
curl -X GET http://localhost:8000/api/auth/me \
     -H "Authorization: Bearer <TOKEN_KAMU>"
```

**Hasil yang diharapkan:**
```json
{
  "data": {
    "id": 1,
    "username": "admin001",
    "role": "ADMIN",
    "createdAt": "2024-..."
  }
}
```

---

### C. Logout
Gunakan token yang kamu dapatkan untuk melakukan logout.

**Perintah cURL:**
```bash
curl -X POST http://localhost:8000/api/auth/logout \
     -H "Content-Type: application/json"
```

**Hasil yang diharapkan:**
```json
{
  "message": "Logout successful. Please delete your token on the client side."
}
```

---

### D. Uji Coba Error (Keamanan)
Coba akses endpoint `/me` **tanpa token** atau dengan **token salah**.

**Perintah cURL:**
```bash
curl -X GET http://localhost:8000/api/auth/me
```

**Hasil yang diharapkan:**
```json
{ "message": "Unauthorized: No token provided" }
```

---

## 3. Fitur Generate Warga & User (Admin Only)

Fitur ini digunakan oleh Admin untuk mendaftarkan warga baru. Sistem akan otomatis membuatkan akun User dengan NIK sebagai username dan token unik sebagai password.

### A. Generate Warga
**Perintah cURL:**
*(Ganti `<TOKEN_ADMIN>` dengan token yang didapat saat login admin)*
```bash
curl -X POST http://localhost:8000/api/warga/generate \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer <TOKEN_ADMIN>" \
     -d '{
       "nik": "1234567890123456",
       "nama": "Budi Santoso"
     }'
```

**Hasil yang diharapkan:**
```json
{
  "message": "Warga and User generated successfully",
  "data": {
    "nik": "1234567890123456",
    "nama": "Budi Santoso",
    "username": "1234567890123456",
    "password_token": "A1B2C3D4"
  }
}
```
*Token `A1B2C3D4` inilah yang diberikan kepada warga untuk login.*

---

### B. List Semua Warga
**Perintah cURL:**
```bash
curl -X GET http://localhost:8000/api/warga \
     -H "Authorization: Bearer <TOKEN_ADMIN>"
```

---

## 4. Tips Pengujian di Postman
1.  Buat request baru (POST).
2.  Input URL: `http://localhost:8000/api/auth/login`.
3.  Pilih tab **Body** -> **raw** -> **JSON**.
4.  Masukkan JSON username & password.
5.  Setelah dapat token, buat request baru (GET) ke `/api/auth/me`.
6.  Pilih tab **Auth** -> **Bearer Token** -> Tempel token di sana.
7.  Klik **Send**.

Selamat mencoba! 🚀
