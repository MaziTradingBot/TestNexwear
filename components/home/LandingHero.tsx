"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Star, ArrowDown } from "lucide-react";
import { useT } from "@/components/providers/I18nProvider";

/**
 * Cinematic fashion film for the landing hero — a silent, auto-cycling montage
 * of editorial clothing photography with a slow Ken Burns drift and crossfade.
 * Pure CSS/JS motion, so it's reliable and fast with no video asset to manage.
 */
const SLIDES = [
  { id: "photo-1490481651871-ab68de25d43d", alt: "Editorial fashion model" },
  { id: "photo-1483985988355-763728e1935b", alt: "Woman with shopping bags" },
  { id: "photo-1539109136881-3be0616acf4b", alt: "Street style outfit" },
  { id: "photo-1469334031218-e382a71b716b", alt: "Curated clothing rail" },
];

const float = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] as const },
});

function HeroFilm() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIndex((p) => (p + 1) % SLIDES.length), 5500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="absolute inset-0">
      <AnimatePresence>
        <motion.div
          key={index}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.6, ease: "easeInOut" }}
        >
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 7, ease: "linear" }}
          >
            <Image
              src={`https://images.unsplash.com/${SLIDES[index].id}?auto=format&fit=crop&w=2000&q=80`}
              alt={SLIDES[index].alt}
              fill
              priority={index === 0}
              sizes="100vw"
              className="object-cover"
            />
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export function LandingHero() {
  const t = useT();
  return (
    <section className="relative h-[92vh] min-h-[560px] w-full overflow-hidden bg-ink">
      {/* Background fashion film */}
      <HeroFilm />

      {/* Cinematic overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/40 to-ink/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-ink/30" />
      <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_180px_60px_rgba(0,0,0,0.55)]" />

      {/* Content */}
      <div className="container-luxe relative z-10 flex h-full flex-col justify-center">
        <motion.div {...float(0.05)} className="max-w-2xl text-white">
          <h1 className="font-serif text-5xl font-light uppercase leading-[0.92] tracking-wide2 sm:text-6xl md:text-7xl lg:text-8xl">
            {t("hero.title1")}
            <span className="block text-gold-light">{t("hero.title2")}</span>
          </h1>

          <p className="mt-6 max-w-md text-sm leading-relaxed text-white/85 sm:text-base md:text-lg">
            {t("hero.subtitle")}
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/women" className="btn-label">
              {t("hero.shopWomen")}
            </Link>
            <Link href="/men" className="btn-label-outline">
              {t("hero.shopMen")}
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Floating rating chip */}
      <motion.div {...float(0.75)} className="absolute right-16 bottom-32 z-10 hidden md:block">
        <motion.div
          animate={{ y: [0, 12, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="flex items-center gap-2.5 border border-white/20 bg-white/10 px-4 py-3 text-white backdrop-blur-md"
        >
          <div className="flex">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className="h-3.5 w-3.5 fill-gold text-gold" />
            ))}
          </div>
          <div className="text-xs leading-tight">
            <p className="font-medium">4.9 / 5</p>
            <p className="text-white/60">12,480 reviews</p>
          </div>
        </motion.div>
      </motion.div>

      {/* Floating stat chip */}
      <motion.div {...float(0.9)} className="absolute left-6 bottom-28 z-10 hidden md:flex">
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
          className="flex items-center gap-3 border border-white/20 bg-white/10 px-4 py-3 text-white backdrop-blur-md"
        >
          <Sparkles className="h-5 w-5 text-gold" />
          <p className="text-xs leading-tight">
            <span className="block font-medium">{t("hero.freeShipping")}</span>
            <span className="text-white/60">{t("hero.toCountries")}</span>
          </p>
        </motion.div>
      </motion.div>

      {/* Scroll cue */}
      <div className="absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 text-white/70 md:flex">
        <span className="text-[0.6rem] uppercase tracking-luxe">{t("hero.scroll")}</span>
        <motion.span
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <ArrowDown className="h-4 w-4" />
        </motion.span>
      </div>
    </section>
  );
}
