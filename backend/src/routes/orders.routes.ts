import { Router } from "express";
import prisma from "../lib/prisma.js";

const router = Router();

// backend/src/routes/orders.routes.ts

router.get("/picking-list", async (req, res) => {
  try {
    // 1. Traemos todas las órdenes para evitar problemas de tipos con los enums en Prisma
    const allOrders = await prisma.order.findMany({
      include: {
        customer: true,
        items: {
          include: { product: true }
        }
      }
    });

    // 2. Filtramos en JavaScript las que tengan el estado PENDING
    const pendingOrders = allOrders.filter(order => order.status === "PENDING");

    if (pendingOrders.length === 0) {
      return res.status(400).send(`
        <!DOCTYPE html>
        <html lang="es">
        <head><meta charset="UTF-8"><title>Sin pedidos</title></head>
        <body style="font-family: Arial; text-align: center; padding-top: 50px;">
          <h2>No hay pedidos pendientes para preparar.</h2>
          <button onclick="window.close()" style="padding: 10px 20px; cursor: pointer;">Cerrar ventana</button>
        </body>
        </html>
      `);
    }

    // 3. Actualizamos masivamente su estado logístico a PROCESSING usando sus IDs
    const pendingIds = pendingOrders.map(o => o.id);
    await prisma.order.updateMany({
      where: { 
        id: { in: pendingIds } 
      },
      data: { status: "PROCESSING" }
    });

    // 4. Consolidar los productos totales a preparar
    const productSummary: { [key: string]: { name: string; quantity: number } } = {};
    
    pendingOrders.forEach(order => {
      order.items.forEach(item => {
        const prodName = item.product?.name || `Producto #${item.productId}`;
        if (!productSummary[prodName]) {
          productSummary[prodName] = { name: prodName, quantity: 0 };
        }
        productSummary[prodName].quantity += item.quantity;
      });
    });

    // 5. Generar HTML limpio para impresión / PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Lista de Preparación - Tekiti</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
          h1 { color: #111; border-bottom: 2px solid #333; padding-bottom: 5px; }
          .meta { margin-bottom: 20px; font-size: 14px; color: #666; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 30px; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 14px; }
          th { background-color: #f4f4f4; }
          .order-box { border: 1px solid #ccc; padding: 15px; margin-bottom: 20px; border-radius: 5px; page-break-inside: avoid; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 20px;">
          <button onclick="window.print()" style="padding: 10px 20px; background: #000; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-size: 16px;">🖨️ Guardar como PDF / Imprimir</button>
        </div>

        <h1>📦 Lista de Preparación (Picking List) - Tekiti</h1>
        <div class="meta">
          <p><strong>Fecha de generación:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>Total de pedidos procesados:</strong> ${pendingOrders.length}</p>
        </div>

        <h2>Resumen General de Productos a Preparar</h2>
        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th style="width: 120px; text-align: center;">Cantidad Total</th>
            </tr>
          </thead>
          <tbody>
            ${Object.values(productSummary).map(p => `
              <tr>
                <td>${p.name}</td>
                <td style="text-align: center; font-weight: bold; font-size: 16px;">${p.quantity}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h2>Detalle por Pedido</h2>
        ${pendingOrders.map(order => `
          <div class="order-box">
            <p><strong>Pedido #${order.orderNumber}</strong> | 👤 Cliente ID: ${order.customerId} \vert{} 💳 Pago: ${order.paymentStatus}</p>
            <ul>
              ${order.items.map(i => `<li>${i.quantity}x ${i.product?.name || 'Producto'}</li>`).join('')}
            </ul>
          </div>
        `).join('')}

        <script>
          window.onload = () => { setTimeout(() => window.print(), 500); };
        </script>
      </body>
      </html>
    `;

    res.send(htmlContent);

  } catch (error: any) {
    console.error("❌ Error al generar la lista de preparación:", error);
    res.status(500).send(`Error interno al generar el reporte: ${error.message}`);
  }
});

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

// backend/src/routes/orders.routes.ts (Agrega esto arriba de las demás rutas)

router.get("/", async (_req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("Error al obtener los pedidos:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener los pedidos",
    });
  }
});

// backend/src/routes/orders.routes.ts

router.patch("/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // Aquí llega el valor seleccionado ("PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED")

  const validStatuses = ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Estado inválido.",
    });
  }

  try {
    const orderId = Number(id);

    const currentOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: { 
        items: {
          include: { product: true }
        } 
      },
    });

    if (!currentOrder) {
      return res.status(404).json({
        success: false,
        message: "Pedido no encontrado.",
      });
    }

    const previousStatus = currentOrder.status;

    // RESTRICCIÓN DE NEGOCIO: No se puede cancelar si ya fue enviado o entregado
    if (status === "CANCELLED" && (previousStatus === "SHIPPED" || previousStatus === "DELIVERED")) {
      return res.status(400).json({
        success: false,
        message: "No se puede cancelar un pedido que ya ha sido enviado o entregado.",
      });
    }

    // Si cambia a CANCELLED y antes no lo estaba, reponemos stock y actualizamos
    if (status === "CANCELLED" && previousStatus !== "CANCELLED") {
      await prisma.$transaction(async (tx) => {
        for (const item of currentOrder.items) {
          const prodId = item.productId || (item as any).product_id || item.product?.id;
          
          if (prodId) {
            await tx.product.update({
              where: { id: Number(prodId) },
              data: { stock: { increment: item.quantity } },
            });
          }
        }

        await tx.order.update({
          where: { id: orderId },
          data: { status: "CANCELLED" },
        });
      });
    } 
    else if (status === "PAID") {
      // Si el estado es PAID, actualizamos paymentStatus (y opcionalmente status)
      await prisma.order.update({
        where: { id: orderId },
        data: { 
          paymentStatus: "PAID" 
          // Si tu OrderStatus tiene un equivalente como 'PROCESSING', puedes incluirlo aquí:
          // status: "PROCESSING" 
        },
      });
    } 
    else {
      // Para PENDING, SHIPPED, DELIVERED
      await prisma.order.update({
        where: { id: orderId },
        data: { status: status },
      });
    }

    res.json({
      success: true,
      message: `Estado del pedido actualizado exitosamente`,
    });

  } catch (error: any) {
    console.error("❌ Error detallado de Prisma al actualizar estado:", error);
    res.status(500).json({
      success: false,
      message: error.meta?.cause || error.message || "Error interno al actualizar el estado.",
    });
  }
});

