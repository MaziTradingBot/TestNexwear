import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { Accordion } from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions about shipping, returns, payments and orders at NexWear.",
};

const GROUPS: { heading: string; items: { title: string; content: string }[] }[] = [
  {
    heading: "Shipping",
    items: [
      { title: "Which countries do you ship to?", content: "We currently ship to 16 countries across Europe and North America, including the US, Canada, UK, Germany, France, Italy, Spain, Netherlands, Poland, Ukraine and more." },
      { title: "How long does delivery take?", content: "Standard delivery takes 5–10 business days. Express delivery arrives in 1–3 business days. A tracking number is provided for every order." },
      { title: "Is shipping free?", content: "Express shipping is free on all orders over $150. Standard shipping rates vary by destination and are shown at checkout." },
    ],
  },
  {
    heading: "Returns",
    items: [
      { title: "What is your return policy?", content: "We offer free returns within 30 days of delivery. Items must be unworn, unwashed and with original tags attached." },
      { title: "How do I start a return?", content: "Sign in to your account, open the order and select 'Return'. You'll receive a prepaid label and instructions by email." },
      { title: "When will I be refunded?", content: "Refunds are processed within 5–7 business days of us receiving your return, back to your original payment method." },
    ],
  },
  {
    heading: "Payments",
    items: [
      { title: "Which payment methods do you accept?", content: "We accept Visa and Mastercard, Apple Pay, Google Pay, bank transfer, and cash on delivery in select countries." },
      { title: "Is cash on delivery available?", content: "Yes — pay upon goods receipt is available in select countries and shown as an option at checkout." },
      { title: "Is my payment secure?", content: "All transactions are encrypted. We never store full card details on our servers." },
    ],
  },
  {
    heading: "Orders",
    items: [
      { title: "Can I change or cancel my order?", content: "Orders can be amended within 1 hour of placement. Contact our care team as soon as possible and we'll do our best to help." },
      { title: "How do I track my order?", content: "Use the tracking number in your order confirmation, or view live status from your account dashboard." },
      { title: "Do I need an account to order?", content: "No — you can check out as a guest. Creating an account lets you track orders and earn loyalty points." },
    ],
  },
];

export default function FaqPage() {
  return (
    <div>
      <PageHero eyebrow="Help Centre" title="FAQ" subtitle="Everything you need to know about shopping with NexWear." />
      <div className="container-luxe max-w-3xl py-16">
        {GROUPS.map((g) => (
          <section key={g.heading} className="mb-12">
            <h2 className="mb-4 font-serif text-2xl font-light uppercase tracking-wide2">{g.heading}</h2>
            <Accordion items={g.items} />
          </section>
        ))}
      </div>
    </div>
  );
}
