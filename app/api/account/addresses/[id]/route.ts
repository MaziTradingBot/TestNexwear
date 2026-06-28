import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Only delete the caller's own address.
  const address = await prisma.address.findFirst({ where: { id: params.id, userId: session.user.id } });
  if (!address) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.address.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
