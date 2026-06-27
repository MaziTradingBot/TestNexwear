"use client";

import { useEffect, useState } from "react";
import { getProviders, signIn } from "next-auth/react";

/**
 * "Continue with Google" — renders only when the Google provider is configured
 * (detected via NextAuth's provider list), so it stays hidden until keys exist.
 */
export function GoogleButton({ callbackUrl = "/account" }: { callbackUrl?: string }) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    getProviders()
      .then((p) => setEnabled(!!p?.google))
      .catch(() => setEnabled(false));
  }, []);

  if (!enabled) return null;

  return (
    <div className="space-y-5">
      <button
        type="button"
        onClick={() => signIn("google", { callbackUrl })}
        className="btn-outline w-full !normal-case !tracking-normal"
      >
        <GoogleIcon />
        Continue with Google
      </button>
      <div className="flex items-center gap-4">
        <span className="h-px flex-1 bg-line" />
        <span className="text-[0.65rem] uppercase tracking-wide2 text-mist">or</span>
        <span className="h-px flex-1 bg-line" />
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35 24 35c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 5.1 29.6 3 24 3 11.8 3 2 12.8 2 25s9.8 22 22 22 22-9.8 22-22c0-1.5-.2-2.9-.4-4.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 5.1 29.6 3 24 3 16.3 3 9.7 7.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 47c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.2 38 26.7 39 24 39c-5.3 0-9.7-2.6-11.3-6.9l-6.6 5.1C9.6 42.6 16.2 47 24 47z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.5l6.3 5.3C41.9 35.4 46 30.5 46 25c0-1.5-.2-2.9-.4-4.5z" />
    </svg>
  );
}
