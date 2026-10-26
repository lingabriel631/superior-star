import { Router } from "express";
import prisma from "../lib/prisma.js";

const router = Router();

// 1. Ruta para obtener todas las categorías (ya la tenías)
router.get("/", async (_req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
    });

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Error al obtener categorías:", error);

    res.status(500).json({
      success: false,
      message: "Error al obtener las categorías",
    });
  }
});

// 2. NUEVA RUTA: Obtener una categoría por su slug y sus productos asociados
router.get("/:slug", async (req, res) => {
  try {
    const { slug } = req.params;

    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        products: true, // Trae los productos vinculados a esta categoría para mostrarlos en el frontend
      },
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Categoría no encontrada",
      });
    }

    res.json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error("Error al obtener la categoría por slug:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener la categoría",
    });
  }
});

export default router;
