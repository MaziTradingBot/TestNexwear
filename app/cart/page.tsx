"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus, X, ShoppingBag, Tag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore, type CartLine } from "@/store/cart";
import { useCouponStore } from "@/store/coupon";
import { usePointsStore } from "@/store/points";
import { PointsRedeem } from "@/components/checkout/PointsRedeem";
import { useToast } from "@/components/ui/toast";
import { useT } from "@/components/providers/I18nProvider";
import { useMoney } from "@/components/providers/CurrencyProvider";
import { cn } from "@/lib/cn";

const FREE_SHIP_THRESHOLD = 150;

export default function CartPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const toggleSave = useCartStore((s) => s.toggleSaveForLater);
  const addItem = useCartStore((s) => s.addItem);
  const subtotal = useCartStore((s) => s.subtotal());

  const { coupon, apply, clear, discountFor } = useCouponStore();
  const show = useToast((s) => s.show);
  const t = useT();
  const { format: formatPrice } = useMoney();

  const [code, setCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [applying, setApplying] = useState(false);

  useEffect(() => setMounted(true), []);

  const active = items.filter((i) => !i.savedForLater);
  const saved = items.filter((i) => i.savedForLater);
  const discount = discountFor(subtotal);
  const pointsDiscount = usePointsStore((s) => s.discountFor(Math.max(0, subtotal - discount)));
  const remaining = Math.max(0, FREE_SHIP_THRESHOLD - subtotal);

  async function applyCoupon(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setApplying(true);
    setCouponError("");
    try {
      const res = await fetch("/api/coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.coupon) {
        apply(data.coupon);
        show(`Coupon ${data.coupon.code} applied`);
        setCode("");
      } else {
        setCouponError(data.error ?? "Invalid coupon code");
      }
    } catch {
      setCouponError("Could not apply coupon");
    } finally {
      setApplying(false);
    }
  }

  if (!mounted) return <div className="container-luxe py-24" />;

  if (active.length === 0 && saved.length === 0) {
    return (
      <div className="container-luxe flex flex-col items-center py-28 text-center">
        <ShoppingBag className="h-12 w-12 text-mist" strokeWidth={1} />
        <h1 className="mt-6 font-serif text-3xl font-light uppercase tracking-wide2">{t("cart.empty")}</h1>
        <p className="mt-2 text-sm text-stone">Discover the latest arrivals and find something you love.</p>
        <Link href="/women" className="mt-8">
          <Button>Start Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container-luxe py-12">
      <h1 className="mb-2 font-serif text-4xl font-light uppercase tracking-wide2">{t("cart.title")}</h1>
      <p className="mb-8 text-sm text-stone">{active.length} item{active.length !== 1 && "s"}</p>

      <div className="grid gap-12 lg:grid-cols-[1fr_380px]">
        {/* Items */}
        <div>
          {/* Free shipping progress */}
          <div className="mb-8 border border-line bg-bone p-5">
            {remaining > 0 ? (
              <p className="text-sm text-ink">
                You&apos;re <span className="font-medium">{formatPrice(remaining)}</span> away from free express shipping.
              </p>
            ) : (
              <p className="text-sm text-gold">✓ You&apos;ve unlocked free express shipping.</p>
            )}
            <div className="mt-3 h-1 w-full bg-line">
              <div
                className="h-full bg-gold transition-all duration-500"
                style={{ width: `${Math.min(100, (subtotal / FREE_SHIP_THRESHOLD) * 100)}%` }}
              />
            </div>
          </div>

          <ul className="divide-y divide-line border-y border-line">
            {active.map((item) => (
              <CartRow
                key={`${item.productId}-${item.variantId}-${item.size}-${item.color}`}
                item={item}
                onQty={(q) => updateQuantity(item, q)}
                onRemove={() => removeItem(item)}
                onSave={() => toggleSave(item)}
              />
            ))}
          </ul>

          {/* Saved for later */}
          {saved.length > 0 && (
            <div className="mt-12">
              <h2 className="mb-4 font-serif text-xl font-light uppercase tracking-wide2">Saved For Later</h2>
              <ul className="divide-y divide-line border-y border-line">
                {saved.map((item) => (
                  <CartRow
                    key={`saved-${item.productId}-${item.size}-${item.color}`}
                    item={item}
                    saved
                    onRemove={() => removeItem(item)}
                    onMove={() => {
                      toggleSave(item);
                      show("Moved to bag");
                    }}
                  />
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Summary */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="border border-line p-6">
            <h2 className="mb-5 text-sm font-medium uppercase tracking-wide2">{t("cart.summary")}</h2>

            {/* Coupon */}
            <form onSubmit={applyCoupon} className="mb-5">
              {coupon ? (
                <div className="flex items-center justify-between border border-gold bg-gold/5 px-3 py-2.5 text-sm">
                  <span className="flex items-center gap-2 text-gold">
                    <Tag className="h-4 w-4" /> {coupon.code}
                  </span>
                  <button type="button" onClick={() => clear()} className="text-stone hover:text-ink">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex">
                    <input
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      placeholder="Promo code"
                      className="flex-1 border border-line px-3 py-2.5 text-sm focus:border-ink focus:outline-none"
                    />
                    <Button type="submit" variant="outline" size="sm" disabled={applying} className="border-l-0">
                      {applying ? "…" : "Apply"}
                    </Button>
                  </div>
                  {couponError && <p className="mt-1.5 text-xs text-sale">{couponError}</p>}
                  <p className="mt-1.5 text-[0.7rem] text-mist">Try WELCOME10 or SUMMER50</p>
                </>
              )}
            </form>

            {/* Loyalty points redemption */}
            <PointsRedeem />

            <dl className="space-y-3 border-t border-line pt-5 text-sm">
              <div className="flex justify-between">
                <dt className="text-stone">{t("cart.subtotal")}</dt>
                <dd>{formatPrice(subtotal)}</dd>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-gold">
                  <dt>{t("cart.discount")}</dt>
                  <dd>−{formatPrice(discount)}</dd>
                </div>
              )}
              {pointsDiscount > 0 && (
                <div className="flex justify-between text-gold">
                  <dt>Points</dt>
                  <dd>−{formatPrice(pointsDiscount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-stone">{t("cart.shipping")}</dt>
                <dd className="text-stone">—</dd>
              </div>
              <div className="flex justify-between border-t border-line pt-4 text-base font-medium">
                <dt>{t("cart.total")}</dt>
                <dd>{formatPrice(Math.max(0, subtotal - discount - pointsDiscount))}</dd>
              </div>
            </dl>

            <Button full size="lg" className="mt-6" onClick={() => router.push("/checkout")} disabled={active.length === 0}>
              {t("common.checkout")} <ArrowRight className="h-4 w-4" />
            </Button>
            <Link href="/women" className="mt-3 block text-center text-xs text-stone underline-offset-4 hover:underline">
              Continue Shopping
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

function CartRow({
  item,
  onQty,
  onRemove,
  onSave,
  onMove,
  saved = false,
}: {
  item: CartLine;
  onQty?: (q: number) => void;
  onRemove: () => void;
  onSave?: () => void;
  onMove?: () => void;
  saved?: boolean;
}) {
  const { format: formatPrice } = useMoney();
  return (
    <li className="flex gap-4 py-6">
      <Link href={`/product/${item.slug}`} className="relative aspect-[3/4] w-24 shrink-0 overflow-hidden bg-bone">
        {item.image && <Image src={item.image} alt={item.title} fill sizes="96px" className="object-cover" />}
      </Link>
      <div className="flex flex-1 flex-col">
        <div className="flex justify-between gap-4">
          <div>
            {item.brand && <p className="text-[0.65rem] uppercase tracking-wide2 text-stone">{item.brand}</p>}
            <Link href={`/product/${item.slug}`}>
              <h3 className="text-sm text-ink hover:text-gold">{item.title}</h3>
            </Link>
            <p className="mt-1 text-xs text-stone">
              {item.color && <>Color: {item.color}</>}
              {item.size && <span className="ml-3">Size: {item.size}</span>}
            </p>
          </div>
          <button onClick={onRemove} aria-label="Remove" className="h-fit text-mist hover:text-ink">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-auto flex items-end justify-between pt-4">
          {saved ? (
            <button onClick={onMove} className="text-xs font-medium uppercase tracking-wide2 text-ink underline-offset-4 hover:underline">
              Move To Bag
            </button>
          ) : (
            <div className="flex items-center gap-4">
              <div className="inline-flex items-center border border-line">
                <button onClick={() => onQty?.(item.quantity - 1)} className="px-2.5 py-2 hover:bg-bone" aria-label="Decrease">
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-8 text-center text-sm">{item.quantity}</span>
                <button onClick={() => onQty?.(item.quantity + 1)} className="px-2.5 py-2 hover:bg-bone" aria-label="Increase">
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
              <button onClick={onSave} className={cn("text-xs text-stone underline-offset-4 hover:text-ink hover:underline")}>
                Save for later
              </button>
            </div>
          )}
          <p className="text-sm font-medium">{formatPrice(item.price * item.quantity)}</p>
        </div>
      </div>
    </li>
  );
}
