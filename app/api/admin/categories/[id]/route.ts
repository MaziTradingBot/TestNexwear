import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guardAdminApi } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const denied = await guardAdminApi();
  if (denied) return denied;
  try {
    const count = await prisma.product.count({ where: { categoryId: params.id } });
    if (count > 0) {
      return NextResponse.json({ error: `Category has ${count} products — move or delete them first.` }, { status: 409 });
    }
    await prisma.category.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("DELETE /api/admin/categories/[id]", e);
    return NextResponse.json({ error: "Could not delete category" }, { status: 500 });
  }
}
