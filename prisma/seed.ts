import "dotenv/config";
import { PrismaClient } from "./generated/index.js";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import mariadb from "mariadb";
import bcrypt from "bcrypt";

const connectionString = `${process.env.DATABASE_URL}`;
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
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
