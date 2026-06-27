import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guardAdminApi } from "@/lib/admin";

export const dynamic = "force-dynamic";

// CSV export of newsletter subscribers (admin only).
export async function GET() {
  const denied = await guardAdminApi();
  if (denied) return denied;

  const subs = await prisma.newsletterSubscriber.findMany({ orderBy: { createdAt: "desc" } });
  const header = "email,subscribed_at\n";
  const body = subs.map((s) => `${s.email},${s.createdAt.toISOString()}`).join("\n");

  return new NextResponse(header + body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="nexwear-subscribers-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
