"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { AuthShell, AuthLink } from "@/components/auth/AuthShell";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/account";

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password");
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
  }

  return (
    <AuthShell
      title="Sign In"
      subtitle="Welcome back to NexWear"
      footer={<>New here? <AuthLink href="/register">Create an account</AuthLink></>}
    >
      <form onSubmit={submit} className="space-y-5">
        <Field label="Email">
          <Input type="email" required value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
        </Field>
        <Field label="Password">
          <Input type="password" required value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
        </Field>
        {error && <p className="text-sm text-sale">{error}</p>}
        <div className="text-right">
          <AuthLink href="/forgot-password">Forgot password?</AuthLink>
        </div>
        <Button type="submit" full size="lg" disabled={loading}>
          {loading ? "Signing in…" : "Sign In"}
        </Button>
      </form>
      <p className="mt-5 rounded-none border border-line bg-bone p-3 text-center text-xs text-stone">
        Demo: customer@nexwear.com / Customer123!
      </p>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="container-luxe py-24" />}>
      <LoginForm />
    </Suspense>
  );
}
