import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminHeader, AdminCard } from "@/components/admin/AdminShell";
import { UsersTable } from "@/components/admin/UsersTable";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);
  const rows = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 300,
    include: { _count: { select: { orders: true } } },
  });

  const users = rows.map((u) => ({
    id: u.id,
    name: u.name ?? "",
    email: u.email,
    role: u.role,
    orders: u._count.orders,
    createdAt: u.createdAt.toISOString(),
  }));

  return (
    <div className="p-6 lg:p-10">
      <AdminHeader
        title="Users"
        description={`${users.length} account${users.length !== 1 ? "s" : ""} · make or remove admins, delete accounts`}
      />
      <AdminCard className="overflow-x-auto">
        <UsersTable users={users} currentUserId={session?.user?.id ?? ""} />
      </AdminCard>
    </div>
  );
}
