import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import mariadb from "mariadb";
import dotenv from "dotenv";

dotenv.config();

const connectionString = `${process.env.DATABASE_URL}`.replace("mysql://", "mariadb://");
const adapter = new PrismaMariaDb(connectionString);
export const prisma = new PrismaClient({ adapter });
