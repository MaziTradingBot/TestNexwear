"use client";

import { useEffect, useState } from "react";

function diff(target: number) {
  const ms = Math.max(0, target - Date.now());
  return {
    days: Math.floor(ms / 86_400_000),
    hours: Math.floor((ms / 3_600_000) % 24),
    minutes: Math.floor((ms / 60_000) % 60),
    seconds: Math.floor((ms / 1000) % 60),
  };
}

export function CountdownTimer({
  target,
  light = false,
}: {
  target: Date | string | number;
  light?: boolean;
}) {
  const targetMs =
    typeof target === "number" ? target : new Date(target).getTime();
  const [time, setTime] = useState(() => diff(targetMs));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const id = setInterval(() => setTime(diff(targetMs)), 1000);
    return () => clearInterval(id);
  }, [targetMs]);

  const units = [
    { label: "Days", value: time.days },
    { label: "Hrs", value: time.hours },
    { label: "Min", value: time.minutes },
    { label: "Sec", value: time.seconds },
  ];

  return (
    <div className="flex items-center gap-3">
      {units.map((u, i) => (
        <div key={u.label} className="flex items-center gap-3">
          <div className="text-center">
            <div
              className={`min-w-[3rem] px-2 py-2 font-serif text-2xl tabular-nums md:text-3xl ${
                light ? "bg-white/10 text-white" : "bg-ink text-white"
              }`}
            >
              {mounted ? String(u.value).padStart(2, "0") : "00"}
            </div>
            <div className={`mt-1.5 text-[0.6rem] uppercase tracking-wide2 ${light ? "text-white/70" : "text-stone"}`}>
              {u.label}
            </div>
          </div>
          {i < units.length - 1 && (
            <span className={`-mt-5 text-xl ${light ? "text-white/60" : "text-mist"}`}>:</span>
          )}
        </div>
      ))}
    </div>
  );
}
