"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Search, User, Heart, ShoppingBag, Menu, ChevronRight } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Sheet } from "@/components/ui/sheet";
import { SearchOverlay } from "@/components/layout/SearchOverlay";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { useT } from "@/components/providers/I18nProvider";
import { MAIN_NAV, MEGA_MENU } from "@/lib/constants";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";
import { cn } from "@/lib/cn";

function CountBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center bg-gold px-1 text-[0.55rem] font-semibold text-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}

export function Header() {
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const { data: session } = useSession();
  const t = useT();
  const navLabel = (label: string) => t(`nav.${label.toLowerCase()}`);

  const cartCount = useCartStore((s) => s.totalItems());
  const wishCount = useWishlistStore((s) => s.count());

  useEffect(() => setMounted(true), []);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-line bg-cream/95 backdrop-blur supports-[backdrop-filter]:bg-cream/80">
        <div
          className="container-luxe"
          onMouseLeave={() => setHovered(null)}
        >
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 py-5">
            {/* Left — desktop nav / mobile menu */}
            <div className="flex items-center gap-6">
              <button
                className="lg:hidden"
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <nav className="hidden items-center gap-7 lg:flex">
                {MAIN_NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onMouseEnter={() => setHovered(item.label)}
                    className={cn(
                      "link-underline py-2 text-[0.72rem] font-medium uppercase tracking-wide2 transition-colors",
                      item.accent ? "text-sale" : "text-ink hover:text-gold",
                    )}
                  >
                    {navLabel(item.label)}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Center — logo */}
            <div className="flex justify-center">
              <Logo variant="black" className="scale-90 sm:scale-100" />
            </div>

            {/* Right — utilities */}
            <div className="flex items-center justify-end gap-4 sm:gap-5">
              <LanguageSwitcher className="hidden sm:block" />
              <button onClick={() => setSearchOpen(true)} aria-label="Search" className="hover:text-gold">
                <Search className="h-5 w-5" />
              </button>
              <Link
                href={session ? "/account" : "/login"}
                aria-label="Account"
                className="hidden hover:text-gold sm:block"
              >
                <User className="h-5 w-5" />
              </Link>
              <Link href="/wishlist" aria-label="Wishlist" className="relative hover:text-gold">
                <Heart className="h-5 w-5" />
                {mounted && <CountBadge count={wishCount} />}
              </Link>
              <Link href="/cart" aria-label="Cart" className="relative hover:text-gold">
                <ShoppingBag className="h-5 w-5" />
                {mounted && <CountBadge count={cartCount} />}
              </Link>
            </div>
          </div>

          {/* Mega menu */}
          {hovered && MEGA_MENU[hovered] && (
            <div
              className="absolute inset-x-0 top-full hidden border-b border-line bg-cream shadow-sm lg:block"
              onMouseEnter={() => setHovered(hovered)}
            >
              <div className="container-luxe grid grid-cols-4 gap-10 py-8">
                {MEGA_MENU[hovered].map((col) => (
                  <div key={col.title}>
                    <p className="eyebrow mb-4">{col.title}</p>
                    <ul className="space-y-2.5">
                      {col.links.map((l) => (
                        <li key={l.href}>
                          <Link
                            href={l.href}
                            onClick={() => setHovered(null)}
                            className="link-underline text-sm text-stone hover:text-ink"
                          >
                            {l.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Mobile drawer */}
      <Sheet open={mobileOpen} onClose={() => setMobileOpen(false)} side="left" title="Menu">
        <nav className="flex flex-col">
          {MAIN_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center justify-between border-b border-line px-6 py-4 text-sm font-medium uppercase tracking-wide2",
                item.accent && "text-sale",
              )}
            >
              {navLabel(item.label)}
              <ChevronRight className="h-4 w-4 text-mist" />
            </Link>
          ))}
        </nav>
        <div className="space-y-4 px-6 py-6">
          <Link
            href={session ? "/account" : "/login"}
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2 text-sm text-ink"
          >
            <User className="h-4 w-4" /> {session ? "My Account" : "Sign In"}
          </Link>
          {session && (
            <button
              onClick={() => {
                setMobileOpen(false);
                signOut({ callbackUrl: "/" });
              }}
              className="text-sm text-stone hover:text-ink"
            >
              Sign Out
            </button>
          )}
          <LanguageSwitcher />
        </div>
      </Sheet>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
