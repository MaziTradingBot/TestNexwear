"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { AuthShell, AuthLink } from "@/components/auth/AuthShell";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }).catch(() => null);
    setLoading(false);
    setSent(true);
  }

  return (
    <AuthShell
      title="Reset Password"
      subtitle="Enter your email and we'll send you a reset link"
      footer={<><AuthLink href="/login">Back to sign in</AuthLink></>}
    >
      {sent ? (
        <div className="border border-line bg-bone p-6 text-center text-sm text-stone">
          If an account exists for <span className="text-ink">{email}</span>, a reset link is on its way.
          <p className="mt-2 text-[0.7rem] text-mist">
            (In demo mode without SMTP, the link is printed to the server console.)
          </p>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-5">
          <Field label="Email">
            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Button type="submit" full size="lg" disabled={loading}>
            {loading ? "Sending…" : "Send Reset Link"}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
