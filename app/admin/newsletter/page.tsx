import { Download, Mail } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { AdminHeader, AdminCard } from "@/components/admin/AdminShell";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminNewsletterPage() {
  const subs = await prisma.newsletterSubscriber.findMany({
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  return (
    <div className="p-6 lg:p-10">
      <AdminHeader
        title="Newsletter"
        description={`${subs.length} subscriber${subs.length !== 1 ? "s" : ""}`}
        action={
          <a
            href="/api/admin/newsletter"
            className="btn-outline inline-flex"
            download
          >
            <Download className="h-4 w-4" /> Export CSV
          </a>
        }
      />
      <AdminCard className="overflow-x-auto">
        {subs.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-12 text-center text-stone">
            <Mail className="h-8 w-8 text-mist" strokeWidth={1} />
            <p className="text-sm">No subscribers yet. They&apos;ll appear here when visitors sign up in the footer.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-[0.65rem] uppercase tracking-wide2 text-stone">
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Subscribed</th>
              </tr>
            </thead>
            <tbody>
              {subs.map((s) => (
                <tr key={s.id} className="border-b border-line last:border-0 hover:bg-bone/40">
                  <td className="px-5 py-3 text-ink">{s.email}</td>
                  <td className="px-5 py-3 text-stone">{formatDate(s.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </AdminCard>
    </div>
  );
}
