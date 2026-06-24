"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, Star, ArrowDown } from "lucide-react";
import { useT } from "@/components/providers/I18nProvider";

const POSTER =
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=2000&q=80";

const float = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] as const },
});

/**
 * Cinematic, floating landing hero — silent autoplaying background video with
 * glassy floating UI cards. Drop your own clip at `public/hero-video.mp4`.
 */
export function LandingHero() {
  const t = useT();
  return (
    <section className="relative h-[92vh] min-h-[560px] w-full overflow-hidden bg-ink">
      {/* Background film (silent, decorative) */}
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        poster={POSTER}
        aria-hidden="true"
      >
        <source src="/hero-video.mp4" type="video/mp4" />
      </video>

      {/* Cinematic overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/40 to-ink/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-ink/30" />
      <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_180px_60px_rgba(0,0,0,0.55)]" />

      {/* Content */}
      <div className="container-luxe relative z-10 flex h-full flex-col justify-center">
        <motion.div {...float(0.05)} className="max-w-2xl text-white">
          <span className="inline-flex items-center gap-2 border border-white/30 bg-white/5 px-3 py-1.5 text-[0.6rem] font-medium uppercase tracking-luxe text-white/90 backdrop-blur sm:text-[0.62rem]">
            <Sparkles className="h-3.5 w-3.5 text-gold" />
            {t("hero.eyebrow")}
          </span>

          <h1 className="mt-6 font-serif text-5xl font-light uppercase leading-[0.92] tracking-wide2 sm:text-6xl md:text-7xl lg:text-8xl">
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

      {/* Floating glass card — trending product */}
      <motion.div {...float(0.5)} className="absolute right-6 top-28 z-10 hidden lg:block">
        <motion.div
          animate={{ y: [0, -14, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="w-60 border border-white/20 bg-white/10 p-3 backdrop-blur-md"
        >
          <div className="relative aspect-[4/5] overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&q=80"
              alt="Trending piece"
              fill
              sizes="240px"
              className="object-cover"
            />
            <span className="absolute left-2 top-2 bg-gold px-2 py-0.5 text-[0.55rem] font-medium uppercase tracking-wide2 text-white">
              Trending
            </span>
          </div>
          <div className="mt-2.5 text-white">
            <p className="text-[0.6rem] uppercase tracking-wide2 text-white/70">Maison Noir</p>
            <p className="text-sm">Silk Slip Dress</p>
            <p className="text-sm text-gold-light">$189.00</p>
          </div>
        </motion.div>
      </motion.div>

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
