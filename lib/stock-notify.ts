import { prisma } from "@/lib/prisma";
import { sendMail, backInStockEmail } from "@/lib/mailer";
import { SITE } from "@/lib/constants";

/**
 * Emails everyone on a product's back-in-stock waitlist and clears the list.
 * Best-effort and non-blocking — failures are logged, never thrown.
 */
export async function notifyRestock(productId: string): Promise<void> {
  try {
    const subscribers = await prisma.stockNotification.findMany({
      where: { productId, notified: false },
      select: { id: true, email: true },
    });
    if (subscribers.length === 0) return;

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { title: true, slug: true, brand: { select: { name: true } } },
    });
    if (!product) return;

    const url = `${SITE.url}/product/${product.slug}`;
    const mail = backInStockEmail({ title: product.title, brand: product.brand?.name, url });

    await Promise.allSettled(
      subscribers.map((s) => sendMail({ to: s.email, ...mail })),
    );

    // One-shot: remove them so a future restock doesn't re-notify silently.
    await prisma.stockNotification.deleteMany({
      where: { id: { in: subscribers.map((s) => s.id) } },
    });
  } catch (e) {
    console.error("[stock-notify] notifyRestock failed", e);
  }
}
