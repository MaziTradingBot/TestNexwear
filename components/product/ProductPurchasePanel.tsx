"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Minus, Plus, Ruler, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Stars } from "@/components/ui/stars";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";
import { useToast } from "@/components/ui/toast";
import { useT } from "@/components/providers/I18nProvider";
import { formatPrice, discountPercent } from "@/lib/format";
import type { ProductDetail } from "@/lib/queries";
import { cn } from "@/lib/cn";

export function ProductPurchasePanel({ product }: { product: ProductDetail }) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const toggleWish = useWishlistStore((s) => s.toggle);
  const wished = useWishlistStore((s) => s.items.some((i) => i.productId === product.id));
  const show = useToast((s) => s.show);
  const t = useT();

  const colors = useMemo(() => {
    const map = new Map<string, string | null>();
    for (const v of product.variants) if (!map.has(v.color)) map.set(v.color, v.colorHex);
    return Array.from(map, ([name, hex]) => ({ name, hex }));
  }, [product.variants]);

  const [color, setColor] = useState(colors[0]?.name ?? "");
  const [size, setSize] = useState<string>("");
  const [qty, setQty] = useState(1);
  const [sizeChart, setSizeChart] = useState(false);
  const [error, setError] = useState("");

  const sizesForColor = product.variants.filter((v) => v.color === color);
  const selectedVariant = product.variants.find((v) => v.color === color && v.size === size);
  const onSale = product.discountPrice != null;
  const effective = product.discountPrice ?? product.price;

  function buildLine() {
    return {
      productId: product.id,
      variantId: selectedVariant?.id,
      slug: product.slug,
      title: product.title,
      brand: product.brand,
      image: product.image,
      price: effective,
      size,
      color,
      quantity: qty,
    };
  }

  function handleAdd(buyNow = false) {
    if (!size) {
      setError(t("product.selectSize"));
      return;
    }
    setError("");
    addItem(buildLine());
    show("Added to bag");
    if (buyNow) router.push("/checkout");
  }

  return (
    <div>
      <p className="text-[0.72rem] uppercase tracking-luxe text-stone">{product.brand}</p>
      <h1 className="mt-2 font-serif text-3xl font-light text-ink md:text-4xl">{product.title}</h1>

      <div className="mt-3 flex items-center gap-3">
        <Stars rating={product.rating} />
        <span className="text-xs text-stone">
          {Number(product.rating).toFixed(1)} ({product.reviewCount} reviews)
        </span>
      </div>

      <div className="mt-5 flex items-baseline gap-3">
        <span className={cn("text-2xl", onSale ? "text-sale" : "text-ink")}>
          {formatPrice(effective)}
        </span>
        {onSale && (
          <>
            <span className="text-base text-mist line-through">{formatPrice(product.price)}</span>
            <span className="bg-sale px-2 py-0.5 text-[0.6rem] font-medium uppercase tracking-wide2 text-white">
              -{discountPercent(product.price, product.discountPrice!)}%
            </span>
          </>
        )}
      </div>

      {/* Color */}
      <div className="mt-8">
        <p className="label">
          {t("product.color")}: <span className="text-ink">{color}</span>
        </p>
        <div className="flex flex-wrap gap-2.5">
          {colors.map((c) => (
            <button
              key={c.name}
              onClick={() => {
                setColor(c.name);
                setSize("");
              }}
              title={c.name}
              aria-label={c.name}
              className={cn(
                "h-9 w-9 rounded-full border transition",
                color === c.name ? "ring-2 ring-ink ring-offset-2" : "border-line",
              )}
              style={{ backgroundColor: c.hex ?? "#ccc" }}
            />
          ))}
        </div>
      </div>

      {/* Size */}
      <div className="mt-7">
        <div className="mb-2 flex items-center justify-between">
          <p className="label mb-0">{t("product.size")}</p>
          <button
            onClick={() => setSizeChart(true)}
            className="flex items-center gap-1.5 text-[0.7rem] uppercase tracking-wide2 text-stone hover:text-ink"
          >
            <Ruler className="h-3.5 w-3.5" /> {t("product.sizeGuide")}
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {sizesForColor.map((v) => {
            const oos = v.stock <= 0;
            return (
              <button
                key={v.id}
                disabled={oos}
                onClick={() => {
                  setSize(v.size);
                  setError("");
                }}
                className={cn(
                  "min-w-[3rem] border px-3 py-2.5 text-sm transition",
                  size === v.size ? "border-ink bg-ink text-white" : "border-line hover:border-ink",
                  oos && "cursor-not-allowed text-mist line-through opacity-50 hover:border-line",
                )}
              >
                {v.size}
              </button>
            );
          })}
        </div>
        {error && <p className="mt-2 text-xs text-sale">{error}</p>}
        {selectedVariant && selectedVariant.stock > 0 && selectedVariant.stock <= 5 && (
          <p className="mt-2 text-xs text-sale">Only {selectedVariant.stock} left in stock</p>
        )}
      </div>

      {/* Quantity */}
      <div className="mt-7">
        <p className="label">{t("product.quantity")}</p>
        <div className="inline-flex items-center border border-line">
          <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-4 py-3 hover:bg-bone" aria-label="Decrease">
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-10 text-center text-sm">{qty}</span>
          <button onClick={() => setQty((q) => Math.min(10, q + 1))} className="px-4 py-3 hover:bg-bone" aria-label="Increase">
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 space-y-3">
        <Button onClick={() => handleAdd(false)} full size="lg">
          {t("common.addToBag")}
        </Button>
        <div className="grid grid-cols-2 gap-3">
          <Button onClick={() => handleAdd(true)} variant="gold" size="lg">
            {t("common.buyNow")}
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => {
              toggleWish({
                productId: product.id,
                slug: product.slug,
                title: product.title,
                brand: product.brand,
                image: product.image,
                price: product.price,
                discountPrice: product.discountPrice,
              });
              show(wished ? "Removed from wishlist" : "Added to wishlist");
            }}
          >
            <Heart className={cn("h-4 w-4", wished && "fill-sale text-sale")} />
            {t("common.wishlist")}
          </Button>
        </div>
      </div>

      {/* Trust strip */}
      <ul className="mt-8 space-y-2 border-t border-line pt-6 text-xs text-stone">
        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-gold" /> Free express shipping over $150</li>
        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-gold" /> Free 30-day returns</li>
        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-gold" /> Secure checkout · Pay on delivery available</li>
      </ul>

      <Dialog open={sizeChart} onClose={() => setSizeChart(false)} title="Size Guide">
        <SizeChart />
      </Dialog>
    </div>
  );
}

function SizeChart() {
  const rows = [
    ["XS", "32-34", "26-28", "34-36"],
    ["S", "35-37", "29-31", "37-39"],
    ["M", "38-40", "32-34", "40-42"],
    ["L", "41-43", "35-37", "43-45"],
    ["XL", "44-46", "38-40", "46-48"],
    ["XXL", "47-49", "41-43", "49-51"],
  ];
  return (
    <div>
      <p className="mb-4 text-sm text-stone">All measurements are in inches. For the best fit, measure against a garment you already own.</p>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-ink text-left">
            <th className="py-3 font-medium uppercase tracking-wide2 text-[0.7rem]">Size</th>
            <th className="py-3 font-medium uppercase tracking-wide2 text-[0.7rem]">Chest</th>
            <th className="py-3 font-medium uppercase tracking-wide2 text-[0.7rem]">Waist</th>
            <th className="py-3 font-medium uppercase tracking-wide2 text-[0.7rem]">Hip</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r[0]} className="border-b border-line">
              {r.map((cell, i) => (
                <td key={i} className={cn("py-3", i === 0 && "font-medium")}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
