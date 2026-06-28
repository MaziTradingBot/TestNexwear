"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!document.cookie.split("; ").some((c) => c.startsWith("cookie-consent="))) {
      setShow(true);
    }
  }, []);

  function decide(value: "accepted" | "declined") {
    document.cookie = `cookie-consent=${value}; path=/; max-age=31536000; samesite=lax`;
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[150] border-t border-line bg-cream/95 backdrop-blur print:hidden">
      <div className="container-luxe flex flex-col items-center gap-4 py-4 sm:flex-row sm:justify-between">
        <p className="text-xs leading-relaxed text-stone">
          We use cookies to keep your bag and preferences, and to improve your experience. See our{" "}
          <Link href="/privacy" className="text-ink underline underline-offset-2 hover:text-gold">Privacy Policy</Link>.
        </p>
        <div className="flex shrink-0 gap-2">
          <Button size="sm" variant="outline" onClick={() => decide("declined")}>Decline</Button>
          <Button size="sm" onClick={() => decide("accepted")}>Accept</Button>
        </div>
      </div>
    </div>
  );
}
