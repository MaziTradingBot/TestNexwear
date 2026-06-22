import { NextResponse } from "next/server";
import { contactSchema } from "@/lib/validations/contact";
import { sendMail } from "@/lib/mailer";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const limit = rateLimit(`contact:${clientIp(req)}`, 5, 60_000);
  if (!limit.ok) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const body = await req.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid form" }, { status: 400 });
  }

  const { name, email, subject, message } = parsed.data;
  await sendMail({
    to: process.env.CONTACT_INBOX ?? "support@nexwear.com",
    subject: `[Contact] ${subject}`,
    text: `From ${name} <${email}>\n\n${message}`,
    html: `<p><strong>${name}</strong> &lt;${email}&gt;</p><p>${message}</p>`,
  });

  return NextResponse.json({ ok: true });
}
