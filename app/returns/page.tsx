import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";

export const metadata: Metadata = {
  title: "Returns & Refunds",
  description: "NexWear returns, exchanges and refund policy.",
};

const SECTIONS = [
  { h: "1. 30-Day Returns", p: "You may return most items within 30 days of delivery for a full refund. Items must be unworn, unwashed and in their original condition with all tags and packaging attached." },
  { h: "2. How To Return", p: "Sign in to your account, open the order under “Orders”, and follow the return instructions — or contact support@nexwear.com to start a return. We’ll email you a prepaid label where available." },
  { h: "3. Refunds", p: "Once we receive and inspect your return, your refund is issued to the original payment method within 5–10 business days. Original shipping charges are non-refundable unless the item was faulty or incorrect." },
  { h: "4. Exchanges", p: "The fastest way to exchange for a different size or colour is to return the original item for a refund and place a new order. This ensures your preferred item is reserved before it sells out." },
  { h: "5. Faulty Or Incorrect Items", p: "If you receive a faulty, damaged or incorrect item, contact us within 14 days of delivery and we’ll arrange a free return and full refund or replacement." },
  { h: "6. Non-Returnable Items", p: "For hygiene reasons, pierced jewellery, swimwear without the hygiene seal, and gift cards cannot be returned unless faulty." },
  { h: "7. Contact", p: "For any return enquiries, email support@nexwear.com and our team will be happy to help." },
];

export default function ReturnsPage() {
  return (
    <div>
      <PageHero eyebrow="Help" title="Returns & Refunds" subtitle="Easy, 30-day returns" />
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
