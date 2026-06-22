"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Apple, Wallet, Landmark, Banknote, ShieldCheck, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { CheckoutSteps } from "@/components/checkout/CheckoutSteps";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { useCartStore } from "@/store/cart";
import { useCouponStore } from "@/store/coupon";
import { useCheckoutStore } from "@/store/checkout";
import { useToast } from "@/components/ui/toast";
import { PAYMENT_METHODS } from "@/lib/constants";
import { cn } from "@/lib/cn";

const ICONS: Record<string, React.ReactNode> = {
  CARD: <CreditCard className="h-5 w-5" />,
  APPLE_PAY: <Apple className="h-5 w-5" />,
  GOOGLE_PAY: <Wallet className="h-5 w-5" />,
  BANK_TRANSFER: <Landmark className="h-5 w-5" />,
  CASH_ON_DELIVERY: <Banknote className="h-5 w-5" />,
};

export default function PaymentPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clear);
  const couponCode = useCouponStore((s) => s.coupon?.code ?? null);
  const clearCoupon = useCouponStore((s) => s.clear);
  const { shipping, deliveryMethod, deliveryProvider, rates, setLastOrder, reset } = useCheckoutStore();
  const show = useToast((s) => s.show);

  const [method, setMethod] = useState<string>("CARD");
  const [card, setCard] = useState({ number: "", name: "", expiry: "", cvc: "" });
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (mounted && !shipping) router.replace("/checkout");
    if (mounted && items.filter((i) => !i.savedForLater).length === 0) router.replace("/cart");
  }, [mounted, shipping, items, router]);

  const shippingCost = rates[deliveryMethod]?.price ?? 0;

  async function placeOrder() {
    if (!shipping) return;
    if (method === "CARD" && (card.number.replace(/\s/g, "").length < 12 || !card.name)) {
      setError("Enter your card details to continue (this is a demo — no real charge).");
      return;
    }
    setError("");
    setPlacing(true);
    try {
      const payload = {
        items: items
          .filter((i) => !i.savedForLater)
          .map((i) => ({
            productId: i.productId,
            variantId: i.variantId ?? null,
            title: i.title,
            image: i.image,
            size: i.size ?? null,
            color: i.color ?? null,
            price: i.price,
            quantity: i.quantity,
          })),
        shipping,
        deliveryMethod,
        deliveryProvider,
        paymentMethod: method,
        couponCode,
      };
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not place order. Please try again.");
        setPlacing(false);
        return;
      }
      setLastOrder(data.order);
      clearCart();
      clearCoupon();
      reset();
      show("Order placed");
      router.push("/checkout/success");
    } catch {
      setError("Something went wrong. Please try again.");
      setPlacing(false);
    }
  }

  if (!mounted) return <div className="container-luxe py-24" />;

  return (
    <div className="container-luxe py-12">
      <CheckoutSteps current={1} />
      <div className="grid gap-12 lg:grid-cols-[1fr_380px]">
        <div className="space-y-8">
          <div className="flex items-center gap-2 text-xs text-stone">
            <Lock className="h-4 w-4 text-gold" />
            Secure checkout · Payment simulation mode (no real charges)
          </div>

          <section>
            <h2 className="mb-5 font-serif text-2xl font-light uppercase tracking-wide2">Payment Method</h2>
            <div className="space-y-3">
              {PAYMENT_METHODS.map((m) => (
                <div key={m.id}>
                  <button
                    onClick={() => setMethod(m.id)}
                    className={cn(
                      "flex w-full items-center gap-4 border p-4 text-left transition",
                      method === m.id ? "border-ink ring-1 ring-ink" : "border-line hover:border-ink",
                    )}
                  >
                    <span className="text-ink">{ICONS[m.id]}</span>
                    <span className="flex-1">
                      <span className="block text-sm font-medium text-ink">{m.label}</span>
                      <span className="block text-xs text-stone">{m.hint}</span>
                    </span>
                    <span className={cn("h-4 w-4 rounded-full border", method === m.id ? "border-ink bg-ink" : "border-line")} />
                  </button>

                  {/* Method-specific panel */}
                  {method === m.id && m.id === "CARD" && (
                    <div className="mt-3 grid gap-4 border border-line bg-bone p-5 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <Field label="Card Number">
                          <Input
                            inputMode="numeric"
                            placeholder="4242 4242 4242 4242"
                            value={card.number}
                            onChange={(e) => setCard((c) => ({ ...c, number: e.target.value }))}
                          />
                        </Field>
                      </div>
                      <div className="sm:col-span-2">
                        <Field label="Name on Card">
                          <Input value={card.name} onChange={(e) => setCard((c) => ({ ...c, name: e.target.value }))} />
                        </Field>
                      </div>
                      <Field label="Expiry">
                        <Input placeholder="MM/YY" value={card.expiry} onChange={(e) => setCard((c) => ({ ...c, expiry: e.target.value }))} />
                      </Field>
                      <Field label="CVC">
                        <Input placeholder="123" value={card.cvc} onChange={(e) => setCard((c) => ({ ...c, cvc: e.target.value }))} />
                      </Field>
                      <p className="sm:col-span-2 text-[0.7rem] text-mist">Accepts Visa & Mastercard · Demo only, no real charge.</p>
                    </div>
                  )}
                  {method === m.id && (m.id === "APPLE_PAY" || m.id === "GOOGLE_PAY") && (
                    <div className="mt-3 border border-line bg-bone p-5 text-sm text-stone">
                      You&apos;ll confirm payment with {m.label} on the next step. (Simulated)
                    </div>
                  )}
                  {method === m.id && m.id === "BANK_TRANSFER" && (
                    <div className="mt-3 space-y-1 border border-line bg-bone p-5 text-sm text-stone">
                      <p className="text-ink">Transfer to:</p>
                      <p>NexWear Ltd · IBAN: GB00 NEXW 0000 0000 0000 00</p>
                      <p>Reference your order number. Order ships once funds clear.</p>
                    </div>
                  )}
                  {method === m.id && m.id === "CASH_ON_DELIVERY" && (
                    <div className="mt-3 border border-line bg-bone p-5 text-sm text-stone">
                      Pay in cash upon goods receipt. Available in select countries.
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {error && <p className="text-sm text-sale">{error}</p>}

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="outline" onClick={() => router.push("/checkout")}>
              Back
            </Button>
            <Button size="lg" full onClick={placeOrder} disabled={placing}>
              {placing ? "Placing Order…" : "Place Order"}
            </Button>
          </div>

          <p className="flex items-center justify-center gap-2 text-xs text-stone">
            <ShieldCheck className="h-4 w-4 text-gold" /> Your information is encrypted and secure.
          </p>
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <OrderSummary shippingCost={shippingCost} />
        </aside>
      </div>
    </div>
  );
}
