import nodemailer from "nodemailer";
import { formatDate } from "@/lib/format";

type MailInput = { to: string; subject: string; html: string; text?: string };

const FROM = process.env.SMTP_FROM ?? "NexWear <onboarding@resend.dev>";

/**
 * Sends transactional email via (in priority order):
 *   1. Resend HTTP API  — set RESEND_API_KEY (recommended, free tier, no package)
 *   2. SMTP             — set SMTP_HOST / SMTP_USER / SMTP_PASS (your own email)
 *   3. Console fallback — logs the message (local/dev with nothing configured)
 */
export async function sendMail(opts: MailInput): Promise<{ delivered: boolean; via: string }> {
  const { RESEND_API_KEY, SMTP_HOST, SMTP_USER, SMTP_PASS, SMTP_PORT } = process.env;

  // 1) Resend
  if (RESEND_API_KEY) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ from: FROM, to: [opts.to], subject: opts.subject, html: opts.html, text: opts.text }),
      });
      if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
      return { delivered: true, via: "resend" };
    } catch (e) {
      console.error("[mailer] Resend failed:", (e as Error).message);
    }
  }

  // 2) SMTP
  if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT ?? 587),
        secure: Number(SMTP_PORT) === 465,
        auth: { user: SMTP_USER, pass: SMTP_PASS },
      });
      await transporter.sendMail({ from: FROM, to: opts.to, subject: opts.subject, text: opts.text, html: opts.html });
      return { delivered: true, via: "smtp" };
    } catch (e) {
      console.error("[mailer] SMTP failed:", (e as Error).message);
    }
  }

  // 3) Console fallback
  console.log("\n📧 [DEV EMAIL] (no Resend/SMTP configured — logging instead)");
  console.log(`   To:      ${opts.to}`);
  console.log(`   Subject: ${opts.subject}`);
  console.log(`   ${opts.text ?? opts.html.replace(/<[^>]+>/g, " ").trim()}\n`);
  return { delivered: false, via: "console" };
}

/* ---------- Branded templates ---------- */

function shell(body: string) {
  return `<div style="font-family:Inter,Arial,sans-serif;max-width:520px;margin:0 auto;color:#0A0A0A">
    <h1 style="font-family:Georgia,serif;letter-spacing:.2em;text-transform:uppercase;font-size:22px;border-bottom:1px solid #E2DCD0;padding-bottom:16px">NexWear</h1>
    ${body}
    <p style="margin-top:28px;color:#9A9A9A;font-size:12px">© ${new Date().getFullYear()} NexWear · Modern Luxury Fashion</p>
  </div>`;
}

export function resetPasswordEmail(name: string, link: string) {
  return {
    subject: "Reset your NexWear password",
    text: `Hi ${name}, reset your password: ${link} (valid 1 hour).`,
    html: shell(`
      <p>Hi ${name},</p>
      <p>We received a request to reset your password. Click below to choose a new one — valid for 1 hour.</p>
      <p style="margin:28px 0"><a href="${link}" style="background:#0A0A0A;color:#fff;padding:14px 28px;text-decoration:none;text-transform:uppercase;letter-spacing:.15em;font-size:12px">Reset Password</a></p>
      <p style="color:#6B6B6B;font-size:13px">If you didn't request this, you can safely ignore this email.</p>`),
  };
}

export function orderConfirmationEmail(order: {
  orderNumber: string;
  customerName: string;
  total: number;
  trackingNumber: string | null;
  estimatedDelivery: Date | string | null;
  items: { title: string; quantity: number; unitPrice: number; size?: string | null; color?: string | null }[];
}) {
  const rows = order.items
    .map(
      (i) =>
        `<tr><td style="padding:8px 0;border-bottom:1px solid #EFEAE0">${i.title}${i.size ? ` · ${i.size}` : ""}${i.color ? ` · ${i.color}` : ""} × ${i.quantity}</td><td style="padding:8px 0;border-bottom:1px solid #EFEAE0;text-align:right">$${(i.unitPrice * i.quantity).toFixed(2)}</td></tr>`,
    )
    .join("");
  return {
    subject: `Your NexWear order ${order.orderNumber} is confirmed`,
    text: `Thanks ${order.customerName}! Order ${order.orderNumber} confirmed. Total $${order.total.toFixed(2)}. Tracking: ${order.trackingNumber ?? "—"}.`,
    html: shell(`
      <p style="text-transform:uppercase;letter-spacing:.2em;font-size:11px;color:#B07A3E">Order Confirmed</p>
      <p>Thank you, ${order.customerName}! We've received your order and it's being prepared.</p>
      <table style="width:100%;border-collapse:collapse;margin:18px 0;font-size:14px">${rows}
        <tr><td style="padding:12px 0;font-weight:600">Total</td><td style="padding:12px 0;text-align:right;font-weight:600">$${order.total.toFixed(2)}</td></tr>
      </table>
      <p style="font-size:13px;color:#6B6B6B">Order number: <strong style="color:#0A0A0A">${order.orderNumber}</strong><br/>
      Tracking number: <strong style="color:#0A0A0A">${order.trackingNumber ?? "—"}</strong><br/>
      ${order.estimatedDelivery ? `Estimated delivery: <strong style="color:#0A0A0A">${formatDate(order.estimatedDelivery)}</strong>` : ""}</p>`),
  };
}

export function contactNotificationEmail(name: string, email: string, subject: string, message: string) {
  return {
    subject: `[Contact] ${subject}`,
    text: `From ${name} <${email}>\n\n${message}`,
    html: shell(`<p><strong>${name}</strong> &lt;${email}&gt;</p><p style="white-space:pre-wrap">${message}</p>`),
  };
}
