import "dotenv/config";
import { PrismaClient } from "./generated/index.js";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import mariadb from "mariadb";
import bcrypt from "bcrypt";

const connectionString = `${process.env.DATABASE_URL}`.replace("mysql://", "mariadb://");
const adapter = new PrismaMariaDb(connectionString);
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminUser = "admin001";

  const existingAdmin = await prisma.user.findFirst({
    where: { username: adminUser },
  });

  if (existingAdmin) {
    console.log("Admin already exists");
    return;
  }

  const hashedPassword = await bcrypt.hash("12345", 10);

  await prisma.user.create({
    data: {
      username: adminUser,
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log("Admin user created");

  const passwordWarga = await bcrypt.hash("warga123", 10);

  // Seed 5 Warga Data
  const seedDatas = [
    { nik: "7201011111110001", nama: "Budi Santoso", status: "Menunggu", address: "Jl. Mawar No. 1" },
    { nik: "7201012222220002", nama: "Siti Aminah", status: "Menunggu", address: "Jl. Melati No. 2", fotoKtp: "ktp.jpg", fotoKk: "kk.jpg", fotoRumah: "rumah.jpg", fotoDapur: "dapur.jpg" },
    { nik: "7201013333330003", nama: "Agus Junaidi", status: "Disetujui", address: "Jl. Anggrek No. 3" },
    { nik: "7201014444440004", nama: "Rini Wulandari", status: "Ditolak", address: "Jl. Kamboja No. 4" },
    { nik: "7201015555550005", nama: "Joko Anwar (Hantu)", status: "Menunggu", address: "Jl. Kuburan No. 5", isDeleted: true }
  ];

  console.log("Seeding Warga...");
  for (const wargaData of seedDatas) {
    const existingWarga = await (prisma as any).warga.findUnique({ where: { nik: wargaData.nik } });

    if (!existingWarga) {
      // Create User first
      const newUser = await prisma.user.create({
        data: {
          username: wargaData.nik,
          password: passwordWarga,
          role: "WARGA" as any
        }
      });

      // Create Warga profile linked to User
      const newWarga = await (prisma as any).warga.create({
        data: {
          nik: wargaData.nik,
          nama: wargaData.nama,
          address: wargaData.address,
          status: wargaData.status as any, // bypassing enum type restriction just in case
          fotoKtp: wargaData.fotoKtp,
          fotoKk: wargaData.fotoKk,
          fotoRumah: wargaData.fotoRumah,
          fotoDapur: wargaData.fotoDapur,
          isDeleted: wargaData.isDeleted || false,
          userId: newUser.id
        }
      });

      // If rejected, create a dummy note
      if (wargaData.status === "Ditolak") {
        await (prisma as any).rejectedNote.create({
          data: {
            wargaId: newWarga.id,
            adminId: existingAdmin ? existingAdmin.id : 1, // fallback to 1 if existingAdmin is null but it was just created
            note: "Maaf, foto KTP anda tidak terbaca dan tertutup jempol. Mohon foto ulang dengan jelas."
          }
        });
      }
    }
  }
  console.log("Seeding Warga completed!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
