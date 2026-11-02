import express from "express";
import cors from "cors";
import productsRoutes from "./routes/products.routes.js";
import categoriesRoutes from "./routes/categories.routes.js";
import ordersRoutes from "./routes/orders.routes.js";
import authRoutes from './routes/auth.routes.js';

const app = express();

const allowedOrigins = [
  'http://localhost:4321',
  'http://127.0.0.1:4321',
  process.env.FRONTEND_URL,
].filter(Boolean);

import cors from 'cors';

// Configuración de CORS permitiendo PATCH y otros métodos
app.use(cors({
  origin: '*', // O puedes especificar tu dominio de Vercel: 'https://superior-star-jxllvnvxu-tekiti.vercel.app'
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

app.use("/api/products", productsRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/orders", ordersRoutes);

export default app;