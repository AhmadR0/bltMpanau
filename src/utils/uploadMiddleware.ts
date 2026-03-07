import multer from "multer";
import path from "path";
import fs from "fs";

// 1. Tentukan folder penyimpanan utama
const baseUploadDir = "uploads/warga";

// 2. Konfigurasi Storage (Tempat Simpan & Nama File)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // file.fieldname akan berisi nama input (contoh: "fotoKtp", "fotoKk")
        // Kita gabungkan base path dengan nama field untuk membuat subfolder
        const dynamicDir = path.join(baseUploadDir, file.fieldname);

        // Pastikan subfolder spesifik tersebut ada, jika tidak ada maka buat otomatis
        if (!fs.existsSync(dynamicDir)) {
            fs.mkdirSync(dynamicDir, { recursive: true });
        }

        cb(null, dynamicDir);
    },
    filename: (req, file, cb) => {
        // Nama file: timestamp-namafile.ekstensi
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
    },
});

// 3. Filter File (Hanya gambar yang boleh diupload)
const fileFilter = (req: any, file: any, cb: any) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("Hanya file gambar yang diperbolehkan!"), false);
    }
};

// 4. Inisialisasi Multer
export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 }, // Maksimal 2MB per file
});

import type { RequestHandler } from "express";

// Helper untuk Handle Multiple Fields (Nama input di form)
export const uploadWargaFiles: RequestHandler = upload.fields([
    { name: "fotoKtp", maxCount: 1 },
    { name: "fotoKk", maxCount: 1 },
    { name: "fotoRumah", maxCount: 1 },
    { name: "fotoDapur", maxCount: 1 },
]) as any;
