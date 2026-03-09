# Panduan Pengujian API BLT Mpanau menggunakan Postman

Dokumen ini berisi langkah-langkah detail untuk menguji **Flow 1** (Pembuatan Warga oleh Admin) dan **Flow 2** (Upload Data Mandiri oleh Warga) menggunakan aplikasi **Postman**.

---

## Persiapan Awal
1. Pastikan server lokal sudah menyala (`npm run dev`).
2. Server biasanya berjalan di `http://localhost:8000` (tergantung konfigurasi `.env`-mu).
3. Buka aplikasi **Postman**.

---

## 1. Uji Coba Login Admin (Mendapatkan Token)

Sebelum membuat akun warga, kamu harus login sebagai **Admin** untuk mendapatkan akses (Token).

1. Buat **Request Baru** di Postman (`Ctrl + N` / `Cmd + N`).
2. Ubah metode HTTP dari `GET` menjadi **`POST`**.
3. Masukkan URL: `http://localhost:8000/api/auth/login`
4. Pilih tab **Body** $\rightarrow$ **raw** $\rightarrow$ Ubah tipe *Text* menjadi **JSON**.
5. Masukkan data login Admin (Asumsi: berdasarkan _seed_ yang sudah ditambahkan ke database):
   ```json
   {
       "username": "admin001",
       "password": "12345"
   }
   ```
6. Klik **Send**.
7. Di bagian bawah (*Response*), kamu akan mendapatkan `token`. **Salin (Copy) seluruh string token tersebut** tanpa tanda kutip.

---

## 2. Uji Coba Admin Generate Warga (Flow 1)

Setelah punya token Admin, sekarang saatnya Admin membuatkan satu slot untuk Warga.

1. Buat **Request Baru**.
2. Ubah metode HTTP menjadi **`POST`**.
3. Masukkan URL: `http://localhost:8000/api/warga/generate`
4. Pilih tab **Authorization** $\rightarrow$ Ubah *Type* menjadi **Bearer Token**.
5. **Paste (Tempel)** token sakti yang kamu salin di Langkah 1 ke dalam kolom Token.
6. Pilih tab **Body** $\rightarrow$ **raw** $\rightarrow$ **JSON**.
7. Masukkan NIK dan Nama Warga:
   ```json
   {
       "nik": "7201234567890001",
       "nama": "Bapak Sutrisno"
   }
   ```
8. Klik **Send**.
9. Sistem akan membalas dengan status *success* dan memberikan `password_token`. **Simpan (salin) `password_token` ini beserta `username` (yang sama dengan NIK tadi)**. Kredensial ini akan digunakan Warga untuk Login.

---

## 3. Uji Coba Login Warga

Sekarang, kita bertindak seolah-olah sebagai Warga yang baru saja menerima Username (NIK) dan Token (Password) dari Pak RT/Admin.

1. Buka kembali Request Login (atau buat baru, **`POST`** `http://localhost:8000/api/auth/login`).
2. Pilih tab **Body** $\rightarrow$ **raw** $\rightarrow$ **JSON**.
3. Masukkan NIK dan Password yang kamu dapat di Langkah 2:
   ```json
   {
       "username": "7201234567890001",
       "password": "TOKEN_PASSWORD_DARI_ADMIN"
   }
   ```
4. Klik **Send**.
5. Kamu akan mendapatkan `token` JWT baru. Ini adalah **Token Warga**. **Salin (Copy) token ini**, karena kita akan memakainya untuk tahapan *"Upload Form"*.

---

## 4. Uji Coba Warga Upload Form & Foto (Flow 2)

Ini adalah bagian paling krusial: mengirim **Teks** sekaligus **Foto** menggunakan form-data.

1. Buat **Request Baru**.
2. Ubah metode HTTP menjadi **`PUT`**. *(Karena kita mengupdate data yang sudah digenerate sebelumnya)*.
3. Masukkan URL: `http://localhost:8000/api/warga/uploadForm`
4. Pilih tab **Authorization** $\rightarrow$ Ubah *Type* menjadi **Bearer Token**.
5. **Paste (Tempel)** token Warga yang kamu dapat dari Langkah 3.
6. Pilih tab **Body**.
7. **PENTING:** Kali ini, JANGAN pilih `raw`. Tapi pilih **`form-data`**.
8. Isikan tabel *Key - Value* persis seperti di bawah ini:

| Key (Nama Field) | Tipe (Pilih di panah kecil kanan Key) | Value |
| :--- | :--- | :--- |
| **`address`** | `Text` | "Jalan Mawar No. 12, RT 01/RW 02, Desa Mpanau" |
| **`fotoKtp`** | UBAH KE **`File`** | *(Klik 'Select Files' dan pilih Foto KTP dari Laptopmu)* |
| **`fotoKk`** | UBAH KE **`File`** | *(Pilih Foto KK)* |
| **`fotoRumah`** | UBAH KE **`File`** | *(Pilih Foto Rumah)* |
| **`fotoDapur`** | UBAH KE **`File`** | *(Pilih Foto Dapur)* |

> **Catatan:** Cara mengubah Tipe Teks ke File: Arahkan kursor mouse ke ujung sebelah kanan dari kolom teks "Key" (contoh di atas `fotoKtp`), nanti akan muncul menu drop-down samar berisi: `Text | File`. Pilih `File`. Nanti di kolom Value akan muncul tombol "Select Files".

9. Pastikan semua file foto (`.jpg`, `.png`, dsb) diisi. (Kamu bisa mengirim gambar apa saja untuk tes).
10. Klik **Send**!

🎉 **SELESAI!** 
Jika struktur datamu benar, kamu akan menerima pesan balasan bertuliskan `"Data warga berhasil diperbarui"`. Untuk memastikan, kamu bisa membuka folder _directory_ kodemu, masuk ke folder `uploads/warga/`, dan kamu akan melihat foto-fotomu masuk dengan rapi ke dalam foldernya masing-masing.
