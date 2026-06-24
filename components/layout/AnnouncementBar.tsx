"use client";

import { useT } from "@/components/providers/I18nProvider";

export function AnnouncementBar() {
  const t = useT();
  const base = [t("announce.sale"), t("announce.shipping"), t("announce.new"), t("announce.loyalty")];
  // Duplicate the list so the marquee translate loops seamlessly.
  const items = [...base, ...base];
  return (
    <div className="marquee-paused overflow-hidden bg-ink py-2.5 text-white">
      <div className="marquee-track flex w-max whitespace-nowrap">
        {items.map((m, i) => (
          <span
            key={i}
            className="mx-8 text-[0.65rem] font-medium uppercase tracking-luxe text-white/90"
          >
            {m}
          </span>
        ))}
      </div>
    </div>
  );
}
