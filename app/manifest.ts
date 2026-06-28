import type { MetadataRoute } from "next";
import { SITE } from "@/lib/constants";

/** PWA manifest — makes NexWear installable on mobile/desktop. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE.name} — ${SITE.tagline}`,
    short_name: SITE.name,
    description: SITE.description,
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#F3ECDD",
    theme_color: "#0A0A0A",
    categories: ["shopping", "lifestyle"],
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/logo-nx-black.svg", sizes: "any", type: "image/svg+xml" },
    ],
  };
}
