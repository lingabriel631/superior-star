import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// Limpiamos la URL eliminando los parámetros de query (?sslmode=...) 
// para que no interfieran con la configuración estricta de Node.
const rawConnectionString = process.env.DATABASE_URL || "";
const connectionString = rawConnectionString.split("?")[0];

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false, // 👈 Esto desactiva la validación estricta del certificado
  },
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

export default prisma;