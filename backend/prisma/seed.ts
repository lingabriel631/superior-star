import "dotenv/config";
import prisma from "../src/lib/prisma";
import { truncate } from "node:fs/promises";

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

  const arte = await prisma.category.findUnique({
  where: { slug: "arte" },
  });

  const textiles = await prisma.category.findUnique({
  where: { slug: "textiles" },
  });

  const regalos = await prisma.category.findUnique({
  where: { slug: "regalos" },
  });

  if (!moda || !hogar || !accesorios || !joyeria || !arte || !textiles || !regalos ) {
    throw new Error("No se pudieron encontrar las categorías.");
  }

  const productos = [
  {
    name: "Bolso de cuero artesanal",
    slug: "bolso-de-cuero-artesanal",
    description: "Bolso artesanal elaborado en cuero.",
    price: 85.0,
    offerPrice: 68.0,
    stock: 10,
    image:
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=900&q=80",
    isFeatured: true,
    isOffer: true,
    categoryId: accesorios.id,
  },
  {
    name: "Jarrón de cerámica",
    slug: "jarron-de-ceramica",
    description: "Jarrón de cerámica elaborado artesanalmente.",
    price: 48.0,
    offerPrice: 36.0,
    stock: 10,
    image:
      "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=900&q=80",
    isFeatured: true,
    isOffer: true,
    categoryId: hogar.id,
  },
  {
    name: "Collar artesanal",
    slug: "collar-artesanal",
    description: "Collar artesanal de diseño contemporáneo.",
    price: 36.0,
    offerPrice: 30.6,
    stock: 15,
    image:
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=80",
    isFeatured: true,
    isOffer: true,
    categoryId: joyeria.id,
  },
  {
    name: "Canasto tejido",
    slug: "canasto-tejido",
    description: "Canasto tejido artesanalmente.",
    price: 42.0,
    offerPrice: 29.4,
    stock: 10,
    image:
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=80",
    isFeatured: true,
    isOffer: true,
    categoryId: hogar.id,
  },
  {
    name: "Cerámica pintada a mano",
    slug: "ceramica-pintada-a-mano",
    description: "Pieza de cerámica pintada a mano.",
    price: 32.0,
    offerPrice: 25.6,
    stock: 12,
    image:
      "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=900&q=80",
    isFeatured: true,
    isOffer: true,
    categoryId: hogar.id,
  },
  {
    name: "Pulsera tejida",
    slug: "pulsera-tejida",
    description: "Pulsera elaborada mediante técnicas artesanales.",
    price: 18.0,
    offerPrice: 15.3,
    stock: 20,
    image:
      "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=900&q=80",
    isFeatured: true,
    isOffer: true,
    categoryId: accesorios.id,
  },
  {
    name: "Lámpara artesanal",
    slug: "lampara-artesanal",
    description: "Lámpara decorativa de elaboración artesanal.",
    price: 95.0,
    offerPrice: 71.25,
    stock: 8,
    image:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80",
    isFeatured: true,
    isOffer: true,
    categoryId: hogar.id,
  },
  {
    name: "Textil artesanal",
    slug: "textil-artesanal",
    description: "Textil elaborado mediante técnicas artesanales.",
    price: 54.0,
    offerPrice: 43.2,
    stock: 12,
    image:
      "https://images.unsplash.com/photo-1604881988758-f76ad2f7aac1?auto=format&fit=crop&w=900&q=80",
    isFeatured: true,
    isOffer: true,
    categoryId: textiles.id,
  },
  {
    name: "Anillo artesanal",
    slug: "anillo-artesanal",
    description: "Anillo de diseño artesanal.",
    price: 29.0,
    offerPrice: 24.65,
    stock: 15,
    image:
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=900&q=80",
    isFeatured: true,
    isOffer: true,
    categoryId: joyeria.id,
  },
  {
    name: "Bolso tejido",
    slug: "bolso-tejido",
    description: "Bolso tejido mediante técnicas artesanales.",
    price: 68.0,
    offerPrice: 47.6,
    stock: 10,
    image:
      "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=900&q=80",
    isFeatured: true,
    isOffer: true,
    categoryId: accesorios.id,
  },
  {
    name: "Taza de cerámica",
    slug: "taza-de-ceramica",
    description: "Taza de cerámica elaborada artesanalmente.",
    price: 24.0,
    offerPrice: 19.2,
    stock: 20,
    image:
      "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=900&q=80",
    isFeatured: true,
    isOffer: true,
    categoryId: hogar.id,
  },
  {
    name: "Bandeja de madera",
    slug: "bandeja-de-madera",
    description: "Bandeja de madera de elaboración artesanal.",
    price: 45.0,
    offerPrice: 33.75,
    stock: 10,
    image:
      "https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&w=900&q=80",
    isFeatured: true,
    isOffer: true,
    categoryId: hogar.id,
  },
  {
    name: "Aretes artesanales",
    slug: "aretes-artesanales",
    description: "Aretes elaborados artesanalmente.",
    price: 27.0,
    offerPrice: null,
    stock: 15,
    image:
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=900&q=80",
    isFeatured: true,
    isOffer: false,
    categoryId: joyeria.id,
  },
  {
    name: "Cesta de fibras naturales",
    slug: "cesta-de-fibras-naturales",
    description: "Cesta elaborada con fibras naturales.",
    price: 58.0,
    offerPrice: null,
    stock: 10,
    image:
      "https://images.unsplash.com/photo-1523779917675-b6ed3a42a561?auto=format&fit=crop&w=900&q=80",
    isFeatured: true,
    isOffer: false,
    categoryId: hogar.id,
  },
  {
    name: "Bufanda artesanal",
    slug: "bufanda-artesanal",
    description: "Bufanda elaborada mediante técnicas textiles artesanales.",
    price: 39.0,
    offerPrice: null,
    stock: 15,
    image:
      "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?auto=format&fit=crop&w=900&q=80",
    isFeatured: true,
    isOffer: false,
    categoryId: moda.id,
  },
  {
    name: "Figura decorativa",
    slug: "figura-decorativa",
    description: "Figura decorativa creada artesanalmente.",
    price: 62.0,
    offerPrice: null,
    stock: 8,
    image:
      "https://images.unsplash.com/photo-1577083552431-6e5fd01988f5?auto=format&fit=crop&w=900&q=80",
    isFeatured: true,
    isOffer: false,
    categoryId: arte.id,
  },
  {
    name: "Plato artesanal",
    slug: "plato-artesanal",
    description: "Plato elaborado artesanalmente.",
    price: 34.0,
    offerPrice: null,
    stock: 12,
    image:
      "https://images.unsplash.com/photo-1603199506016-b9a594b593c0?auto=format&fit=crop&w=900&q=80",
    isFeatured: true,
    isOffer: false,
    categoryId: hogar.id,
  },
  {
    name: "Sombrero artesanal",
    slug: "sombrero-artesanal",
    description: "Sombrero elaborado artesanalmente.",
    price: 72.0,
    offerPrice: null,
    stock: 10,
    image:
      "https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=900&q=80",
    isFeatured: true,
    isOffer: false,
    categoryId: moda.id,
  },
  {
    name: "Vela artesanal",
    slug: "vela-artesanal",
    description: "Vela decorativa de elaboración artesanal.",
    price: 22.0,
    offerPrice: null,
    stock: 20,
    image:
      "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=900&q=80",
    isFeatured: true,
    isOffer: false,
    categoryId: hogar.id,
  },
  {
    name: "Cuenco de madera",
    slug: "cuenco-de-madera",
    description: "Cuenco de madera elaborado artesanalmente.",
    price: 41.0,
    offerPrice: null,
    stock: 10,
    image:
      "https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?auto=format&fit=crop&w=900&q=80",
    isFeatured: true,
    isOffer: false,
    categoryId: hogar.id,
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

  await prisma.product.updateMany({
  where: {
    id: {
      in: [1, 2, 3, 5],
    },
          },
          data: {
            isFeatured: false,
          },
});

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
