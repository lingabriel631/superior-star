import express from "express";
import cors from "cors";
import productsRoutes from "./routes/products.routes.js";
import categoriesRoutes from "./routes/categories.routes.js";
import ordersRoutes from "./routes/orders.routes.js";
import authRoutes from './routes/auth.routes.js';

const app = express();

aconst allowedOrigins = [
  'http://localhost:4321',
  'http://127.0.0.1:4321',
  process.env.FRONTEND_URL, // Aquí puedes poner la URL de tu frontend en Vercel
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Permitir solicitudes sin origen (como Postman o apps móviles) o si están en la lista
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Bloqueado por CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
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
