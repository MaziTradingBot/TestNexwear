"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/cn";

export type FilterOptions = {
  categories: { name: string; slug: string }[];
  brands: { name: string; slug: string }[];
  colors: { name: string; hex: string }[];
  sizes: string[];
  materials: string[];
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-b border-line py-5">
      <button
        onClick={() => setOpen((o) => !o)}
        className="mb-3 flex w-full items-center justify-between text-[0.72rem] font-medium uppercase tracking-wide2"
      >
        {title}
        <span className="text-mist">{open ? "–" : "+"}</span>
      </button>
      {open && children}
    </div>
  );
}

export function FilterControls({ options }: { options: FilterOptions }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function commit(next: URLSearchParams) {
    next.delete("page");
    router.push(`${pathname}?${next.toString()}`, { scroll: false });
  }

  function toggleMulti(key: string, value: string) {
    const next = new URLSearchParams(searchParams.toString());
    const current = next.getAll(key);
    next.delete(key);
    if (current.includes(value)) {
      current.filter((v) => v !== value).forEach((v) => next.append(key, v));
    } else {
      [...current, value].forEach((v) => next.append(key, v));
    }
    commit(next);
  }

  function setSingle(key: string, value: string | null) {
    const next = new URLSearchParams(searchParams.toString());
    if (value === null) next.delete(key);
    else next.set(key, value);
    commit(next);
  }

  function setPrice(min: string, max: string) {
    const next = new URLSearchParams(searchParams.toString());
    min ? next.set("min", min) : next.delete("min");
    max ? next.set("max", max) : next.delete("max");
    commit(next);
  }

  const has = (key: string, value: string) => searchParams.getAll(key).includes(value);
  const minVal = searchParams.get("min") ?? "";
  const maxVal = searchParams.get("max") ?? "";
  const onSale = searchParams.get("sale") === "true";

  return (
    <div className="text-sm">
      {options.categories.length > 0 && (
        <Section title="Category">
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => setSingle("category", null)}
                className={cn("text-stone hover:text-ink", !searchParams.get("category") && "text-ink underline underline-offset-4")}
              >
                All
              </button>
            </li>
            {options.categories.map((c) => (
              <li key={c.slug}>
                <button
                  onClick={() => setSingle("category", c.slug)}
                  className={cn(
                    "text-stone hover:text-ink",
                    searchParams.get("category") === c.slug && "text-ink underline underline-offset-4",
                  )}
                >
                  {c.name}
                </button>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section title="Price">
        <div className="flex items-center gap-2">
          <input
            type="number"
            defaultValue={minVal}
            placeholder="Min"
            onBlur={(e) => setPrice(e.target.value, maxVal)}
            className="w-full border border-line px-2 py-1.5 text-xs focus:border-ink focus:outline-none"
          />
          <span className="text-mist">–</span>
          <input
            type="number"
            defaultValue={maxVal}
            placeholder="Max"
            onBlur={(e) => setPrice(minVal, e.target.value)}
            className="w-full border border-line px-2 py-1.5 text-xs focus:border-ink focus:outline-none"
          />
        </div>
        <button
          onClick={() => setSingle("sale", onSale ? null : "true")}
          className={cn(
            "mt-3 flex items-center gap-2 text-xs",
            onSale ? "text-sale" : "text-stone hover:text-ink",
          )}
        >
          <span className={cn("h-3.5 w-3.5 border", onSale ? "border-sale bg-sale" : "border-line")} />
          On Sale Only
        </button>
      </Section>

      <Section title="Color">
        <div className="flex flex-wrap gap-2.5">
          {options.colors.map((c) => (
            <button
              key={c.name}
              onClick={() => toggleMulti("color", c.name)}
              title={c.name}
              aria-label={c.name}
              className={cn(
                "h-7 w-7 rounded-full border transition",
                has("color", c.name) ? "ring-2 ring-ink ring-offset-2" : "border-line",
              )}
              style={{ backgroundColor: c.hex }}
            />
          ))}
        </div>
      </Section>

      {options.sizes.length > 0 && (
        <Section title="Size">
          <div className="flex flex-wrap gap-2">
            {options.sizes.map((s) => (
              <button
                key={s}
                onClick={() => toggleMulti("size", s)}
                className={cn(
                  "min-w-[2.5rem] border px-2 py-1.5 text-xs transition",
                  has("size", s) ? "border-ink bg-ink text-white" : "border-line hover:border-ink",
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </Section>
      )}

      <Section title="Brand">
        <ul className="max-h-52 space-y-2 overflow-y-auto pr-1">
          {options.brands.map((b) => (
            <li key={b.slug}>
              <button
                onClick={() => toggleMulti("brand", b.slug)}
                className="flex items-center gap-2 text-stone hover:text-ink"
              >
                <span className={cn("h-3.5 w-3.5 border", has("brand", b.slug) ? "border-ink bg-ink" : "border-line")} />
                {b.name}
              </button>
            </li>
          ))}
        </ul>
      </Section>

      {options.materials.length > 0 && (
        <Section title="Material">
          <ul className="space-y-2">
            {options.materials.map((m) => (
              <li key={m}>
                <button
                  onClick={() => toggleMulti("material", m)}
                  className="flex items-center gap-2 text-stone hover:text-ink"
                >
                  <span className={cn("h-3.5 w-3.5 border", has("material", m) ? "border-ink bg-ink" : "border-line")} />
                  {m}
                </button>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}
