import { Router } from "express";
import prisma from "../lib/prisma.js";

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

// Crear un nuevo producto
router.post("/", async (req, res) => {
  try {
    const {
      name,
      slug,
      description,
      cost,
      price,
      offerPrice,
      image,
      brand, // 👈 Recibimos la marca
      categoryId,
      isFeatured,
      isOffer,
      isActive,
      stock,
    } = req.body;

    // Validación básica de campos requeridos
    if (!name || !slug || price === undefined || !categoryId) {
      return res.status(400).json({
        success: false,
        message: "Faltan campos obligatorios (nombre, slug, precio o categoría)",
      });
    }

    const newProduct = await prisma.product.create({
      data: {
        name,
        slug,
        description: description || null,
        cost: cost !== undefined && cost !== '' ? Number(cost) : null,
        price: Number(price),
        offerPrice: offerPrice ? Number(offerPrice) : null,
        images: image ? [image] : [], // 👈 Cambiado de 'image' a 'images' (como un array si es String[])
        brand: brand || null,         // 👈 Aquí ya queda integrado el campo de la marca
        categoryId: Number(categoryId),
        isFeatured: Boolean(isFeatured),
        isOffer: Boolean(isOffer),
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        stock: stock ? Number(stock) : 0,
      },
    });

    res.status(201).json({
      success: true,
      data: newProduct,
    });
  } catch (error) {
    console.error("Error al crear producto:", error);
    res.status(500).json({
      success: false,
      message: "Error al crear el producto",
    });
  }
});

// 4. Actualizar producto por ID (PUT)
router.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "El ID del producto no es válido",
      });
    }

    const {
      name,
      slug,
      description,
      cost,
      price,
      offerPrice,
      images,
      brand,
      categoryId,
      isFeatured,
      isOffer,
      isActive,
      stock,
      artisan,
      origin,
      weight,
      width,
      height,
    } = req.body;

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name,
        slug,
        description: description || null,
        cost: cost !== undefined && cost !== '' ? Number(cost) : null,
        price: Number(price),
        offerPrice: offerPrice ? Number(offerPrice) : null,
        images: images || [],
        brand: brand || null,
        categoryId: Number(categoryId),
        isFeatured: Boolean(isFeatured),
        isOffer: Boolean(isOffer),
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        stock: stock !== undefined ? Number(stock) : 0,
        artisan: artisan || null,
        origin: origin || null,
        weight: weight ? Number(weight) : null,
        width: width ? Number(width) : null,
        height: height ? Number(height) : null,
      },
    });

    res.json({
      success: true,
      data: updatedProduct,
    });
  } catch (error) {
    console.error("Error al actualizar el producto:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar el producto",
    });
  }
});

// 5. Eliminar producto por ID (DELETE)
router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "El ID del producto no es válido",
      });
    }

    await prisma.product.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: "Producto eliminado correctamente",
    });
  } catch (error) {
    console.error("Error al eliminar el producto:", error);
    res.status(500).json({
      success: false,
      message: "Error al eliminar el producto",
    });
  }
});

// ... Mantener tus rutas POST, PUT y DELETE iguales abajo ...
export default router;