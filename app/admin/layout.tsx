import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  return (
    <div className="flex min-h-screen flex-col bg-bone lg:flex-row">
      <AdminSidebar name={session.user.name ?? "Admin"} />
      <div className="flex-1 overflow-x-hidden">{children}</div>
    </div>
  );
}
