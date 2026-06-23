import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { guardAdminApi } from "@/lib/admin";

export const dynamic = "force-dynamic";

const schema = z.object({
  code: z.string().min(3).max(40),
  type: z.enum(["PERCENT", "FIXED"]),
  value: z.number().positive(),
  minSpend: z.number().min(0).optional(),
});

export async function POST(req: Request) {
  const denied = await guardAdminApi();
  if (denied) return denied;

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid coupon" }, { status: 400 });
  const d = parsed.data;

  try {
    await prisma.coupon.create({
      data: {
        code: d.code.toUpperCase().trim(),
        type: d.type,
        value: new Prisma.Decimal(d.value),
        minSpend: new Prisma.Decimal(d.minSpend ?? 0),
      },
    });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return NextResponse.json({ error: "A coupon with that code already exists" }, { status: 409 });
    }
    console.error("POST /api/admin/coupons", e);
    return NextResponse.json({ error: "Could not create coupon" }, { status: 500 });
  }
}
