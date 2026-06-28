"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import type { ProductCard as ProductCardData } from "@/lib/queries";
import { discountPercent } from "@/lib/format";
import { useMoney } from "@/components/providers/CurrencyProvider";
import { useWishlistStore } from "@/store/wishlist";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";

export function ProductCard({
  product,
  priority = false,
  badge,
}: {
  product: ProductCardData;
  priority?: boolean;
  /** Optional contextual label, e.g. "Best Seller". */
  badge?: string;
}) {
  const wished = useWishlistStore((s) => s.items.some((i) => i.productId === product.id));
  const toggle = useWishlistStore((s) => s.toggle);
  const show = useToast((s) => s.show);
  const { format } = useMoney();

  const onSale = product.discountPrice != null;
  const effective = product.discountPrice ?? product.price;
  const pct = onSale ? discountPercent(product.price, product.discountPrice!) : 0;

  function toggleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    toggle({
      productId: product.id,
      slug: product.slug,
      title: product.title,
      brand: product.brand,
      image: product.image,
      price: product.price,
      discountPrice: product.discountPrice,
    });
    show(wished ? "Removed from wishlist" : "Added to wishlist");
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="group relative"
    >
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-bone">
          {product.image && (
            <Image
              src={product.image}
              alt={product.title}
              fill
              priority={priority}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={cn(
                "object-cover transition-all duration-700 ease-out",
                product.hoverImage ? "group-hover:opacity-0" : "group-hover:scale-105",
              )}
            />
          )}
          {product.hoverImage && (
            <Image
              src={product.hoverImage}
              alt=""
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover opacity-0 transition-opacity duration-700 ease-out group-hover:opacity-100"
            />
          )}

          {/* Sold out overlay */}
          {product.outOfStock && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-cream/55">
              <span className="bg-ink px-4 py-1.5 text-[0.62rem] font-medium uppercase tracking-luxe text-white">
                Sold Out
              </span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            {!product.outOfStock && badge && (
              <span className="bg-gold px-2.5 py-1 text-[0.6rem] font-medium uppercase tracking-wide2 text-white">
                {badge}
              </span>
            )}
            {product.outOfStock ? null : onSale && (
              <span className="bg-sale px-2.5 py-1 text-[0.6rem] font-medium uppercase tracking-wide2 text-white">
                -{pct}%
              </span>
            )}
            {!product.outOfStock && product.isNewArrival && !onSale && (
              <span className="bg-white px-2.5 py-1 text-[0.6rem] font-medium uppercase tracking-wide2 text-ink">
                New
              </span>
            )}
          </div>

          {/* Wishlist */}
          <button
            onClick={toggleWishlist}
            aria-label="Toggle wishlist"
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center bg-white/80 text-ink opacity-0 backdrop-blur transition-all duration-300 hover:bg-white group-hover:opacity-100"
          >
            <Heart className={cn("h-4 w-4", wished && "fill-sale text-sale")} />
          </button>

          {/* View action */}
          <div className="absolute inset-x-0 bottom-0 translate-y-full bg-white/95 py-3 text-center text-[0.7rem] font-medium uppercase tracking-wide2 text-ink opacity-0 backdrop-blur transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            View Product
          </div>
        </div>
      </Link>

      <div className="mt-3 space-y-1">
        <p className="text-[0.68rem] uppercase tracking-wide2 text-stone">{product.brand}</p>
        <Link href={`/product/${product.slug}`}>
          <h3 className="truncate text-sm text-ink hover:text-gold">{product.title}</h3>
        </Link>
        <div className="flex items-baseline gap-2">
          <span className={cn("text-sm", onSale ? "text-sale" : "text-ink")}>
            {format(effective)}
          </span>
          {onSale && (
            <span className="text-xs text-mist line-through">{format(product.price)}</span>
          )}
        </div>
        {product.colors.length > 1 && (
          <div className="flex items-center gap-1 pt-1">
            {product.colors.slice(0, 5).map((c) => (
              <span
                key={c.name}
                title={c.name}
                className="h-3 w-3 rounded-full border border-line"
                style={{ backgroundColor: c.hex ?? "#ccc" }}
              />
            ))}
            {product.colors.length > 5 && (
              <span className="text-[0.6rem] text-mist">+{product.colors.length - 5}</span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
