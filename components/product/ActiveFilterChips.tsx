"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";

const KEYS = ["category", "brand", "color", "size", "material"];

export function ActiveFilterChips() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const chips: { key: string; value: string; label: string }[] = [];
  for (const key of KEYS) {
    for (const value of searchParams.getAll(key)) {
      chips.push({ key, value, label: value.replace(/-/g, " ") });
    }
  }
  if (searchParams.get("sale") === "true") chips.push({ key: "sale", value: "true", label: "On Sale" });
  const min = searchParams.get("min");
  const max = searchParams.get("max");
  if (min || max) chips.push({ key: "price", value: "", label: `$${min || 0} – $${max || "∞"}` });

  if (chips.length === 0) return null;

  function remove(key: string, value: string) {
    const next = new URLSearchParams(searchParams.toString());
    if (key === "price") {
      next.delete("min");
      next.delete("max");
    } else if (value) {
      const rest = next.getAll(key).filter((v) => v !== value);
      next.delete(key);
      rest.forEach((v) => next.append(key, v));
    } else {
      next.delete(key);
    }
    next.delete("page");
    router.push(`${pathname}?${next.toString()}`, { scroll: false });
  }

  function clearAll() {
    const q = searchParams.get("q");
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    router.push(`${pathname}${params.toString() ? `?${params}` : ""}`, { scroll: false });
  }

  return (
    <div className="flex flex-wrap items-center gap-2 py-4">
      {chips.map((c) => (
        <button
          key={`${c.key}-${c.value}`}
          onClick={() => remove(c.key, c.value)}
          className="flex items-center gap-1.5 border border-line bg-bone px-3 py-1.5 text-xs capitalize text-ink hover:border-ink"
        >
          {c.label}
          <X className="h-3 w-3" />
        </button>
      ))}
      <button onClick={clearAll} className="ml-1 text-xs text-stone underline underline-offset-2 hover:text-ink">
        Clear all
      </button>
    </div>
  );
}
