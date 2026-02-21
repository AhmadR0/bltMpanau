# Dokumentasi API Otentikasi (JWT + Prisma)

API ini berfungsi sebagai template standar untuk sistem login dan proteksi route di project kamu.

## 1. Konfigurasi
- **Prisma Singleton**: `src/config/prisma.ts` - Digunakan untuk memusatkan koneksi database.
- **Environment**: Menambahkan `JWT_SECRET` di `.env` untuk enkripsi token.

## 2. Endpoint Auth

### Login
- **URL**: `POST /api/auth/login`
- **Body**:
  ```json
  {
    "username": "admin001",
    "password": "hashed_password_here"
  }
  ```
- **Fungsi**: Mencari user di database, memvalidasi password (bcrypt), dan mengembalikan token JWT yang berlaku selama 1 hari.

### Me (Profil User)
- **URL**: `GET /api/auth/me`
- **Header**: `Authorization: Bearer <token>`
- **Fungsi**: Mengambil data user yang sedang login berdasarkan token yang dikirimkan. Ini diproteksi oleh middleware.

## 3. Komponen Keamanan
- **Bcrypt**: Digunakan untuk membandingkan password yang dikirim dengan hash di database.
- **JWT Middleware**: `src/utils/authMiddleware.ts` - Fungsi `authenticateJWT` mengecek Validitas token di setiap request yang diproteksi. Jika token tidak valid atau tidak ada, maka request akan ditolak (401/403).

## 4. Cara Penggunaan di Route Lain
Jika kamu membuat fitur baru (misal: Produk) dan ingin memproteksinya, cukup tambahkan middleware di routernya:

```typescript
// src/routes/productRoutes.ts
import { authenticateJWT } from "../utils/authMiddleware.js";

router.get("/products", authenticateJWT, controller.getProducts);
```

Dengan cara ini, hanya user yang sudah login (punya token valid) yang bisa mengakses API tersebut.
