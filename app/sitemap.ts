import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { SITE } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE.url;
  const staticRoutes = [
    "", "/women", "/men", "/shoes", "/brands", "/sale",
    "/about", "/contact", "/faq", "/privacy", "/terms", "/login", "/register",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  let dynamicRoutes: MetadataRoute.Sitemap = [];
  try {
    const [products, brands, categories] = await Promise.all([
      prisma.product.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true }, take: 1000 }),
      prisma.brand.findMany({ select: { slug: true } }),
      prisma.category.findMany({ select: { slug: true } }),
    ]);
    dynamicRoutes = [
      ...products.map((p) => ({
        url: `${base}/product/${p.slug}`,
        lastModified: p.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })),
      ...brands.map((b) => ({ url: `${base}/brands/${b.slug}`, changeFrequency: "monthly" as const, priority: 0.5 })),
      ...categories.map((c) => ({ url: `${base}/category/${c.slug}`, changeFrequency: "weekly" as const, priority: 0.5 })),
    ];
  } catch {
    // DB not reachable at build/preview — static routes still emitted
  }

  return [...staticRoutes, ...dynamicRoutes];
}
