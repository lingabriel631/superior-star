import express from "express";
import cors from "cors";
import productsRoutes from "./routes/products.routes";
import categoriesRoutes from "./routes/categories.routes";
import ordersRoutes from "./routes/orders.routes";

const app = express();

app.use(cors());
app.use(express.json());

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
