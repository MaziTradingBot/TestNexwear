"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Truck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { CheckoutSteps } from "@/components/checkout/CheckoutSteps";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { useCartStore } from "@/store/cart";
import { useCheckoutStore, type DeliveryMethod, type RateInfo } from "@/store/checkout";
import { shippingSchema } from "@/lib/validations/checkout";
import { COUNTRIES, DELIVERY_PARTNERS } from "@/lib/constants";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/cn";

type Rates = Partial<Record<DeliveryMethod, RateInfo>>;

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  const itemCount = useCartStore((s) => s.totalItems());

  const {
    shipping, deliveryMethod, deliveryProvider,
    setShipping, setDeliveryMethod, setDeliveryProvider, setRates,
  } = useCheckoutStore();

  const [form, setForm] = useState({
    fullName: shipping?.fullName ?? "",
    email: shipping?.email ?? "",
    phone: shipping?.phone ?? "",
    country: shipping?.country ?? "United States",
    city: shipping?.city ?? "",
    address: shipping?.address ?? "",
    postalCode: shipping?.postalCode ?? "",
  });
  const [rates, setLocalRates] = useState<Rates>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (session?.user?.email && !form.email) {
      setForm((f) => ({ ...f, email: session.user.email ?? "" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  // Redirect if cart empty
  useEffect(() => {
    if (mounted && itemCount === 0) router.replace("/cart");
  }, [mounted, itemCount, router]);

  // Fetch shipping rates when country changes
  useEffect(() => {
    let active = true;
    fetch(`/api/shipping?country=${encodeURIComponent(form.country)}`)
      .then((r) => r.json())
      .then((data) => {
        if (!active) return;
        setLocalRates(data.rates ?? {});
        setRates(data.rates ?? {});
      })
      .catch(() => setLocalRates({}));
    return () => {
      active = false;
    };
  }, [form.country, setRates]);

  const selectedRate = rates[deliveryMethod];
  const shippingCost = selectedRate?.price ?? 0;

  function update(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const result = shippingSchema.safeParse(form);
    if (!result.success) {
      const errs: Record<string, string> = {};
      for (const issue of result.error.issues) errs[issue.path[0] as string] = issue.message;
      setErrors(errs);
      return;
    }
    setErrors({});
    setShipping(result.data);
    router.push("/checkout/payment");
  }

  if (!mounted) return <div className="container-luxe py-24" />;

  return (
    <div className="container-luxe py-12">
      <CheckoutSteps current={0} />
      <div className="grid gap-12 lg:grid-cols-[1fr_380px]">
        <form onSubmit={submit} className="space-y-10">
          {/* Shipping info */}
          <section>
            <h2 className="mb-5 font-serif text-2xl font-light uppercase tracking-wide2">Shipping Information</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field label="Full Name" error={errors.fullName}>
                  <Input value={form.fullName} onChange={(e) => update("fullName", e.target.value)} />
                </Field>
              </div>
              <Field label="Email" error={errors.email}>
                <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} />
              </Field>
              <Field label="Phone" error={errors.phone}>
                <Input value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+1 555 000 0000" />
              </Field>
              <Field label="Country" error={errors.country}>
                <select
                  value={form.country}
                  onChange={(e) => update("country", e.target.value)}
                  className="w-full border border-line bg-white px-4 py-3 text-sm focus:border-ink focus:outline-none"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Field>
              <Field label="City" error={errors.city}>
                <Input value={form.city} onChange={(e) => update("city", e.target.value)} />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Street Address" error={errors.address}>
                  <Input value={form.address} onChange={(e) => update("address", e.target.value)} />
                </Field>
              </div>
              <Field label="Postal Code" error={errors.postalCode}>
                <Input value={form.postalCode} onChange={(e) => update("postalCode", e.target.value)} />
              </Field>
            </div>
          </section>

          {/* Delivery method */}
          <section>
            <h2 className="mb-5 font-serif text-2xl font-light uppercase tracking-wide2">Delivery Method</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <DeliveryOption
                icon={<Truck className="h-5 w-5" />}
                title="Standard Delivery"
                eta={rates.STANDARD ? `${rates.STANDARD.etaDaysMin}–${rates.STANDARD.etaDaysMax} days` : "5–10 days"}
                price={rates.STANDARD?.price ?? 0}
                selected={deliveryMethod === "STANDARD"}
                onClick={() => setDeliveryMethod("STANDARD")}
              />
              <DeliveryOption
                icon={<Zap className="h-5 w-5" />}
                title="Express Delivery"
                eta={rates.EXPRESS ? `${rates.EXPRESS.etaDaysMin}–${rates.EXPRESS.etaDaysMax} days` : "1–3 days"}
                price={rates.EXPRESS?.price ?? 0}
                selected={deliveryMethod === "EXPRESS"}
                onClick={() => setDeliveryMethod("EXPRESS")}
              />
            </div>

            {/* Delivery partner */}
            <div className="mt-6">
              <p className="label">Delivery Partner</p>
              <div className="flex flex-wrap gap-2">
                {DELIVERY_PARTNERS.map((p) => {
                  const id = p.toUpperCase().replace(/[^A-Z]/g, "_").replace(/_+/g, "_");
                  const value =
                    p === "Amazon Logistics" ? "AMAZON_LOGISTICS"
                    : p === "AliExpress Shipping" ? "ALIEXPRESS"
                    : p === "Meest Express" ? "MEEST"
                    : p === "DHL" ? "DHL"
                    : p === "FedEx" ? "FEDEX" : "UPS";
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setDeliveryProvider(value)}
                      className={cn(
                        "border px-4 py-2.5 text-xs transition",
                        deliveryProvider === value ? "border-ink bg-ink text-white" : "border-line hover:border-ink",
                      )}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-[0.7rem] text-mist">Carrier shown for illustration — assigned automatically at dispatch.</p>
            </div>
          </section>

          <Button type="submit" size="lg" full>
            Continue To Payment
          </Button>
        </form>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <OrderSummary shippingCost={shippingCost} />
        </aside>
      </div>
    </div>
  );
}

function DeliveryOption({
  icon, title, eta, price, selected, onClick,
}: {
  icon: React.ReactNode;
  title: string;
  eta: string;
  price: number;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-4 border p-4 text-left transition",
        selected ? "border-ink ring-1 ring-ink" : "border-line hover:border-ink",
      )}
    >
      <span className="text-ink">{icon}</span>
      <span className="flex-1">
        <span className="block text-sm font-medium text-ink">{title}</span>
        <span className="block text-xs text-stone">{eta}</span>
      </span>
      <span className="text-sm font-medium">{price === 0 ? "Free" : formatPrice(price)}</span>
    </button>
  );
}
