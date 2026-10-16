import { Router } from "express";
import prisma from "../lib/prisma";

const router = Router();

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

router.post("/", async (req, res) => {
  try {
    const {
      name,
      slug,
      description,
      price,
      offerPrice,
      stock,
      images, // 👈 Cambiado de 'image' (string) a 'images' (arreglo)
      isFeatured,
      isOffer,
      categoryId,
    } = req.body;

    if (!name || !slug || price === undefined || categoryId === undefined) {
      return res.status(400).json({
        success: false,
        message: "Faltan campos obligatorios",
      });
    }

    // Validación: Comprobar que si se envían imágenes, sea un arreglo y no rebase las 5
    if (images !== undefined) {
      if (!Array.isArray(images)) {
        return res.status(400).json({
          success: false,
          message: "El campo images debe ser un arreglo de URLs",
        });
      }
      if (images.length > 5) {
        return res.status(400).json({
          success: false,
          message: "Solo puedes subir un máximo de 5 fotografías por producto",
        });
      }
    }

    const category = await prisma.category.findUnique({
      where: {
        id: Number(categoryId),
      },
    });

    if (!category) {
      return res.status(400).json({
        success: false,
        message: "La categoría no existe",
      });
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description: description || null,
        price: Number(price),
        offerPrice:
          offerPrice !== undefined && offerPrice !== null
            ? Number(offerPrice)
            : null,
        stock: stock !== undefined ? Number(stock) : 0,
        images: Array.isArray(images) ? images : [], // 👈 Se guarda el arreglo (vacío si no envían nada)
        isFeatured: Boolean(isFeatured),
        isOffer: Boolean(isOffer),
        categoryId: Number(categoryId),
      },
      include: {
        category: true,
      },
    });

    res.status(201).json({
      success: true,
      message: "Producto creado correctamente",
      data: product,
    });
  } catch (error) {
    console.error("Error al crear el producto:", error);

    res.status(500).json({
      success: false,
      message: "Error al crear el producto",
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "El ID del producto no es válido",
      });
    }

    const existingProduct = await prisma.product.findUnique({
      where: {
        id,
      },
    });

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado",
      });
    }

    const {
      name,
      slug,
      description,
      price,
      offerPrice,
      stock,
      images, // 👈 Cambiado a 'images'
      isFeatured,
      isOffer,
      isActive,
      categoryId,
    } = req.body;

    // Validación del límite de 5 imágenes en actualización si se envían
    if (images !== undefined) {
      if (!Array.isArray(images)) {
        return res.status(400).json({
          success: false,
          message: "El campo images debe ser un arreglo de URLs",
        });
      }
      if (images.length > 5) {
        return res.status(400).json({
          success: false,
          message: "Solo puedes subir un máximo de 5 fotografías por producto",
        });
      }
    }

    if (categoryId !== undefined) {
      const category = await prisma.category.findUnique({
        where: {
          id: Number(categoryId),
        },
      });

      if (!category) {
        return res.status(400).json({
          success: false,
          message: "La categoría no existe",
        });
      }
    }

    const product = await prisma.product.update({
      where: {
        id,
      },
      data: {
        ...(name !== undefined && { name }),
        ...(slug !== undefined && { slug }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price: Number(price) }),
        ...(offerPrice !== undefined && {
          offerPrice:
            offerPrice === null ? null : Number(offerPrice),
        }),
        ...(stock !== undefined && { stock: Number(stock) }),
        ...(images !== undefined && { images }), // 👈 Actualiza el arreglo de imágenes si viene en la petición
        ...(isFeatured !== undefined && {
          isFeatured: Boolean(isFeatured),
        }),
        ...(isOffer !== undefined && {
          isOffer: Boolean(isOffer),
        }),
        ...(isActive !== undefined && {
          isActive: Boolean(isActive),
        }),
        ...(categoryId !== undefined && {
          categoryId: Number(categoryId),
        }),
      },
      include: {
        category: true,
      },
    });

    res.json({
      success: true,
      message: "Producto actualizado correctamente",
      data: product,
    });
  } catch (error) {
    console.error("Error al actualizar el producto:", error);

    res.status(500).json({
      success: false,
      message: "Error al actualizar el producto",
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "El ID del producto no es válido",
      });
    }

    const existingProduct = await prisma.product.findUnique({
      where: {
        id,
      },
    });

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado",
      });
    }

    await prisma.product.delete({
      where: {
        id,
      },
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

export default router;