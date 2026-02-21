import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { prisma } from "../config/prisma.js";

export const generateWarga = async (req: Request, res: Response) => {
    try {
        const { nik, nama } = req.body;

        if (!nik || !nama) {
            return res.status(400).json({ message: "NIK and Nama Warga are required" });
        }

        // 1. Cek apakah NIK sudah terdaftar
        const existingWarga = await prisma.warga.findUnique({
            where: { nik },
        });

        if (existingWarga) {
            return res.status(400).json({ message: "NIK already registered" });
        }

        // 2. Generate token unik (8 karakter) sebagai password
        const plainToken = crypto.randomBytes(4).toString("hex").toUpperCase(); // misal: A1B2C3D4
        const hashedPassword = await bcrypt.hash(plainToken, 10);

        // 3. Simpan ke Database (Transaction)
        const result = await prisma.$transaction(async (tx) => {
            // Buat User dahulu
            const user = await tx.user.create({
                data: {
                    username: nik,
                    password: hashedPassword,
                    role: "USER",
                },
            });

            // Buat Data Warga yang terhubung ke User
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
                password_token: plainToken, // Berikan token asli ke Admin
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
