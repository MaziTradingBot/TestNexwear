import nodemailer from "nodemailer";

/**
 * Sends transactional email. If SMTP env vars are not configured, the message
 * is logged to the server console instead (useful for local dev / demos).
 */
export async function sendMail(opts: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.log("\n📧 [DEV EMAIL] (SMTP not configured — logging instead)");
    console.log(`   To:      ${opts.to}`);
    console.log(`   Subject: ${opts.subject}`);
    console.log(`   ${opts.text ?? opts.html.replace(/<[^>]+>/g, " ").trim()}\n`);
    return { delivered: false as const };
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT ?? 587),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  await transporter.sendMail({
    from: SMTP_FROM ?? "NexWear <no-reply@nexwear.com>",
    to: opts.to,
    subject: opts.subject,
    text: opts.text,
    html: opts.html,
  });
  return { delivered: true as const };
}

export function resetPasswordEmail(name: string, link: string) {
  return {
    subject: "Reset your NexWear password",
    text: `Hi ${name}, reset your password using this link: ${link} (valid for 1 hour).`,
    html: `
      <div style="font-family:Inter,Arial,sans-serif;max-width:480px;margin:0 auto;color:#0A0A0A">
        <h1 style="font-family:Georgia,serif;letter-spacing:.1em;text-transform:uppercase;font-size:22px">NexWear</h1>
        <p>Hi ${name},</p>
        <p>We received a request to reset your password. Click below to choose a new one. This link is valid for 1 hour.</p>
        <p style="margin:28px 0">
          <a href="${link}" style="background:#0A0A0A;color:#fff;padding:14px 28px;text-decoration:none;text-transform:uppercase;letter-spacing:.15em;font-size:12px">Reset Password</a>
        </p>
        <p style="color:#6B6B6B;font-size:13px">If you didn't request this, you can safely ignore this email.</p>
      </div>`,
  };
}
