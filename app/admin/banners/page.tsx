import { prisma } from "@/lib/prisma";
import { AdminHeader } from "@/components/admin/AdminShell";
import { BannerManager } from "@/components/admin/BannerManager";

export const dynamic = "force-dynamic";

export default async function AdminBannersPage() {
  const rows = await prisma.banner.findMany({ orderBy: [{ position: "asc" }, { createdAt: "desc" }] });
  const banners = rows.map((b) => ({
    id: b.id, title: b.title, eyebrow: b.eyebrow, subtitle: b.subtitle,
    ctaLabel: b.ctaLabel, ctaHref: b.ctaHref, imageUrl: b.imageUrl, position: b.position, isActive: b.isActive,
  }));

  return (
    <div className="p-6 lg:p-10">
      <AdminHeader title="Banners" description="Homepage promo banners — active ones show on the storefront." />
      <BannerManager banners={banners} />
    </div>
  );
}
