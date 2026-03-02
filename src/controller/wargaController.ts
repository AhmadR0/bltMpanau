import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { prisma } from "../config/prisma.js";

/**
 * FLOW 1: Admin Generate Warga
 */
export const generateWarga = async (req: Request, res: Response) => {
    try {
        const { nik, nama } = req.body;

        if (!nik || !nama) {
            return res.status(400).json({ message: "NIK and Nama Warga are required" });
        }

        const existingWarga = await prisma.warga.findUnique({
            where: { nik },
        });

        if (existingWarga) {
            return res.status(400).json({ message: "NIK already registered" });
        }

        const plainToken = crypto.randomBytes(4).toString("hex").toUpperCase();
        const hashedPassword = await bcrypt.hash(plainToken, 10);

        const result = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    username: nik,
                    password: hashedPassword,
                    role: "USER",
                },
            });

            const warga = await tx.warga.create({
                data: {
                    nik,
                    nama,
                    userId: user.id,
                },
            });

            return { user, warga };
        });

        return res.status(201).json({
            message: "Warga and User generated successfully",
            data: {
                nik: result.warga.nik,
                nama: result.warga.nama,
                username: result.user.username,
                password_token: plainToken,
            },
        });
    } catch (error) {
        console.error("Generate Warga error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getAllWarga = async (req: Request, res: Response) => {
    try {
        const warga = await prisma.warga.findMany({
            include: {
                user: {
                    select: {
                        username: true,
                        role: true,
                    },
                },
            },
        });
        return res.json({ data: warga });
    } catch (error) {
        console.error("Get all warga error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

/**
 * FLOW 2: Warga Mengisi Data Mandiri (Boilerplate)
 * Deskripsi: Warga yang sudah login melengkapi data profil & upload foto.
 */
export const updateDataMandiri = async (req: any, res: Response) => {
    try {
        // TODO: Ambil userId dari req.user.id (JWT)
        // TODO: Handle upload file dari req.files (Multer)
        // TODO: Update tabel Warga berdasarkan userId sesuai gambar form
        return res.json({ message: "Boilerplate: Fungsi update data mandiri siap diisi" });
    } catch (error) {
        console.error("Update mandiri error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

/**
 * FLOW 3: Admin Verifikasi & Management (Boilerplate)
 */

// Menampilkan detail warga lengkap
export const getWargaDetail = async (req: Request, res: Response) => {
    try {
        // TODO: Ambil ID dari params
        // TODO: Query Prisma include User & Warga
        return res.json({ message: "Boilerplate: Fungsi get detail siap diisi" });
    } catch (error) {
        console.error("Get detail error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Admin Mengubah Status & Input Nominal BLT
export const adminVerifyWarga = async (req: Request, res: Response) => {
    try {
        // TODO: Ambil ID dari params & status/nominal dari body
        // TODO: Update field 'status' & 'nominalBlt' di tabel Warga
        return res.json({ message: "Boilerplate: Fungsi verifikasi Admin siap diisi" });
    } catch (error) {
        console.error("Verify error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Hapus Warga & User (Cascade)
export const deleteWarga = async (req: Request, res: Response) => {
    try {
        // TODO: Transaction hapus Warga & User terkait
        return res.json({ message: "Boilerplate: Fungsi delete siap diisi" });
    } catch (error) {
        console.error("Delete error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
