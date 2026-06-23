import { NextResponse } from "next/server";
import { z } from "zod";
import { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { guardAdminApi } from "@/lib/admin";

export const dynamic = "force-dynamic";

const schema = z.object({
  status: z.enum(["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "RETURNED"]),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const denied = await guardAdminApi();
  if (denied) return denied;

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid status" }, { status: 400 });

  try {
    await prisma.order.update({
      where: { id: params.id },
      data: { status: parsed.data.status as OrderStatus },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("PATCH /api/admin/orders/[id]", e);
    return NextResponse.json({ error: "Could not update order" }, { status: 500 });
  }
}
