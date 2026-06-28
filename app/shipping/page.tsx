import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";

export const metadata: Metadata = {
  title: "Shipping Information",
  description: "NexWear delivery options, costs and timeframes.",
};

const SECTIONS = [
  { h: "1. Delivery Options", p: "We offer Standard (3–7 business days) and Express (1–3 business days) delivery. Available options and exact timeframes are shown at checkout based on your destination." },
  { h: "2. Free Shipping", p: "Enjoy complimentary Standard shipping on all orders over $150. The discount is applied automatically at checkout." },
  { h: "3. Shipping Costs", p: "Shipping is calculated at checkout based on your delivery country and chosen method. You’ll always see the exact cost before you pay." },
  { h: "4. Order Processing", p: "Orders are processed within 1 business day. You’ll receive an email confirmation with a tracking number as soon as your order ships." },
  { h: "5. Tracking Your Order", p: "Track your parcel any time from your account under “Orders”, where you’ll find live status, carrier and estimated delivery date." },
  { h: "6. International Delivery", p: "We ship worldwide. Any customs duties or import taxes for international orders are the responsibility of the recipient and are not included in the order total." },
  { h: "7. Contact", p: "For delivery enquiries, email support@nexwear.com." },
];

export default function ShippingPage() {
  return (
    <div>
      <PageHero eyebrow="Help" title="Shipping Information" subtitle="Fast, tracked worldwide delivery" />
      <article className="container-luxe max-w-3xl space-y-8 py-16">
        {SECTIONS.map((s) => (
          <section key={s.h}>
            <h2 className="mb-2 font-serif text-xl font-medium uppercase tracking-wide2">{s.h}</h2>
            <p className="text-sm leading-relaxed text-stone">{s.p}</p>
          </section>
        ))}
      </article>
    </div>
  );
}
