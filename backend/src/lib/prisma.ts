import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// Tomamos la URL de las variables de entorno
const connectionString = process.env.DATABASE_URL;

// Configuramos el pool de pg nativo permitiendo certificados en la nube
const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Pasamos el adaptador requerido por Prisma v7
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

export default prisma;