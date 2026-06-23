import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { guardAdminApi } from "@/lib/admin";
import { slugify, randomSuffix } from "@/lib/slug";

export const dynamic = "force-dynamic";

const schema = z.object({
  name: z.string().min(2).max(60),
  department: z.enum(["men", "women", "shoes", "accessories"]),
  imageUrl: z.string().url().optional().nullable().or(z.literal("")),
});

export async function POST(req: Request) {
  const denied = await guardAdminApi();
  if (denied) return denied;

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid category" }, { status: 400 });
  const d = parsed.data;

  try {
    await prisma.category.create({
      data: {
        name: d.name,
        department: d.department,
        slug: `${slugify(`${d.department}-${d.name}`)}-${randomSuffix(3)}`,
        imageUrl: d.imageUrl || null,
      },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("POST /api/admin/categories", e);
    return NextResponse.json({ error: "Could not create category" }, { status: 500 });
  }
}
