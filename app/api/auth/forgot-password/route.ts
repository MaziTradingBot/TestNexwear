import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validations/auth";
import { sendMail, resetPasswordEmail } from "@/lib/mailer";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { SITE } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const limit = rateLimit(`forgot:${clientIp(req)}`, 5, 60_000);
  if (!limit.ok) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const body = await req.json().catch(() => null);
  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid email" }, { status: 400 });

  const email = parsed.data.email.toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email } });

  // Always respond OK to avoid leaking which emails are registered
  if (user) {
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Remove any existing tokens for this identifier
    await prisma.verificationToken.deleteMany({ where: { identifier: email } });
    await prisma.verificationToken.create({ data: { identifier: email, token, expires } });

    const link = `${SITE.url}/reset-password?token=${token}`;
    const mail = resetPasswordEmail(user.name ?? "there", link);
    await sendMail({ to: email, ...mail });
  }

  return NextResponse.json({ ok: true });
}
