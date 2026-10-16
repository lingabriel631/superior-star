import { Router } from "express";
import prisma from "../lib/prisma";

const router = Router();

// 1. Obtener todos los productos (existente)
router.get("/", async (_req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
      },
      include: {
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error("Error al obtener productos:", error);

    res.status(500).json({
      success: false,
      message: "Error al obtener los productos",
    });
  }
});

// 2. NUEVA RUTA: Obtener producto por SLUG (para el frontend de usuarios)
router.get("/slug/:slug", async (req, res) => {
  try {
    const { slug } = req.params;

    const product = await prisma.product.findUnique({
      where: {
        slug,
      },
      include: {
        category: true,
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado",
      });
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Error al obtener el producto por slug:", error);

    res.status(500).json({
      success: false,
      message: "Error al obtener el producto",
    });
  }
});

// 3. Obtener producto por ID (existente)
router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "El ID del producto no es válido",
      });
    }

    const product = await prisma.product.findUnique({
      where: {
        id,
      },
      include: {
        category: true,
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado",
      });
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Error al obtener el producto:", error);

    res.status(500).json({
      success: false,
      message: "Error al obtener el producto",
    });
  }
});

// ... Mantener tus rutas POST, PUT y DELETE iguales abajo ...
export default router;