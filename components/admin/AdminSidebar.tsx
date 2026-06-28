"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard, Package, Tag, FolderTree, ShoppingCart,
  Ticket, Users, Star, Mail, Image as ImageIcon, ExternalLink, LogOut,
} from "lucide-react";
import { cn } from "@/lib/cn";

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/brands", label: "Brands", icon: Tag },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/banners", label: "Banners", icon: ImageIcon },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/coupons", label: "Coupons", icon: Ticket },
  { href: "/admin/newsletter", label: "Newsletter", icon: Mail },
  { href: "/admin/users", label: "Users", icon: Users },
];

export function AdminSidebar({ name }: { name: string }) {
  const pathname = usePathname();
  return (
    <aside className="flex w-full flex-col border-b border-line bg-ink text-white lg:h-screen lg:w-64 lg:border-b-0 lg:border-r lg:border-white/10">
      <div className="px-6 py-6">
        <Link href="/admin" className="font-serif text-xl uppercase tracking-[0.3em]">
          NexWear
        </Link>
        <p className="mt-1 text-[0.6rem] uppercase tracking-luxe text-white/50">Admin Panel</p>
      </div>

      <nav className="flex flex-1 flex-row flex-wrap gap-1 px-3 lg:flex-col">
        {LINKS.map((l) => {
          const active = l.exact ? pathname === l.href : pathname.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 text-sm transition-colors",
                active ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white",
              )}
            >
              <l.icon className="h-4 w-4" />
              {l.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-1 px-3 py-4">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 text-sm text-white/60 transition-colors hover:text-white"
        >
          <ExternalLink className="h-4 w-4" /> View Store
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex w-full items-center gap-3 px-3 py-2.5 text-sm text-white/60 transition-colors hover:text-white"
        >
          <LogOut className="h-4 w-4" /> Sign Out
        </button>
        <p className="px-3 pt-3 text-[0.65rem] text-white/40">Signed in as {name}</p>
      </div>
    </aside>
  );
}
