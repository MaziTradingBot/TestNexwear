import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guardAdminApi } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const denied = await guardAdminApi();
  if (denied) return denied;
  try {
    const count = await prisma.product.count({ where: { brandId: params.id } });
    if (count > 0) {
      return NextResponse.json({ error: `Brand has ${count} products — reassign or delete them first.` }, { status: 409 });
    }
    await prisma.brand.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("DELETE /api/admin/brands/[id]", e);
    return NextResponse.json({ error: "Could not delete brand" }, { status: 500 });
  }
}
