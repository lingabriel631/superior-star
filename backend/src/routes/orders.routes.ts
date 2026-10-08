import { Router } from "express";
import prisma from "../lib/prisma";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const {
      customer,
      shipping,
      items,
      paymentMethod,
      notes,
    } = req.body;

    if (!customer || !shipping || !items || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Faltan datos obligatorios del pedido",
      });
    }

    if (!customer.name || !customer.email) {
      return res.status(400).json({
        success: false,
        message: "El nombre y correo del cliente son obligatorios",
      });
    }

    if (
      !shipping.name ||
      !shipping.address ||
      !shipping.city ||
      !shipping.country
    ) {
      return res.status(400).json({
        success: false,
        message: "Faltan datos de envío",
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "El pedido debe contener al menos un producto",
      });
    }

    if (!["CARD", "BANK_TRANSFER"].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Método de pago no válido",
      });
    }

    const productIds = items.map((item: { productId: number }) =>
      Number(item.productId)
    );

    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
        isActive: true,
      },
    });

    if (products.length !== productIds.length) {
      return res.status(400).json({
        success: false,
        message: "Uno o más productos no existen o están inactivos",
      });
    }

    for (const item of items) {
      const product = products.find(
        (product) => product.id === Number(item.productId)
      );

      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Producto ${item.productId} no encontrado`,
        });
      }

      const quantity = Number(item.quantity);

      if (!Number.isInteger(quantity) || quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: `Cantidad no válida para el producto ${product.name}`,
        });
      }

      if (product.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: `Stock insuficiente para ${product.name}`,
        });
      }
    }

    let customerRecord = await prisma.customer.findUnique({
      where: {
        email: customer.email,
      },
    });

    if (!customerRecord) {
      customerRecord = await prisma.customer.create({
        data: {
          name: customer.name,
          email: customer.email,
          phone: customer.phone || null,
        },
      });
    } else {
      customerRecord = await prisma.customer.update({
        where: {
          id: customerRecord.id,
        },
        data: {
          name: customer.name,
          phone: customer.phone || null,
        },
      });
    }

    let subtotal = 0;

    const orderItems = items.map(
      (item: { productId: number; quantity: number }) => {
        const product = products.find(
          (product) => product.id === Number(item.productId)
        )!;

        const quantity = Number(item.quantity);

        const unitPrice =
          product.offerPrice ?? product.price;

        subtotal += Number(unitPrice) * quantity;

        return {
          productId: product.id,
          quantity,
          unitPrice,
        };
      }
    );

    const shippingCost = subtotal >= 100 ? 0 : 7.5;
    const total = subtotal + shippingCost;

    const orderNumber = `TK-${Date.now()}`;

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          customerId: customerRecord.id,

          paymentMethod,
          paymentStatus: "PENDING",

          subtotal,
          shippingCost,
          total,

          shippingName: shipping.name,
          shippingAddress: shipping.address,
          shippingCity: shipping.city,
          shippingCountry: shipping.country,
          shippingPhone: shipping.phone || null,

          notes: notes || null,

          items: {
            create: orderItems,
          },
        },
        include: {
          customer: true,
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      for (const item of items) {
        await tx.product.update({
          where: {
            id: Number(item.productId),
          },
          data: {
            stock: {
              decrement: Number(item.quantity),
            },
          },
        });
      }

      return newOrder;
    });

    res.status(201).json({
      success: true,
      message: "Pedido creado correctamente",
      data: order,
    });
  } catch (error) {
    console.error("Error al crear el pedido:", error);

    res.status(500).json({
      success: false,
      message: "Error al crear el pedido",
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "El ID del pedido no es válido",
      });
    }

    const order = await prisma.order.findUnique({
      where: {
        id,
      },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Pedido no encontrado",
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Error al obtener el pedido:", error);

    res.status(500).json({
      success: false,
      message: "Error al obtener el pedido",
    });
  }
});

export default router;
