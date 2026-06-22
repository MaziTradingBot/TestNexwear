import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How NexWear collects, uses and protects your personal data.",
};

const SECTIONS = [
  { h: "1. Information We Collect", p: "We collect information you provide when creating an account, placing an order or contacting us — including your name, email, shipping address, phone number and order history. We also collect limited technical data such as device and browsing information to improve our service." },
  { h: "2. How We Use Your Information", p: "Your information is used to process orders, provide customer support, personalise your experience, send order updates, and — with your consent — share marketing communications. We never sell your personal data." },
  { h: "3. Cookies", p: "We use cookies and similar technologies to keep your bag and preferences, analyse traffic, and improve performance. You can control cookies through your browser settings." },
  { h: "4. Data Sharing", p: "We share data only with trusted partners necessary to operate our service — such as payment processors and delivery carriers — and only to the extent required to fulfil your order." },
  { h: "5. Data Security", p: "We use industry-standard encryption and security measures to protect your information. Access to personal data is restricted to authorised personnel." },
  { h: "6. Your Rights", p: "You may access, correct or delete your personal data at any time by contacting us, or by managing your account settings. You may also opt out of marketing at any time." },
  { h: "7. Contact", p: "For privacy enquiries, email privacy@nexwear.com." },
];

export default function PrivacyPage() {
  return (
    <div>
      <PageHero eyebrow="Legal" title="Privacy Policy" subtitle="Last updated June 2026" />
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
