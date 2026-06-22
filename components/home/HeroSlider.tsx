"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

export type HeroBanner = {
  id: string;
  eyebrow: string | null;
  title: string;
  subtitle: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  imageUrl: string;
};

export function HeroSlider({ banners }: { banners: HeroBanner[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 5500, stopOnInteraction: false }),
  ]);
  const [selected, setSelected] = useState(0);

  const onSelect = useCallback(() => {
    if (emblaApi) setSelected(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
  }, [emblaApi, onSelect]);

  return (
    <section className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {banners.map((b, i) => (
            <div key={b.id} className="relative min-w-0 flex-[0_0_100%]">
              <div className="relative h-[72vh] min-h-[520px] w-full md:h-[86vh]">
                <Image
                  src={b.imageUrl}
                  alt={b.title}
                  fill
                  priority={i === 0}
                  sizes="100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-ink/45 via-ink/15 to-transparent" />
                <div className="container-luxe absolute inset-0 flex items-center">
                  <motion.div
                    key={selected === i ? `active-${i}` : `idle-${i}`}
                    initial={{ opacity: 0, y: 24 }}
                    animate={selected === i ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    className="max-w-xl text-white"
                  >
                    {b.eyebrow && (
                      <p className="mb-4 text-[0.7rem] font-medium uppercase tracking-luxe text-white/80">
                        {b.eyebrow}
                      </p>
                    )}
                    <h1 className="font-serif text-5xl font-light uppercase leading-[0.95] tracking-wide2 md:text-7xl">
                      {b.title}
                    </h1>
                    {b.subtitle && (
                      <p className="mt-5 max-w-md text-base text-white/85">{b.subtitle}</p>
                    )}
                    <div className="mt-8 flex flex-wrap gap-3">
                      {b.ctaHref && (
                        <Link href={b.ctaHref} className="btn-label">
                          {b.ctaLabel ?? "Shop Now"}
                        </Link>
                      )}
                      <Link href="/women" className="btn-label-outline">
                        Shop Women
                      </Link>
                      <Link href="/men" className="btn-label-outline">
                        Shop Men
                      </Link>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => emblaApi?.scrollTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={cn(
              "h-1 transition-all duration-300",
              selected === i ? "w-8 bg-white" : "w-4 bg-white/50 hover:bg-white/80",
            )}
          />
        ))}
      </div>
    </section>
  );
}
