"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Package, User, MapPin, Lock, Heart, Award, LogOut, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { formatPrice, formatDate } from "@/lib/format";
import { cn } from "@/lib/cn";

type Order = {
  orderNumber: string;
  status: string;
  total: number;
  trackingNumber: string | null;
  deliveryMethod: string;
  estimatedDelivery: string | null;
  createdAt: string;
  itemCount: number;
};

type AddressT = {
  id: string;
  fullName: string;
  country: string;
  city: string;
  address: string;
  postalCode: string;
};

const TABS = [
  { id: "orders", label: "Orders", icon: Package },
  { id: "profile", label: "Profile", icon: User },
  { id: "addresses", label: "Addresses", icon: MapPin },
  { id: "security", label: "Security", icon: Lock },
];

const STATUS_VARIANT: Record<string, "default" | "gold" | "sale"> = {
  PAID: "gold",
  PROCESSING: "gold",
  SHIPPED: "default",
  DELIVERED: "default",
  PENDING: "default",
  CANCELLED: "sale",
};

export function AccountDashboard({
  user,
  orders,
  addresses,
  isAdmin = false,
}: {
  user: { name: string; email: string; loyaltyPoints: number };
  orders: Order[];
  addresses: AddressT[];
  isAdmin?: boolean;
}) {
  const [tab, setTab] = useState("orders");

  return (
    <div className="container-luxe py-12">
      <div className="mb-10 flex flex-col items-start justify-between gap-4 border-b border-line pb-8 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow mb-2">My Account</p>
          <h1 className="font-serif text-4xl font-light uppercase tracking-wide2">
            Hello, {user.name.split(" ")[0]}
          </h1>
        </div>
        <div className="flex items-center gap-2 border border-gold bg-gold/5 px-4 py-2.5 text-gold">
          <Award className="h-5 w-5" />
          <span className="text-sm font-medium">{user.loyaltyPoints} Loyalty Points</span>
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
        {/* Sidebar */}
        <aside>
          <nav className="flex flex-row flex-wrap gap-1 lg:flex-col">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 text-left text-sm transition",
                  tab === t.id ? "bg-ink text-white" : "text-stone hover:bg-bone hover:text-ink",
                )}
              >
                <t.icon className="h-4 w-4" /> {t.label}
              </button>
            ))}
            <Link href="/wishlist" className="flex items-center gap-3 px-4 py-3 text-sm text-stone hover:bg-bone hover:text-ink">
              <Heart className="h-4 w-4" /> Wishlist
            </Link>
            {isAdmin && (
              <Link href="/admin" className="flex items-center gap-3 px-4 py-3 text-sm text-gold hover:bg-bone">
                <LayoutDashboard className="h-4 w-4" /> Admin Panel
              </Link>
            )}
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center gap-3 px-4 py-3 text-sm text-stone hover:bg-bone hover:text-ink"
            >
              <LogOut className="h-4 w-4" /> Sign Out
            </button>
          </nav>
        </aside>

        {/* Content */}
        <div>
          {tab === "orders" && <OrdersPanel orders={orders} />}
          {tab === "profile" && <ProfilePanel user={user} />}
          {tab === "addresses" && <AddressesPanel addresses={addresses} />}
          {tab === "security" && <SecurityPanel />}
        </div>
      </div>
    </div>
  );
}

function OrdersPanel({ orders }: { orders: Order[] }) {
  if (orders.length === 0) {
    return (
      <div className="border border-line p-10 text-center">
        <Package className="mx-auto h-10 w-10 text-mist" strokeWidth={1} />
        <p className="mt-4 text-sm text-stone">You haven&apos;t placed any orders yet.</p>
        <Link href="/women" className="mt-6 inline-block">
          <Button>Start Shopping</Button>
        </Link>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {orders.map((o) => (
        <div key={o.orderNumber} className="border border-line p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
            <div>
              <p className="text-sm font-medium text-ink">{o.orderNumber}</p>
              <p className="text-xs text-stone">Placed {formatDate(o.createdAt)} · {o.itemCount} item{o.itemCount !== 1 && "s"}</p>
            </div>
            <Badge variant={STATUS_VARIANT[o.status] ?? "default"}>{o.status}</Badge>
          </div>
          <div className="grid gap-3 pt-4 text-xs sm:grid-cols-3">
            <div>
              <p className="uppercase tracking-wide2 text-mist">Total</p>
              <p className="mt-1 text-sm text-ink">{formatPrice(o.total)}</p>
            </div>
            <div>
              <p className="uppercase tracking-wide2 text-mist">Tracking</p>
              <p className="mt-1 text-sm text-ink">{o.trackingNumber ?? "—"}</p>
            </div>
            <div>
              <p className="uppercase tracking-wide2 text-mist">Est. Delivery</p>
              <p className="mt-1 text-sm text-ink">{o.estimatedDelivery ? formatDate(o.estimatedDelivery) : "—"}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ProfilePanel({ user }: { user: { name: string; email: string } }) {
  return (
    <div className="max-w-md space-y-5">
      <h2 className="font-serif text-2xl font-light uppercase tracking-wide2">Profile</h2>
      <Field label="Full Name">
        <Input defaultValue={user.name} />
      </Field>
      <Field label="Email">
        <Input defaultValue={user.email} disabled />
      </Field>
      <p className="text-xs text-stone">Profile editing is available — changes save to your account.</p>
      <Button>Save Changes</Button>
    </div>
  );
}

function AddressesPanel({ addresses }: { addresses: AddressT[] }) {
  return (
    <div>
      <h2 className="mb-5 font-serif text-2xl font-light uppercase tracking-wide2">Addresses</h2>
      {addresses.length === 0 ? (
        <p className="border border-line p-8 text-center text-sm text-stone">
          No saved addresses yet. Addresses are saved when you check out.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((a) => (
            <div key={a.id} className="border border-line p-5 text-sm">
              <p className="font-medium text-ink">{a.fullName}</p>
              <p className="mt-1 text-stone">{a.address}</p>
              <p className="text-stone">{a.city}, {a.postalCode}</p>
              <p className="text-stone">{a.country}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SecurityPanel() {
  const show = useToast((s) => s.show);
  const [form, setForm] = useState({ currentPassword: "", newPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/account/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Could not update password");
      return;
    }
    show("Password updated");
    setForm({ currentPassword: "", newPassword: "" });
  }

  return (
    <form onSubmit={submit} className="max-w-md space-y-5">
      <h2 className="font-serif text-2xl font-light uppercase tracking-wide2">Change Password</h2>
      <Field label="Current Password">
        <Input type="password" required value={form.currentPassword} onChange={(e) => setForm((f) => ({ ...f, currentPassword: e.target.value }))} />
      </Field>
      <Field label="New Password">
        <Input type="password" required value={form.newPassword} onChange={(e) => setForm((f) => ({ ...f, newPassword: e.target.value }))} />
      </Field>
      {error && <p className="text-sm text-sale">{error}</p>}
      <Button type="submit" disabled={loading}>
        {loading ? "Updating…" : "Update Password"}
      </Button>
    </form>
  );
}
