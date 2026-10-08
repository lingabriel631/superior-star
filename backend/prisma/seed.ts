import "dotenv/config";
import prisma from "../src/lib/prisma";

async function main() {
  console.log("🌱 Iniciando seed de TEKITI...");

  const categorias = [
    {
      name: "Moda",
      slug: "moda",
      description: "Prendas y piezas de moda de origen artesanal.",
    },
    {
      name: "Hogar",
      slug: "hogar",
      description: "Objetos artesanales para el hogar.",
    },
    {
      name: "Artesanía",
      slug: "artesania",
      description: "Piezas elaboradas por artesanos.",
    },
    {
      name: "Accesorios",
      slug: "accesorios",
      description: "Accesorios artesanales para complementar tu estilo.",
    },
    {
      name: "Joyería",
      slug: "joyeria",
      description: "Joyería artesanal de diferentes regiones.",
    },
    {
      name: "Arte",
      slug: "arte",
      description: "Obras y piezas de arte de creadores independientes.",
    },
    {
      name: "Textiles",
      slug: "textiles",
      description: "Textiles elaborados mediante técnicas artesanales.",
    },
    {
      name: "Regalos",
      slug: "regalos",
      description: "Piezas artesanales ideales para regalar.",
    },
  ];

  for (const categoria of categorias) {
    await prisma.category.upsert({
      where: {
        slug: categoria.slug,
      },
      update: categoria,
      create: categoria,
    });
  }

  const moda = await prisma.category.findUnique({
    where: { slug: "moda" },
  });

  const hogar = await prisma.category.findUnique({
    where: { slug: "hogar" },
  });

  const accesorios = await prisma.category.findUnique({
    where: { slug: "accesorios" },
  });

  const joyeria = await prisma.category.findUnique({
    where: { slug: "joyeria" },
  });

  if (!moda || !hogar || !accesorios || !joyeria) {
    throw new Error("No se pudieron encontrar las categorías.");
  }

  const productos = [
    {
      name: "Bolso artesanal de fibras naturales",
      slug: "bolso-artesanal-fibras-naturales",
      description:
        "Bolso elaborado artesanalmente con fibras naturales y acabados hechos a mano.",
      price: 45.0,
      offerPrice: null,
      stock: 12,
      image:
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80",
      isFeatured: true,
      isOffer: false,
      categoryId: accesorios.id,
    },
    {
      name: "Camisa artesanal de lino",
      slug: "camisa-artesanal-lino",
      description:
        "Camisa de lino confeccionada en pequeñas producciones por artesanos.",
      price: 68.0,
      offerPrice: 54.0,
      stock: 8,
      image:
        "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=80",
      isFeatured: true,
      isOffer: true,
      categoryId: moda.id,
    },
    {
      name: "Collar artesanal contemporáneo",
      slug: "collar-artesanal-contemporaneo",
      description:
        "Collar de diseño contemporáneo elaborado artesanalmente.",
      price: 39.0,
      offerPrice: null,
      stock: 15,
      image:
        "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=80",
      isFeatured: true,
      isOffer: false,
      categoryId: joyeria.id,
    },
    {
      name: "Cesta tejida a mano",
      slug: "cesta-tejida-a-mano",
      description:
        "Cesta decorativa tejida a mano utilizando técnicas artesanales tradicionales.",
      price: 32.0,
      offerPrice: 26.0,
      stock: 10,
      image:
        "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=900&q=80",
      isFeatured: false,
      isOffer: true,
      categoryId: hogar.id,
    },
    {
      name: "Chaqueta artesanal de algodón",
      slug: "chaqueta-artesanal-algodon",
      description:
        "Chaqueta de algodón confeccionada artesanalmente en pequeñas cantidades.",
      price: 95.0,
      offerPrice: null,
      stock: 6,
      image:
        "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=80",
      isFeatured: true,
      isOffer: false,
      categoryId: moda.id,
    },
  ];

  for (const producto of productos) {
    await prisma.product.upsert({
      where: {
        slug: producto.slug,
      },
      update: producto,
      create: producto,
    });
  }

  console.log("✅ Categorías creadas/actualizadas:", categorias.length);
  console.log("✅ Productos creados/actualizados:", productos.length);
  console.log("🌱 Seed de TEKITI completado.");
}

main()
  .catch((error) => {
    console.error("❌ Error ejecutando seed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
