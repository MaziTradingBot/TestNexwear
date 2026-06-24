import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export const dynamic = "force-dynamic";

const roleSchema = z.object({ role: z.enum(["ADMIN", "CUSTOMER", "SUPPORT"]) });

async function adminGuard() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  if (session.user.role !== "ADMIN") return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  return { session };
}

// Change a user's role (assign / unassign admin)
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { error, session } = await adminGuard();
  if (error) return error;

  if (params.id === session!.user.id) {
    return NextResponse.json({ error: "You can't change your own role." }, { status: 400 });
  }

  const parsed = roleSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid role" }, { status: 400 });

  try {
    await prisma.user.update({ where: { id: params.id }, data: { role: parsed.data.role as Role } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("PATCH /api/admin/users/[id]", e);
    return NextResponse.json({ error: "Could not update user" }, { status: 500 });
  }
}

// Delete a user account
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const { error, session } = await adminGuard();
  if (error) return error;

  if (params.id === session!.user.id) {
    return NextResponse.json({ error: "You can't delete your own account." }, { status: 400 });
  }

  try {
    // Detach past orders (keep them as guest orders) before removing the account
    await prisma.order.updateMany({ where: { userId: params.id }, data: { userId: null } });
    await prisma.user.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("DELETE /api/admin/users/[id]", e);
    return NextResponse.json({ error: "Could not delete user" }, { status: 500 });
  }
}
