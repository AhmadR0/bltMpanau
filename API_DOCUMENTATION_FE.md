
## 🏗️ Konsep Dasar yang Harus Dipahami

1. **Base URL**: Semua API di bawah ini berawalan `http://localhost:8000` (atau sesuai server deploy nanti).
2. **Token (JWT)**: Hampir semua API butuh "Kunci Akses" (Token). Token ini didapat saat kamu hit API Login.
3. **Cara Kirim Token**: Kalau API bilang **"Butuh Token: Ya"**, kamu **wajib** mengirimkan header ini di Axios/Fetch:
   ```javascript
   headers: {
     Authorization: "Bearer <ISI_TOKEN_YANG_DIDAPAT_DARI_LOGIN>"
   }
   ```
4. **Respon Sukses & Error**: 
   - Status `200` atau `201`: Sukses! ✅
   - Status `400`: Datamu kurang/salah ketik. Cek lagi body requestnya. ❌
   - Status `401`/`403`: Tokenmu kedaluwarsa (harus login lagi) atau kamu tidak punya akses (bukan Admin). ❌

---

## 🔐 1. API Autentikasi (Login & Cek User)

### 1.1. Login (Mendapatkan Token)
- **Endpoint:** `POST /api/auth/login`
- **Fungsi:** Untuk masuk ke sistem dan mendapatkan Token. Admin pakai NIK & Password awal, Warga pakai NIK & Token unik dari Admin.
- **Butuh Token?** Tidak ❌
- **Request Body (JSON):**
  ```json
  {
    "username": "1234567890123456",
    "password": "A1B2C3D4"
  }
  ```
- **Response Sukses (200 OK):**
  ```json
  {
    "message": "Login successful",
    "data": {
      "token": "eyJhb....", // -> SIMPAN INI DI LOCALSTORAGE!
      "user": {
        "id": 1,
        "username": "1234567890123456",
        "role": "USER" // Atau "ADMIN"
      }
    }
  }
  ```

### 1.2. Cek Profil / Data Diri Login Saat Ini
- **Endpoint:** `GET /api/auth/me`
- **Fungsi:** Untuk mengambil data profil siapa yang sedang login saat ini berdasarkan Token yang dikirim.
- **Butuh Token?** Ya ✅

### 1.3. Logout
- **Endpoint:** `POST /api/auth/logout`
- **Fungsi:** Keluar dari sistem. Backend hanya akan membalas pesan sukses. Kamu **wajib menghapus token** dari `localStorage` di Frontend secara manual.
- **Butuh Token?** Ya ✅

---

## 🏢 2. API Warga (Digunakan oleh Admin & Warga)

### 2.1. Generate Warga Baru (KHUSUS ADMIN)
- **Endpoint:** `POST /api/warga/generate`
- **Fungsi:** Mendaftarkan Warga baru ke sistem. Backend akan otomatis membuatkan password (token unik 8 huruf) yang akan diberikan ke Warga untuk login.
- **Butuh Token?** Ya ✅
- **Request Body (JSON):**
  ```json
  {
    "nik": "7201010000000001",
    "nama": "Pak Budi"
  }
  ```
- **Response Sukses (201 Created):**
  ```json
  {
    "message": "Warga and User generated successfully",
    "data": {
      "nik": "7201010000000001",
      "nama": "Pak Budi",
      "username": "7201010000000001",
      "password_token": "X9Y8Z7A6" // -> Tampilkan ini di UI Admin agar dicatat
    }
  }
  ```

### 2.2. Ambil Semua Data Warga (KHUSUS ADMIN)
- **Endpoint:** `GET /api/warga`
- **Fungsi:** Menampilkan seluruh daftar Warga yang ada di sistem (baik yang sudah diverifikasi maupun belum).
- **Butuh Token?** Ya ✅

### 2.3. Warga Mengisi / Mengupdate Data Mandiri (KHUSUS WARGA / FLOW 2)
Ini sangat penting! Karena ada pengiriman file (foto), **TIDAK** bisa pakai JSON biasa. Harus pakai tipe form `multipart/form-data`.
- **Endpoint:** `PUT /api/warga/update-data`
- **Fungsi:** Warga Melengkapi alamat dan upload foto-foto (KTP, KK, Rumah, Dapur). Warga akan otomatis terdeteksi dari Token mereka.
- **Butuh Token?** Ya ✅
- **Request Body (FormData):**
  - Kunci/Fieldnya:
    - `address`: String (Teks alamat lengkap)
    - `fotoKtp`: File gambar (.jpg / .png)
    - `fotoKk`: File gambar
    - `fotoRumah`: File gambar
    - `fotoDapur`: File gambar
- **Contoh Script di Frontend (Buat Junior FE):**
  ```javascript
  // 1. Ambil file dari input HTML (Misalnya dari React State / input file)
  const fileKTP = document.getElementById('input-ktp').files[0];
  
  // 2. Buat objek FormData
  const formData = new FormData();
  formData.append("address", "Jl. Mawar No 10, RT 01 RW 02");
  if (fileKTP) formData.append("fotoKtp", fileKTP); // Kalau ada file, masukkan
  // ... (tambahkan fotoKk, fotoRumah, dll dengan cara yang sama)
  
  // 3. Kirim via Axios/Fetch
  axios.put("http://localhost:8000/api/warga/update-data", formData, {
    headers: {
      "Authorization": "Bearer <TOKEN_SI_WARGA>",
      "Content-Type": "multipart/form-data" // Wajib ada ini kalau kirim file!
    }
  }).then(res => console.log(res.data));
  ```

---

## 🛠️ 3. API Verifikasi & Management (Belum Tersedia/Masih Mock)
*Catatan: 3 API di bawah ini (Get Detail, Verifikasi, Delete) rutenya sudah disiapkan di backend, tetapi isinya masih sementara/kosongan. Segera dikerjakan oleh Tim BE.*

### 3.1. Ambil Detail 1 Warga
- **Endpoint:** `GET /api/warga/:id`
- **Fungsi:** Melihat detail seluruh isian warga (termasuk path foto dan status BLT). `:id` adalah id table warga.
- **Butuh Token?** Ya ✅

### 3.2. Admin Ubah Status Warga (Verifikasi / FLOW 3)
- **Endpoint:** `PATCH /api/warga/verify/:id`
- **Fungsi:** Admin mengesahkan atau menolak calon penerima BLT dan mengisi nominal BLT jika disetujui.
- **Butuh Token?** Ya ✅
- **Saran Request Body (Akan Diimplementasi Nanti):**
  ```json
  {
    "status": "Disetujui",
    "nominalBlt": 500000
  }
  ```

### 3.3. Hapus Warga
- **Endpoint:** `DELETE /api/warga/:id`
- **Butuh Token?** Ya ✅

---

### 💡 Extra Tips untuk Junior Frontend
- **Cors / Error Network:** Jika kamu mengalami error *Network Error* atau *CORS Error*, cek apakah terminal Backend sudah jalan (`pnpm run dev`).
- **401 Unauthorized terus:** Jangan lupa kata `Bearer ` di depan token, ada spasi di antaranya! (Contoh: `"Bearer eyJhbGc..."`).
- **Simpan Token Aman:** Sangat disarankan untuk menyimpan token di state global (seperti Redux, Zustand, atau Context API) lalu di-set di `localStorage` saat User refresh halaman web.
