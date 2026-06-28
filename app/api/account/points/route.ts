import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/** Returns the signed-in customer's loyalty points balance (0 when logged out). */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ points: 0, loggedIn: false });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { loyaltyPoints: true },
  });
  return NextResponse.json({ points: user?.loyaltyPoints ?? 0, loggedIn: true });
}
