import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { guardAdminApi } from "@/lib/admin";
import { slugify, randomSuffix } from "@/lib/slug";

export const dynamic = "force-dynamic";

const schema = z.object({
  name: z.string().min(2).max(80),
  description: z.string().max(400).optional().nullable(),
  heroImage: z.string().url().optional().nullable().or(z.literal("")),
  isPremium: z.boolean().optional(),
});

export async function POST(req: Request) {
  const denied = await guardAdminApi();
  if (denied) return denied;

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid brand" }, { status: 400 });
  const d = parsed.data;

  try {
    await prisma.brand.create({
      data: {
        name: d.name,
        slug: `${slugify(d.name)}-${randomSuffix(3)}`,
        description: d.description || null,
        heroImage: d.heroImage || null,
        isPremium: d.isPremium ?? false,
      },
    });
    revalidateTag("catalog");
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("POST /api/admin/brands", e);
    return NextResponse.json({ error: "Could not create brand" }, { status: 500 });
  }
}
