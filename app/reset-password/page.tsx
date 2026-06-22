"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { AuthShell, AuthLink } from "@/components/auth/AuthShell";

function ResetForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Could not reset password");
      return;
    }
    setDone(true);
    setTimeout(() => router.push("/login"), 1800);
  }

  if (!token) {
    return (
      <AuthShell title="Reset Password" footer={<AuthLink href="/forgot-password">Request a new link</AuthLink>}>
        <p className="border border-line bg-bone p-6 text-center text-sm text-sale">
          Missing or invalid reset token.
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="New Password" subtitle="Choose a new password for your account">
      {done ? (
        <div className="border border-line bg-bone p-6 text-center text-sm text-gold">
          Password updated. Redirecting to sign in…
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-5">
          <Field label="New Password">
            <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </Field>
          <p className="text-[0.7rem] text-mist">At least 8 characters with an uppercase letter and a number.</p>
          {error && <p className="text-sm text-sale">{error}</p>}
          <Button type="submit" full size="lg" disabled={loading}>
            {loading ? "Updating…" : "Update Password"}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="container-luxe py-24" />}>
      <ResetForm />
    </Suspense>
  );
}
