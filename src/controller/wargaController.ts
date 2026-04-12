import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { prisma } from "../config/prisma.js";
import PDFDocument from "pdfkit-table";


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
            where: {
                isDeleted: false
            },
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

export const updateDataMandiri = async (req: Request, res: Response) => {
    try {

        const userId = (req as any).user.id;

        const {
            address,
            noHp
        } = req.body;

        const files = req.files as { [key: string]: Express.Multer.File[] } | undefined;

        const dataToUpdate: any = {};

        if (address) {
            dataToUpdate.address = address;
        }

        if (noHp) {
            dataToUpdate.noHp = noHp;
        }

        if (files) {
            if (files["fotoKtp"]?.[0]) dataToUpdate.fotoKtp = (files["fotoKtp"][0] as Express.Multer.File).path;
            if (files["fotoKk"]?.[0]) dataToUpdate.fotoKk = (files["fotoKk"][0] as Express.Multer.File).path;
            if (files["fotoRumah"]?.[0]) dataToUpdate.fotoRumah = (files["fotoRumah"][0] as Express.Multer.File).path;
            if (files["fotoDapur"]?.[0]) dataToUpdate.fotoDapur = (files["fotoDapur"][0] as Express.Multer.File).path;
        }


        dataToUpdate.status = "Menunggu";

        const updatedWarga = await prisma.warga.update({
            where: { userId: userId },
            data: dataToUpdate,
        });

        return res.json({
            success: true,
            message: "Data warga berhasil diperbarui, status kembali menjadi Menunggu.",
            data: updatedWarga
        });
    } catch (error) {
        console.error("Update mandiri error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getWargaByid = async (req: Request, res: Response) => {
    try {
        const SelectId = Number(req.params.id)
        if (isNaN(SelectId)) {
            return res.status(400).json({ message: "Format ID tidak valid" });
        }
        const detailWarga = await prisma.warga.findFirst({
            where: {
                userId: SelectId,
                isDeleted: false
            },
            include: {
                user: {
                    select: {
                        username: true,
                        role: true
                    }
                },
                notes: {
                    orderBy: {
                        createdAt: 'desc'
                    }
                }
            }
        });
        if (!detailWarga) {
            return res.status(404).json({ message: "Data warga tidak ditemukan!" });
        }

        return res.json({
            message: "Berhasil mengambil detail warga",
            data: detailWarga
        });
    } catch (error) {
        console.error("Get detail error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }

}

/**
 * FLOW 3: Admin Verifikasi & Management
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

export const adminVerifyWarga = async (req: Request, res: Response) => {
    try {
        const wargaId = Number(req.params.id);
        const { status, catatan } = req.body;

        if (isNaN(wargaId)) {
            return res.status(400).json({ message: "Format ID tidak valid" });
        }

        if (!status) {
            return res.status(400).json({ message: "Status persetujuan wajib diisi (Disetujui/Ditolak)" });
        }

        const existingWarga = await prisma.warga.findUnique({ where: { id: wargaId } });
        if (!existingWarga) {
            return res.status(404).json({ message: "Data warga tidak ditemukan" });
        }

        if (status === "Ditolak") {
            if (!catatan || catatan.trim() === "") {
                return res.status(400).json({ message: "Catatan wajib diisi jika permohonan ditolak" });
            }

            const result = await prisma.$transaction(async (tx) => {
                const updatedWarga = await tx.warga.update({
                    where: { id: wargaId },
                    data: { status: "Ditolak" }
                });

                const newNote = await tx.rejectedNote.create({
                    data: {
                        wargaId: wargaId,
                        catatan: catatan
                    }
                });

                return { updatedWarga, newNote };
            });

            return res.json({
                message: "Data warga berhasil ditolak",
                data: result
            });
        }

        else if (status === "Disetujui") {
            const updatedWarga = await prisma.warga.update({
                where: { id: wargaId },
                data: {
                    status: "Disetujui"
                }
            });

            return res.json({
                message: "Data warga berhasil disetujui",
                data: updatedWarga
            });
        }

        else {
            return res.status(400).json({ message: "Status tidak dikenali. Gunakan 'Disetujui' atau 'Ditolak'." });
        }

    } catch (error) {
        console.error("Verify error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const deleteWarga = async (req: Request, res: Response) => {
    try {
        const wargaId = Number(req.params.id);

        if (isNaN(wargaId)) {
            return res.status(400).json({ message: "Format ID tidak valid" });
        }

        const existingWarga = await prisma.warga.findUnique({ where: { id: wargaId } });
        if (!existingWarga) {
            return res.status(404).json({ message: "Data warga tidak ditemukan" });
        }

        await prisma.warga.update({
            where: { id: wargaId },
            data: { isDeleted: true }
        });

        return res.json({
            success: true,
            message: "Data warga berhasil dihapus (disembunyikan)"
        });
    } catch (error) {
        console.error("Delete error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const restoreWarga = async (req: Request, res: Response) => {
    try {
        const wargaId = Number(req.params.id);

        if (isNaN(wargaId)) {
            return res.status(400).json({ message: "Format ID tidak valid" });
        }

        const existingWarga = await prisma.warga.findUnique({ where: { id: wargaId } });
        if (!existingWarga) {
            return res.status(404).json({ message: "Data warga tidak ditemukan" });
        }

        if (existingWarga.isDeleted === false) {
            return res.status(400).json({ message: "Data warga ini memang tidak dalam keadaan terhapus" });
        }

        await prisma.warga.update({
            where: { id: wargaId },
            data: { isDeleted: false }
        });

        return res.json({
            success: true,
            message: "Data warga berhasil dipulihkan (Restore)"
        });
    } catch (error) {
        console.error("Restore error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const exportWargaPdf = async (req: Request, res: Response) => {
    try {
        
        const allWarga = await prisma.warga.findMany({
            where: { isDeleted: false, status: 'Disetujui' },
            include: { user: { select: { username: true } } }
        });

        
        const doc = new PDFDocument({ margin: 30, size: 'A4' });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=Laporan_Data_Warga.pdf');

        doc.pipe(res);

        // --- MULAI KOP SURAT ---
        // Jika kamu punya gambar logo siri, letakkan di folder 'public' dengan nama 'logo-sigi.png'
        const logoPath = path.resolve('public', 'logo-sigi.png');
        if (fs.existsSync(logoPath)) {
            // Posisi (x: 40, y: 30), width sedikit dikecilkan agar tak bocor ke garis
            doc.image(logoPath, 40, 30, { width: 50 });
        }

        // Kop Pemerintah (Di-center tapi agak ke bawah jika ada logo)
        doc.font('Helvetica-Bold').fontSize(16).text('PEMERINTAH KABUPATEN SIGI', { align: 'center' });
        doc.font('Helvetica-Bold').fontSize(14).text('KECAMATAN SIGI BIROMARU', { align: 'center' });
        doc.font('Helvetica-Bold').fontSize(14).text('DESA MPANAU', { align: 'center' });
        
        // Garis batas (Line under header)
        // Kita beri jarak agak jauh (moveDown(2)) supaya logo yang agak panjang tidak tertabrak garis
        doc.moveDown(2);
        doc.moveTo(40, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(1.5);
        // --- SELESAI KOP SURAT ---

        // Sub Judul Laporan Sesuai Request
        doc.font('Helvetica-Bold').fontSize(14).text('Laporan Data Warga Penerima BLT Desa Mpanau Kec Sigi Biromaru', { align: 'center' });
        doc.moveDown(0.5);
        doc.font('Helvetica').fontSize(11).text(`Tanggal Dicetak: ${new Date().toLocaleDateString('id-ID')}`, { align: 'center' });
        doc.moveDown(2);

        const tableRows = allWarga.map((w, index) => [
            (index + 1).toString(),
            w.nik,
            w.nama,
            w.address || '-',
            w.noHp || '-'
        ]);

        const table = {
            title: "Daftar Warga Penerima BLT",
            subtitle: "Berisi seluruh data warga yang lolos seleksi dan berhak menerima bantuan",
            headers: [
                { label: "No", property: 'no', width: 30, render: null },
                { label: "NIK", property: 'nik', width: 100, render: null },
                { label: "Nama Lengkap", property: 'nama', width: 150, render: null },
                { label: "Alamat", property: 'alamat', width: 140, render: null },
                { label: "Nomor HP", property: 'noHp', width: 100, render: null }
            ],
            rows: tableRows
        };

        await doc.table(table, {
            prepareHeader: () => doc.font("Helvetica-Bold").fontSize(10),
            prepareRow: (row: any, indexColumn: number | undefined, indexRow: number | undefined, rectRow: any) => {
                // @ts-ignore : addBackground kadang tidak terbaca oleh library @types/pdfkit reguler
                if (indexColumn === 0) doc.addBackground(rectRow, 'white', 0.15);
                return doc.font("Helvetica").fontSize(10);
            },
        });

        doc.end();

    } catch (error) {
        console.error("Export PDF error:", error);
       
        if (!res.headersSent) {
            return res.status(500).json({ message: "Internal server error saat generate PDF" });
        }
    }
};
