import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "The terms and conditions governing your use of NexWear.",
};

const SECTIONS = [
  { h: "1. Overview", p: "By accessing and using NexWear, you agree to be bound by these terms and conditions. If you do not agree, please do not use our website." },
  { h: "2. Products & Pricing", p: "We strive to display products and prices accurately. All prices are shown in USD and include applicable taxes where stated. We reserve the right to correct errors and to change prices at any time." },
  { h: "3. Orders", p: "Your order constitutes an offer to purchase. We reserve the right to accept or decline any order. A contract is formed when we confirm dispatch of your items." },
  { h: "4. Payment", p: "Accepted payment methods are displayed at checkout. Payment must be received (or arranged via cash on delivery) before goods are dispatched." },
  { h: "5. Shipping & Delivery", p: "Delivery times are estimates and not guaranteed. Risk passes to you upon delivery. Carrier names shown are illustrative and may differ at dispatch." },
  { h: "6. Returns", p: "Items may be returned within 30 days in original condition. Certain items may be excluded for hygiene reasons. See our FAQ for details." },
  { h: "7. Intellectual Property", p: "All content on this site — including imagery, text and the NexWear name and logo — is owned by NexWear and may not be used without permission." },
  { h: "8. Limitation of Liability", p: "To the fullest extent permitted by law, NexWear is not liable for indirect or consequential losses arising from the use of our website or products." },
  { h: "9. Governing Law", p: "These terms are governed by the laws of England and Wales." },
];

export default function TermsPage() {
  return (
    <div>
      <PageHero eyebrow="Legal" title="Terms & Conditions" subtitle="Last updated June 2026" />
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
