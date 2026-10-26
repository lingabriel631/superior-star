import express from "express";
import cors from "cors";
import productsRoutes from "./routes/products.routes";
import categoriesRoutes from "./routes/categories.routes";
import ordersRoutes from "./routes/orders.routes";
import authRoutes from './routes/auth.routes.js';

const app = express();

app.use(cors({
  origin: ['http://localhost:4321', 'http://127.0.0.1:4321'],
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
