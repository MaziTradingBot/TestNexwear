import Image from "next/image";
import Link from "next/link";
import { HeroSlider, type HeroBanner } from "@/components/home/HeroSlider";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { EditorialSplit } from "@/components/home/EditorialSplit";
import { BrandMarquee } from "@/components/home/BrandMarquee";
import { FlashSale } from "@/components/home/FlashSale";
import { ProductCarousel } from "@/components/product/ProductCarousel";
import { ProductGrid } from "@/components/product/ProductGrid";
import { SectionHeader } from "@/components/layout/SectionHeader";
import {
  getBanners,
  getBrands,
  getNewArrivals,
  getTrending,
  getBestSellers,
  getSaleProducts,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

const FALLBACK_BANNERS: HeroBanner[] = [
  {
    id: "fallback-1",
    eyebrow: "Summer Sale",
    title: "Up To 50% Off",
    subtitle: "The season's most-wanted pieces, now reduced.",
    ctaLabel: "Shop Sale",
    ctaHref: "/sale",
    imageUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=2000&q=80",
  },
];

const INSTAGRAM = [
  "1485462537746-965f33f7f6a7", "1539008835657-9e8e9680c956",
  "1521572163474-6864f9cf17ab", "1542291026-7eec264c27ff",
  "1572804013309-59a88b7e92f1", "1551028719-00167b16eac5",
];

export default async function HomePage() {
  const [banners, brands, newArrivals, trending, bestSellers, saleProducts] =
    await Promise.all([
      getBanners(),
      getBrands(),
      getNewArrivals(8),
      getTrending(8),
      getBestSellers(4),
      getSaleProducts(10),
    ]);

  const heroBanners: HeroBanner[] = banners.length
    ? banners.map((b) => ({
        id: b.id,
        eyebrow: b.eyebrow,
        title: b.title,
        subtitle: b.subtitle,
        ctaLabel: b.ctaLabel,
        ctaHref: b.ctaHref,
        imageUrl: b.imageUrl,
      }))
    : FALLBACK_BANNERS;

  return (
    <div className="space-y-20 pb-4">
      <HeroSlider banners={heroBanners} />

      {/* Category grid */}
      <section className="container-luxe">
        <SectionHeader eyebrow="Shop By" title="Categories" centered />
        <CategoryGrid />
      </section>

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="container-luxe">
          <SectionHeader eyebrow="Just In" title="New Arrivals" href="/women" />
          <ProductCarousel products={newArrivals} />
        </section>
      )}

      {/* Editorial split */}
      <section className="container-luxe">
        <EditorialSplit />
      </section>

      {/* Trending */}
      {trending.length > 0 && (
        <section className="container-luxe">
          <SectionHeader eyebrow="Most Loved" title="Trending Now" href="/men" />
          <ProductGrid products={trending.slice(0, 8)} />
        </section>
      )}

      {/* Flash sale */}
      <FlashSale products={saleProducts} />

      {/* Premium promo banner */}
      <section className="container-luxe">
        <Link href="/brands" className="group relative block overflow-hidden">
          <div className="relative aspect-[21/9] w-full">
            <Image
              src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=2000&q=80"
              alt="Premium Brands"
              fill
              sizes="100vw"
              className="object-cover transition-transform [transition-duration:1400ms] ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-ink/30" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white">
              <p className="eyebrow mb-3 text-white/80">The Designer Edit</p>
              <h2 className="font-serif text-4xl font-light uppercase tracking-wide2 md:text-6xl">
                Premium Brands
              </h2>
              <span className="btn-label mt-7">Discover</span>
            </div>
          </div>
        </Link>
      </section>

      {/* Best sellers */}
      {bestSellers.length > 0 && (
        <section className="container-luxe">
          <SectionHeader eyebrow="Customer Favourites" title="Best Sellers" href="/sale" />
          <ProductGrid products={bestSellers} />
        </section>
      )}

      {/* Brand marquee */}
      <BrandMarquee brands={brands.map((b) => ({ name: b.name, slug: b.slug }))} />

      {/* Instagram gallery */}
      <section className="container-luxe">
        <SectionHeader eyebrow="@nexwear" title="Follow Our Journey" centered />
        <div className="grid grid-cols-3 gap-2 md:grid-cols-6">
          {INSTAGRAM.map((id) => (
            <a
              key={id}
              href="#"
              className="group relative aspect-square overflow-hidden bg-bone"
            >
              <Image
                src={`https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=500&q=80`}
                alt="NexWear on Instagram"
                fill
                sizes="(max-width: 768px) 33vw, 16vw"
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-ink/0 transition-colors group-hover:bg-ink/20" />
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
