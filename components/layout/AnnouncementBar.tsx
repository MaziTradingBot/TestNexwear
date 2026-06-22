"use client";

const MESSAGES = [
  "Summer Sale — Up To 50% Off",
  "Free Express Shipping On Orders Over $150",
  "New Season Arrivals Now Live",
  "Members Earn Loyalty Points On Every Order",
];

export function AnnouncementBar() {
  // Duplicate the list so the -50% marquee translate loops seamlessly.
  const items = [...MESSAGES, ...MESSAGES];
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
