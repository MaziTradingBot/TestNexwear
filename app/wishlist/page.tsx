"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWishlistStore } from "@/store/wishlist";
import { useCartStore } from "@/store/cart";
import { useToast } from "@/components/ui/toast";
import { useMoney } from "@/components/providers/CurrencyProvider";

export default function WishlistPage() {
  const [mounted, setMounted] = useState(false);
  const items = useWishlistStore((s) => s.items);
  const remove = useWishlistStore((s) => s.remove);
  const addItem = useCartStore((s) => s.addItem);
  const show = useToast((s) => s.show);
  const { format: formatPrice } = useMoney();

  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="container-luxe py-24" />;

  if (items.length === 0) {
    return (
      <div className="container-luxe flex flex-col items-center py-28 text-center">
        <Heart className="h-12 w-12 text-mist" strokeWidth={1} />
        <h1 className="mt-6 font-serif text-3xl font-light uppercase tracking-wide2">Your Wishlist Is Empty</h1>
        <p className="mt-2 text-sm text-stone">Save the pieces you love and revisit them anytime.</p>
        <Link href="/women" className="mt-8">
          <Button>Discover Pieces</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container-luxe py-12">
      <div className="mb-8 border-b border-line pb-6 text-center">
        <h1 className="font-serif text-4xl font-light uppercase tracking-wide2">Wishlist</h1>
        <p className="mt-2 text-sm text-stone">{items.length} saved item{items.length !== 1 && "s"}</p>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.productId} className="group relative">
            <button
              onClick={() => remove(item.productId)}
              aria-label="Remove"
              className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center bg-white/80 text-ink backdrop-blur transition hover:bg-white"
            >
              <X className="h-4 w-4" />
            </button>
            <Link href={`/product/${item.slug}`}>
              <div className="relative aspect-[3/4] overflow-hidden bg-bone">
                {item.image && (
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
              </div>
            </Link>
            <div className="mt-3 space-y-1">
              <p className="text-[0.65rem] uppercase tracking-wide2 text-stone">{item.brand}</p>
              <Link href={`/product/${item.slug}`}>
                <h3 className="truncate text-sm text-ink hover:text-gold">{item.title}</h3>
              </Link>
              <p className="text-sm text-ink">{formatPrice(item.discountPrice ?? item.price)}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              full
              className="mt-3"
              onClick={() => {
                addItem({
                  productId: item.productId,
                  slug: item.slug,
                  title: item.title,
                  brand: item.brand,
                  image: item.image,
                  price: item.discountPrice ?? item.price,
                  quantity: 1,
                });
                remove(item.productId);
                show("Moved to bag");
              }}
            >
              Move To Bag
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
