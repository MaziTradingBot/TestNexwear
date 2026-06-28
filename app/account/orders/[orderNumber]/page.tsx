import type { Metadata } from "next";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { ArrowLeft, Check } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice, formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { PrintButton } from "@/components/account/PrintButton";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Order", robots: { index: false } };

const STEPS = ["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED"] as const;
const STEP_LABEL: Record<string, string> = {
  PENDING: "Placed", PAID: "Paid", PROCESSING: "Processing", SHIPPED: "Shipped", DELIVERED: "Delivered",
};

export default async function OrderDetailPage({ params }: { params: { orderNumber: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect(`/login?callbackUrl=/account/orders/${params.orderNumber}`);

  const order = await prisma.order.findFirst({
    where: { orderNumber: params.orderNumber, userId: session.user.id },
    include: { items: true },
  });
  if (!order) notFound();

  const cancelled = order.status === "CANCELLED" || order.status === "RETURNED";
  const currentStep = STEPS.indexOf(order.status as (typeof STEPS)[number]);

  return (
    <div className="container-luxe py-12">
      <div className="mb-6 flex items-center justify-between print:hidden">
        <Link href="/account" className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wide2 text-stone hover:text-ink">
          <ArrowLeft className="h-4 w-4" /> Back to Account
        </Link>
        <PrintButton />
      </div>

      {/* Invoice header */}
      <div className="flex flex-col gap-3 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow mb-1">Order</p>
          <h1 className="font-serif text-3xl font-light tracking-wide2">{order.orderNumber}</h1>
          <p className="mt-1 text-sm text-stone">Placed {formatDate(order.createdAt)}</p>
        </div>
        <Badge variant={order.paymentStatus === "PAID" || order.paymentStatus === "SIMULATED" ? "gold" : "default"}>
          {order.status}
        </Badge>
      </div>

      {/* Tracking timeline */}
      {!cancelled && (
        <div className="border-b border-line py-8">
          <div className="flex items-center justify-between">
            {STEPS.map((step, i) => {
              const done = i <= currentStep;
              return (
                <div key={step} className="flex flex-1 flex-col items-center text-center last:flex-none">
                  <span className={`flex h-9 w-9 items-center justify-center rounded-full border text-xs ${done ? "border-ink bg-ink text-white" : "border-line text-mist"}`}>
                    {done ? <Check className="h-4 w-4" /> : i + 1}
                  </span>
                  <span className={`mt-2 text-[0.65rem] uppercase tracking-wide2 ${done ? "text-ink" : "text-mist"}`}>{STEP_LABEL[step]}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-6 grid gap-2 text-sm sm:grid-cols-3">
            <p><span className="text-stone">Tracking:</span> <span className="text-ink">{order.trackingNumber ?? "—"}</span></p>
            <p><span className="text-stone">Carrier:</span> <span className="text-ink">{order.deliveryProvider.replace(/_/g, " ")}</span></p>
            <p><span className="text-stone">Est. delivery:</span> <span className="text-ink">{order.estimatedDelivery ? formatDate(order.estimatedDelivery) : "—"}</span></p>
          </div>
        </div>
      )}

      <div className="grid gap-10 py-8 lg:grid-cols-[1fr_320px]">
        {/* Items */}
        <div>
          <h2 className="mb-4 text-sm font-medium uppercase tracking-wide2">Items</h2>
          <ul className="divide-y divide-line border-y border-line">
            {order.items.map((i) => (
              <li key={i.id} className="flex items-center justify-between py-4 text-sm">
                <div>
                  <p className="text-ink">{i.title}</p>
                  <p className="text-xs text-stone">
                    {i.color}{i.size ? ` · ${i.size}` : ""} · Qty {i.quantity}
                  </p>
                </div>
                <span>{formatPrice(Number(i.unitPrice) * i.quantity)}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Summary + address */}
        <div className="space-y-6">
          <div className="border border-line p-5">
            <h2 className="mb-4 text-sm font-medium uppercase tracking-wide2">Summary</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-stone">Subtotal</dt><dd>{formatPrice(Number(order.subtotal))}</dd></div>
              {Number(order.discount) > 0 && <div className="flex justify-between text-gold"><dt>Discount</dt><dd>−{formatPrice(Number(order.discount))}</dd></div>}
              <div className="flex justify-between"><dt className="text-stone">Shipping</dt><dd>{Number(order.shippingCost) === 0 ? "Free" : formatPrice(Number(order.shippingCost))}</dd></div>
              <div className="flex justify-between border-t border-line pt-3 text-base font-medium"><dt>Total</dt><dd>{formatPrice(Number(order.total))}</dd></div>
            </dl>
            <p className="mt-3 text-xs text-stone">Paid via {order.paymentMethod.replace(/_/g, " ")}</p>
          </div>
          <div className="border border-line p-5 text-sm">
            <h2 className="mb-3 text-sm font-medium uppercase tracking-wide2">Ship To</h2>
            <p className="text-ink">{order.customerName}</p>
            <p className="text-stone">{order.shipAddress}</p>
            <p className="text-stone">{order.shipCity}, {order.shipPostalCode}</p>
            <p className="text-stone">{order.shipCountry}</p>
            <p className="mt-2 text-stone">{order.customerEmail}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
