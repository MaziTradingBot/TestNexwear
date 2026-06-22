import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/layout/PageHero";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About Us",
  description: "The NexWear story — modern luxury fashion, designed in-house and shipped worldwide.",
};

const VALUES = [
  { title: "Considered Design", body: "Every piece is designed in-house with an emphasis on timeless silhouettes and refined detailing." },
  { title: "Premium Materials", body: "We source natural and responsibly-made fabrics that look better and last longer." },
  { title: "Worldwide Delivery", body: "From New York to Kyiv — fast, tracked shipping to 16 countries and counting." },
];

export default function AboutPage() {
  return (
    <div>
      <PageHero eyebrow="Our Story" title="About NexWear" subtitle="Modern luxury, made to last." />

      <section className="container-luxe grid items-center gap-12 py-16 lg:grid-cols-2">
        <div className="relative aspect-[4/5] overflow-hidden bg-bone">
          <Image
            src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=1100&q=80"
            alt="NexWear atelier"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
        <div>
          <p className="eyebrow mb-3">Est. 2026</p>
          <h2 className="font-serif text-3xl font-light leading-tight md:text-4xl">
            Luxury, redefined for the modern wardrobe.
          </h2>
          <div className="mt-6 space-y-4 text-sm leading-relaxed text-stone">
            <p>
              NexWear was founded on a simple belief: that exceptional fashion should feel effortless. We
              blend the editorial spirit of the great fashion houses with a direct, considered approach —
              bringing premium design to a global audience without the premium markup.
            </p>
            <p>
              From tailored essentials to statement pieces, every collection is crafted to move seamlessly
              from day to evening, season to season. We obsess over fabric, fit and finish so you don&apos;t
              have to.
            </p>
          </div>
          <Link href="/women" className="mt-8 inline-block">
            <Button>Explore The Collection</Button>
          </Link>
        </div>
      </section>

      <section className="border-y border-line bg-bone">
        <div className="container-luxe grid gap-px bg-line py-px md:grid-cols-3">
          {VALUES.map((v) => (
            <div key={v.title} className="bg-bone p-10 text-center">
              <h3 className="font-serif text-xl font-medium uppercase tracking-wide2">{v.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-stone">{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-luxe py-20 text-center">
        <p className="eyebrow mb-3">Join Us</p>
        <h2 className="mx-auto max-w-2xl font-serif text-3xl font-light md:text-4xl">
          Become part of the NexWear community.
        </h2>
        <Link href="/register" className="mt-8 inline-block">
          <Button size="lg">Create Your Account</Button>
        </Link>
      </section>
    </div>
  );
}
