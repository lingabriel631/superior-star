import 'dotenv/config';
import { Router, Request, Response } from 'express';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();

// Configuración de Prisma 7 con Pool de pg
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const JWT_SECRET = process.env.JWT_SECRET || 'tekiti_super_secret_key_2026';

router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email }, 
      JWT_SECRET, 
      { expiresIn: '8h' }
    );

    return res.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });

  } catch (error) {
    console.error('Error en el login:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

router.get('/setup-admin', async (_req: Request, res: Response) => {
  try {
    const email = 'admin@tekiti.com';
    const rawPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const user = await prisma.user.upsert({
      where: { email },
      update: { password: hashedPassword },
      create: {
        email,
        password: hashedPassword,
        name: 'Administrador Tekiti',
      },
    });

    return res.json({
      success: true,
      message: '¡Administrador creado/actualizado con éxito!',
      email: user.email,
    });
  } catch (error) {
    console.error('Error al configurar admin:', error);
    return res.status(500).json({ success: false, error: (error as Error).message });
  }
});

export default router;