import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { guardAdminApi } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const denied = await guardAdminApi();
  if (denied) return denied;
  const parsed = z.object({ isActive: z.boolean() }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  await prisma.banner.update({ where: { id: params.id }, data: { isActive: parsed.data.isActive } });
  revalidateTag("catalog");
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const denied = await guardAdminApi();
  if (denied) return denied;
  try {
    await prisma.banner.delete({ where: { id: params.id } });
    revalidateTag("catalog");
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("DELETE /api/admin/banners/[id]", e);
    return NextResponse.json({ error: "Could not delete banner" }, { status: 500 });
  }
}
