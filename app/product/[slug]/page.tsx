import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getProductBySlug, getSimilarProducts } from "@/lib/queries";
import { userHasPurchased, userHasReviewed } from "@/lib/reviews";
import { SITE } from "@/lib/constants";
import { formatPrice } from "@/lib/format";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductPurchasePanel } from "@/components/product/ProductPurchasePanel";
import { ProductShare } from "@/components/product/ProductShare";
import { ProductReviews, type ReviewItem } from "@/components/product/ProductReviews";
import { RecentlyViewedTracker } from "@/components/product/RecentlyViewedTracker";
import { RecentlyViewed } from "@/components/product/RecentlyViewed";
import { ProductCarousel } from "@/components/product/ProductCarousel";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { Accordion } from "@/components/ui/accordion";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product) return { title: "Product Not Found" };
  const price = product.discountPrice ?? product.price;
  return {
    title: `${product.title} — ${product.brand}`,
    description: product.description.slice(0, 160),
    openGraph: {
      title: `${product.title} — ${product.brand}`,
      description: `${formatPrice(price)} · ${product.brand}`,
      images: product.image ? [{ url: product.image }] : [],
      type: "website",
    },
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  const [similar, reviewRows] = await Promise.all([
    getSimilarProducts(product.id, 8),
    prisma.review.findMany({
      where: { productId: product.id, isApproved: true },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { user: { select: { name: true } } },
    }),
  ]);

  const reviews: ReviewItem[] = reviewRows.map((r) => ({
    id: r.id,
    rating: r.rating,
    title: r.title,
    comment: r.comment,
    author: r.user.name ?? "NexWear Customer",
    isVerified: r.isVerified,
    images: r.images ?? [],
    createdAt: r.createdAt.toISOString(),
  }));

  // Review eligibility: only verified buyers who haven't already reviewed.
  const session = await getServerSession(authOptions);
  const isAuthed = Boolean(session?.user?.id);
  let isPurchaser = false;
  let hasReviewed = false;
  if (session?.user?.id) {
    [isPurchaser, hasReviewed] = await Promise.all([
      userHasPurchased(session.user.id, product.id),
      userHasReviewed(session.user.id, product.id),
    ]);
  }

  const price = product.discountPrice ?? product.price;
  const departmentLabel = product.department[0].toUpperCase() + product.department.slice(1);

  // Material-aware care note for clothing.
  const m = (product.material ?? "").toLowerCase();
  const careNote =
    m.includes("wool") || m.includes("cashmere")
      ? "Wool / cashmere: hand wash cold or dry clean to protect the fibres."
      : m.includes("silk")
        ? "Silk: dry clean or gentle cold hand wash; do not wring."
        : m.includes("leather") || m.includes("suede")
          ? "Leather / suede: wipe clean, treat with a suitable protector and keep dry."
          : m.includes("linen")
            ? "Linen: natural creasing is part of its character; iron while slightly damp."
            : m.includes("denim")
              ? "Denim: wash inside out in cold water to keep the colour rich."
              : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    image: product.images,
    description: product.description,
    sku: product.sku,
    brand: { "@type": "Brand", name: product.brand },
    aggregateRating:
      product.reviewCount > 0
        ? { "@type": "AggregateRating", ratingValue: product.rating, reviewCount: product.reviewCount }
        : undefined,
    offers: {
      "@type": "Offer",
      url: `${SITE.url}/product/${product.slug}`,
      priceCurrency: "USD",
      price: price.toFixed(2),
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <RecentlyViewedTracker
        product={{
          productId: product.id,
          slug: product.slug,
          title: product.title,
          brand: product.brand,
          image: product.image,
          price: product.price,
          discountPrice: product.discountPrice,
        }}
      />

      <div className="container-luxe py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-stone">
          <Link href="/" className="hover:text-ink">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href={`/${product.department}`} className="hover:text-ink">{departmentLabel}</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href={`/category/${product.categorySlug}`} className="hover:text-ink">{product.categoryName}</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="truncate text-ink">{product.title}</span>
        </nav>

        {/* Gallery + panel */}
        <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:gap-16">
          <ProductGallery images={product.images} title={product.title} />
          <div className="lg:sticky lg:top-28 lg:self-start">
            <ProductPurchasePanel product={product} />

            <div className="mt-10">
              <Accordion
                defaultOpen={0}
                items={[
                  { title: "Description", content: <p>{product.description}</p> },
                  {
                    title: "Details & Materials",
                    content: (
                      <ul className="space-y-1.5">
                        <li>Material: {product.material ?? "Premium fabric"}</li>
                        <li>Collection: {product.collection ?? "NexWear"}</li>
                        <li>SKU: {product.sku}</li>
                        <li>Model wears size M / EU 40</li>
                      </ul>
                    ),
                  },
                  {
                    title: "Care Instructions",
                    content: (
                      <ul className="space-y-1.5">
                        <li>Machine wash cold with similar colours.</li>
                        <li>Do not bleach. Tumble dry low or hang to dry.</li>
                        <li>Cool iron on reverse if needed; do not iron over prints.</li>
                        {careNote && <li className="text-ink">{careNote}</li>}
                      </ul>
                    ),
                  },
                  {
                    title: "Shipping & Returns",
                    content: (
                      <div className="space-y-2">
                        <p>Standard delivery: 5–10 business days. Express: 1–3 business days.</p>
                        <p>Free returns within 30 days. Pay on delivery available in select countries.</p>
                      </div>
                    ),
                  },
                ]}
              />
            </div>

            <ProductShare title={product.title} />
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="container-luxe py-12">
        <ProductReviews
          productId={product.id}
          rating={product.rating}
          reviewCount={product.reviewCount}
          reviews={reviews}
          isAuthed={isAuthed}
          isPurchaser={isPurchaser}
          hasReviewed={hasReviewed}
        />
      </div>

      {/* Similar */}
      {similar.length > 0 && (
        <section className="container-luxe py-8">
          <SectionHeader eyebrow="You May Also Like" title="Complete The Look" href={`/${product.department}`} />
          <ProductCarousel products={similar} />
        </section>
      )}

      <RecentlyViewed excludeId={product.id} />
    </div>
  );
}
