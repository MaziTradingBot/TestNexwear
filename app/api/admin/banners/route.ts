import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { guardAdminApi } from "@/lib/admin";

export const dynamic = "force-dynamic";

const schema = z.object({
  title: z.string().min(1).max(120),
  eyebrow: z.string().max(60).optional().nullable(),
  subtitle: z.string().max(200).optional().nullable(),
  ctaLabel: z.string().max(40).optional().nullable(),
  ctaHref: z.string().max(200).optional().nullable(),
  imageUrl: z.string().url(),
  position: z.number().int().min(0).optional(),
});

export async function POST(req: Request) {
  const denied = await guardAdminApi();
  if (denied) return denied;

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid banner" }, { status: 400 });
  const d = parsed.data;

  try {
    await prisma.banner.create({
      data: {
        title: d.title,
        eyebrow: d.eyebrow || null,
        subtitle: d.subtitle || null,
        ctaLabel: d.ctaLabel || null,
        ctaHref: d.ctaHref || null,
        imageUrl: d.imageUrl,
        position: d.position ?? 0,
      },
    });
    revalidateTag("catalog");
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("POST /api/admin/banners", e);
    return NextResponse.json({ error: "Could not create banner" }, { status: 500 });
  }
}
