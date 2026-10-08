import { Router } from "express";
import prisma from "../lib/prisma";

const router = Router();

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

export default router;
