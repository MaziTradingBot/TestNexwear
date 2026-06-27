import { Prisma } from "@prisma/client";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

// Cache window (seconds) for stable catalog data shown on home/listing rails.
const CATALOG_TTL = 120;

/* ---------- Serializable shapes for client components ---------- */

export type ProductCard = {
  id: string;
  slug: string;
  title: string;
  brand: string;
  department: string;
  price: number;
  discountPrice: number | null;
  image: string;
  hoverImage: string | null;
  rating: number;
  reviewCount: number;
  isNewArrival: boolean;
  outOfStock: boolean;
  colors: { name: string; hex: string | null }[];
};

export type ProductDetail = ProductCard & {
  sku: string;
  description: string;
  material: string | null;
  collection: string | null;
  categoryName: string;
  categorySlug: string;
  images: string[];
  variants: {
    id: string;
    size: string;
    color: string;
    colorHex: string | null;
    stock: number;
  }[];
  sizes: string[];
};

const cardSelect = {
  id: true,
  slug: true,
  title: true,
  department: true,
  price: true,
  discountPrice: true,
  rating: true,
  reviewCount: true,
  isNewArrival: true,
  brand: { select: { name: true } },
  images: { orderBy: { position: "asc" }, select: { url: true } },
  variants: { select: { color: true, colorHex: true, stock: true } },
} satisfies Prisma.ProductSelect;

type RawCard = Prisma.ProductGetPayload<{ select: typeof cardSelect }>;

function toCard(p: RawCard): ProductCard {
  const colorMap = new Map<string, string | null>();
  for (const v of p.variants) if (!colorMap.has(v.color)) colorMap.set(v.color, v.colorHex);
  const totalStock = p.variants.reduce((s, v) => s + v.stock, 0);
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    brand: p.brand.name,
    department: p.department,
    price: Number(p.price),
    discountPrice: p.discountPrice ? Number(p.discountPrice) : null,
    image: p.images[0]?.url ?? "",
    hoverImage: p.images[1]?.url ?? null,
    rating: Number(p.rating),
    reviewCount: p.reviewCount,
    isNewArrival: p.isNewArrival,
    outOfStock: totalStock === 0,
    colors: Array.from(colorMap, ([name, hex]) => ({ name, hex })),
  };
}

/* ---------- Filters ---------- */

export type ProductFilters = {
  department?: string;
  category?: string; // category slug
  brands?: string[]; // brand slugs
  colors?: string[];
  sizes?: string[];
  materials?: string[];
  minPrice?: number;
  maxPrice?: number;
  onSale?: boolean;
  search?: string;
  sort?: string;
  page?: number;
  perPage?: number;
};

function buildWhere(f: ProductFilters): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = { isActive: true };
  if (f.department) where.department = f.department;
  if (f.category) where.category = { slug: f.category };
  if (f.brands?.length) where.brand = { slug: { in: f.brands } };
  if (f.materials?.length) where.material = { in: f.materials };
  if (f.onSale) where.discountPrice = { not: null };
  if (f.minPrice != null || f.maxPrice != null) {
    where.price = {};
    if (f.minPrice != null) where.price.gte = f.minPrice;
    if (f.maxPrice != null) where.price.lte = f.maxPrice;
  }
  if (f.colors?.length) where.variants = { some: { color: { in: f.colors } } };
  if (f.sizes?.length) {
    where.variants = where.variants
      ? { some: { AND: [{ color: { in: f.colors ?? undefined } }, { size: { in: f.sizes } }] } }
      : { some: { size: { in: f.sizes } } };
  }
  if (f.search) {
    where.OR = [
      { title: { contains: f.search, mode: "insensitive" } },
      { description: { contains: f.search, mode: "insensitive" } },
      { brand: { name: { contains: f.search, mode: "insensitive" } } },
    ];
  }
  return where;
}

function buildOrderBy(sort?: string): Prisma.ProductOrderByWithRelationInput {
  switch (sort) {
    case "newest": return { createdAt: "desc" };
    case "price-asc": return { price: "asc" };
    case "price-desc": return { price: "desc" };
    case "rating": return { rating: "desc" };
    default: return { popularity: "desc" };
  }
}

export async function getProducts(f: ProductFilters) {
  const page = Math.max(1, f.page ?? 1);
  const perPage = f.perPage ?? 12;
  const where = buildWhere(f);
  const [rows, total] = await Promise.all([
    prisma.product.findMany({
      where,
      select: cardSelect,
      orderBy: buildOrderBy(f.sort),
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.product.count({ where }),
  ]);
  return {
    products: rows.map(toCard),
    total,
    page,
    perPage,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
  };
}

export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  const p = await prisma.product.findUnique({
    where: { slug },
    include: {
      brand: true,
      category: true,
      images: { orderBy: { position: "asc" } },
      variants: { orderBy: [{ color: "asc" }, { size: "asc" }] },
    },
  });
  if (!p) return null;
  const card = toCard(p as unknown as RawCard);
  const sizes = Array.from(new Set(p.variants.map((v) => v.size)));
  return {
    ...card,
    sku: p.sku,
    description: p.description,
    material: p.material,
    collection: p.collection,
    categoryName: p.category.name,
    categorySlug: p.category.slug,
    images: p.images.map((i) => i.url),
    variants: p.variants.map((v) => ({
      id: v.id,
      size: v.size,
      color: v.color,
      colorHex: v.colorHex,
      stock: v.stock,
    })),
    sizes,
  };
}

async function findCards(where: Prisma.ProductWhereInput, orderBy: Prisma.ProductOrderByWithRelationInput, take: number) {
  const rows = await prisma.product.findMany({ where, select: cardSelect, orderBy, take });
  return rows.map(toCard);
}

export const getNewArrivals = (take = 8) =>
  unstable_cache(
    () => findCards({ isActive: true, isNewArrival: true }, { createdAt: "desc" }, take),
    ["new-arrivals", String(take)],
    { revalidate: CATALOG_TTL, tags: ["catalog"] },
  )();

export const getTrending = (take = 8) =>
  unstable_cache(
    () => findCards({ isActive: true }, { popularity: "desc" }, take),
    ["trending", String(take)],
    { revalidate: CATALOG_TTL, tags: ["catalog"] },
  )();

export const getBestSellers = (take = 4) =>
  unstable_cache(
    () => findCards({ isActive: true, reviewCount: { gt: 50 } }, { reviewCount: "desc" }, take),
    ["best-sellers", String(take)],
    { revalidate: CATALOG_TTL, tags: ["catalog"] },
  )();

export const getSaleProducts = (take = 8) =>
  unstable_cache(
    () => findCards({ isActive: true, discountPrice: { not: null } }, { popularity: "desc" }, take),
    ["sale-products", String(take)],
    { revalidate: CATALOG_TTL, tags: ["catalog"] },
  )();

export const getFeatured = (take = 4) =>
  unstable_cache(
    () => findCards({ isActive: true, isFeatured: true }, { popularity: "desc" }, take),
    ["featured", String(take)],
    { revalidate: CATALOG_TTL, tags: ["catalog"] },
  )();

/**
 * Smarter "you may also like" — scores candidates by shared category, shared
 * brand, price proximity and popularity instead of just same-department order.
 */
export async function getSimilarProducts(productId: string, take = 8) {
  const base = await prisma.product.findUnique({
    where: { id: productId },
    select: { categoryId: true, brandId: true, department: true, price: true },
  });
  if (!base) return [];
  const basePrice = Number(base.price);

  const pool = await prisma.product.findMany({
    where: {
      isActive: true,
      id: { not: productId },
      OR: [{ categoryId: base.categoryId }, { brandId: base.brandId }, { department: base.department }],
    },
    select: { ...cardSelect, categoryId: true, brandId: true, popularity: true },
    take: 60,
  });

  const scored = pool.map((p) => {
    let score = 0;
    if (p.categoryId === base.categoryId) score += 5;
    if (p.brandId === base.brandId) score += 3;
    const priceDiff = Math.abs(Number(p.price) - basePrice) / Math.max(basePrice, 1);
    score += Math.max(0, 2 - priceDiff * 2); // closer price → up to +2
    score += (p.popularity / 1000) * 0.5; // small popularity nudge
    return { p, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, take).map(({ p }) => toCard(p));
}

/* ---------- Brands & categories ---------- */

export const getBrands = unstable_cache(
  async () => {
    const brands = await prisma.brand.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { products: true } } },
    });
    return brands.map((b) => ({
      id: b.id,
      name: b.name,
      slug: b.slug,
      isPremium: b.isPremium,
      heroImage: b.heroImage,
      description: b.description,
      productCount: b._count.products,
    }));
  },
  ["brands-all"],
  { revalidate: CATALOG_TTL, tags: ["catalog"] },
);

export async function getBrandBySlug(slug: string) {
  return prisma.brand.findUnique({ where: { slug } });
}

export async function getCategoriesByDepartment(department: string) {
  return prisma.category.findMany({
    where: { department },
    orderBy: { name: "asc" },
  });
}

export const getBanners = unstable_cache(
  async () => {
    return prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { position: "asc" },
    });
  },
  ["banners-active"],
  { revalidate: CATALOG_TTL, tags: ["catalog"] },
);
