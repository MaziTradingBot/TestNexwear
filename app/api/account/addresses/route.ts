import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const schema = z.object({
  fullName: z.string().min(2).max(120),
  phone: z.string().min(5).max(30),
  country: z.string().min(2),
  city: z.string().min(2),
  address: z.string().min(4),
  postalCode: z.string().min(2).max(12),
  isDefault: z.boolean().optional(),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid address" }, { status: 400 });
  }
  const d = parsed.data;

  const count = await prisma.address.count({ where: { userId: session.user.id } });
  await prisma.address.create({
    data: {
      userId: session.user.id,
      fullName: d.fullName,
      phone: d.phone,
      country: d.country,
      city: d.city,
      address: d.address,
      postalCode: d.postalCode,
      isDefault: d.isDefault ?? count === 0, // first address becomes default
    },
  });
  return NextResponse.json({ ok: true });
}
