"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/cn";

export function ProductGallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const ref = useRef<HTMLDivElement>(null);
  const list = images.length ? images : [""];

  function onMove(e: React.MouseEvent) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  }

  return (
    <div className="flex flex-col-reverse gap-4 md:flex-row">
      {/* Thumbnails */}
      <div className="flex gap-3 md:flex-col">
        {list.map((src, i) => (
          <button
            key={i}
            onMouseEnter={() => setActive(i)}
            onClick={() => setActive(i)}
            className={cn(
              "relative aspect-[3/4] w-16 shrink-0 overflow-hidden bg-bone transition md:w-20",
              active === i ? "ring-1 ring-ink" : "opacity-70 hover:opacity-100",
            )}
            aria-label={`View image ${i + 1}`}
          >
            {src && <Image src={src} alt="" fill sizes="80px" className="object-cover" />}
          </button>
        ))}
      </div>

      {/* Main image */}
      <div
        ref={ref}
        onMouseEnter={() => setZoom(true)}
        onMouseLeave={() => setZoom(false)}
        onMouseMove={onMove}
        className="relative aspect-[3/4] flex-1 cursor-zoom-in overflow-hidden bg-bone"
      >
        {list[active] && (
          <Image
            src={list[active]}
            alt={title}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className={cn("object-cover transition-transform duration-200", zoom && "scale-150")}
            style={zoom ? { transformOrigin: `${pos.x}% ${pos.y}%` } : undefined}
          />
        )}
      </div>
    </div>
  );
}
