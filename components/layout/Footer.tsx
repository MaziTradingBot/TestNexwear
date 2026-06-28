"use client";

import Link from "next/link";
import { Instagram, Facebook, Twitter, Youtube } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { NewsletterForm } from "@/components/marketing/NewsletterForm";
import { useT } from "@/components/providers/I18nProvider";
import { DELIVERY_PARTNERS } from "@/lib/constants";

const COLUMNS = [
  {
    title: "Shop",
    links: [
      { label: "Women", href: "/women" },
      { label: "Men", href: "/men" },
      { label: "Shoes", href: "/shoes" },
      { label: "Brands", href: "/brands" },
      { label: "Sale", href: "/sale" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Contact Us", href: "/contact" },
      { label: "FAQ", href: "/faq" },
      { label: "Shipping & Delivery", href: "/shipping" },
      { label: "Returns", href: "/returns" },
      { label: "Track Order", href: "/account" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Brands", href: "/brands" },
      { label: "Careers", href: "/about" },
      { label: "Sustainability", href: "/about" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms & Conditions", href: "/terms" },
      { label: "Cookie Policy", href: "/privacy" },
    ],
  },
];

const PAYMENTS = ["Visa", "Mastercard", "Apple Pay", "Google Pay", "PayPal"];

export function Footer() {
  const t = useT();
  return (
    <footer className="mt-24 border-t border-line bg-bone print:hidden">
      {/* Newsletter */}
      <div className="border-b border-line">
        <div className="container-luxe grid gap-8 py-14 md:grid-cols-2 md:items-center">
          <div>
            <p className="eyebrow mb-2">{t("footer.newsletter")}</p>
            <h3 className="font-serif text-2xl font-light md:text-3xl">
              {t("footer.joinTitle")}
            </h3>
            <p className="mt-2 max-w-md text-sm text-stone">
              {t("footer.joinText")}
            </p>
          </div>
          <NewsletterForm />
        </div>
      </div>

      {/* Link columns */}
      <div className="container-luxe grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-6">
        <div className="lg:col-span-2">
          <Logo variant="black" href="/" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-stone">
            {t("footer.tagline")}
          </p>
          <div className="mt-5 flex gap-4 text-ink">
            <a href="#" aria-label="Instagram" className="hover:text-gold"><Instagram className="h-5 w-5" /></a>
            <a href="#" aria-label="Facebook" className="hover:text-gold"><Facebook className="h-5 w-5" /></a>
            <a href="#" aria-label="Twitter" className="hover:text-gold"><Twitter className="h-5 w-5" /></a>
            <a href="#" aria-label="YouTube" className="hover:text-gold"><Youtube className="h-5 w-5" /></a>
          </div>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <p className="eyebrow mb-4">{t(`footer.${col.title.toLowerCase()}`)}</p>
            <ul className="space-y-2.5">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-stone hover:text-ink">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Partners + payments */}
      <div className="border-t border-line">
        <div className="container-luxe flex flex-col gap-6 py-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span className="eyebrow">Shipping</span>
            {DELIVERY_PARTNERS.map((p) => (
              <span key={p} className="text-xs text-stone">{p}</span>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="eyebrow">Payments</span>
            {PAYMENTS.map((p) => (
              <span
                key={p}
                className="border border-line bg-white px-2.5 py-1 text-[0.6rem] font-medium uppercase tracking-wide text-stone"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="container-luxe flex flex-col items-center justify-between gap-2 py-5 text-xs text-mist md:flex-row">
          <p>© {new Date().getFullYear()} NexWear. {t("footer.rights")}</p>
          <p>Crafted with care · Worldwide shipping to 16 countries</p>
        </div>
      </div>
    </footer>
  );
}
