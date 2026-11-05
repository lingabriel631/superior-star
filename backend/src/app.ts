import express from "express";
import cors from "cors";
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import productsRoutes from "./routes/products.routes.js";
import categoriesRoutes from "./routes/categories.routes.js";
import ordersRoutes from "./routes/orders.routes.js";
import authRoutes from './routes/auth.routes.js';

const app = express();

// 1. Configuración de Cloudinary y Multer
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({ storage: multer.memoryStorage() });

const allowedOrigins = [
  'http://localhost:4321',
  'http://127.0.0.1:4321',
  process.env.FRONTEND_URL,
].filter(Boolean);

// Configuración de CORS permitiendo PATCH y otros métodos
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.use('/api/auth', authRoutes);

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "TEKITI API funcionando",
  });
});

// 2. Endpoint para subir imágenes a Cloudinary
app.post('/api/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No se envió ninguna imagen.' });
    }

    const uploadPromise = new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'tekiti_products' }, 
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    const result: any = await uploadPromise;

    return res.json({
      success: true,
      url: result.secure_url
    });

  } catch (error) {
    console.error('Error al subir la imagen:', error);
    return res.status(500).json({ success: false, message: 'Error interno al procesar la imagen.' });
  }
});

app.use("/api/products", productsRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/orders", ordersRoutes);

export default app;