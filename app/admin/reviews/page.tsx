import { prisma } from "@/lib/prisma";
import { AdminHeader, AdminCard } from "@/components/admin/AdminShell";
import { ReviewsTable } from "@/components/admin/ReviewsTable";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  const rows = await prisma.review.findMany({
    orderBy: [{ isApproved: "asc" }, { createdAt: "desc" }],
    take: 200,
    include: { product: { select: { title: true } }, user: { select: { name: true } } },
  });

  const pending = rows.filter((r) => !r.isApproved).length;
  const reviews = rows.map((r) => ({
    id: r.id,
    product: r.product.title,
    author: r.user.name ?? "Customer",
    rating: r.rating,
    title: r.title,
    comment: r.comment,
    isApproved: r.isApproved,
    isVerified: r.isVerified,
    createdAt: r.createdAt.toISOString(),
  }));

  return (
    <div className="p-6 lg:p-10">
      <AdminHeader
        title="Reviews"
        description={pending > 0 ? `${pending} pending approval · ${reviews.length} total` : `${reviews.length} reviews`}
      />
      <AdminCard className="overflow-x-auto">
        <ReviewsTable reviews={reviews} />
      </AdminCard>
    </div>
  );
}
