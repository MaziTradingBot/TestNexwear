"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, ShieldOff, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/format";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  orders: number;
  createdAt: string;
};

export function UsersTable({ users, currentUserId }: { users: AdminUser[]; currentUserId: string }) {
  const router = useRouter();
  const show = useToast((s) => s.show);
  const [busy, setBusy] = useState<string | null>(null);

  async function setRole(id: string, role: string) {
    setBusy(id);
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    setBusy(null);
    if (res.ok) {
      show(role === "ADMIN" ? "User is now an admin" : "Admin access removed");
      router.refresh();
    } else {
      const d = await res.json();
      show(d.error ?? "Could not update user");
    }
  }

  async function remove(id: string, email: string) {
    if (!confirm(`Delete the account for ${email}? This cannot be undone.`)) return;
    setBusy(id);
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    setBusy(null);
    if (res.ok) {
      show("Account deleted");
      router.refresh();
    } else {
      const d = await res.json();
      show(d.error ?? "Could not delete account");
    }
  }

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-line text-left text-[0.65rem] uppercase tracking-wide2 text-stone">
          <th className="px-5 py-3">User</th>
          <th className="px-5 py-3">Role</th>
          <th className="px-5 py-3">Orders</th>
          <th className="px-5 py-3">Joined</th>
          <th className="px-5 py-3 text-right">Actions</th>
        </tr>
      </thead>
      <tbody>
        {users.map((u) => {
          const isSelf = u.id === currentUserId;
          const isAdmin = u.role === "ADMIN";
          return (
            <tr key={u.id} className="border-b border-line last:border-0 hover:bg-bone/50">
              <td className="px-5 py-3">
                <p className="font-medium text-ink">{u.name || "—"}</p>
                <p className="text-[0.7rem] text-mist">{u.email}</p>
              </td>
              <td className="px-5 py-3">
                <Badge variant={isAdmin ? "gold" : "default"}>{u.role}</Badge>
                {isSelf && <span className="ml-2 text-[0.65rem] text-mist">(you)</span>}
              </td>
              <td className="px-5 py-3 text-stone">{u.orders}</td>
              <td className="px-5 py-3 text-stone">{formatDate(u.createdAt)}</td>
              <td className="px-5 py-3">
                <div className="flex items-center justify-end gap-3">
                  {isSelf ? (
                    <span className="text-[0.7rem] text-mist">—</span>
                  ) : (
                    <>
                      {isAdmin ? (
                        <button
                          onClick={() => setRole(u.id, "CUSTOMER")}
                          disabled={busy === u.id}
                          className="flex items-center gap-1 text-xs text-stone hover:text-ink disabled:opacity-50"
                          title="Remove admin access"
                        >
                          <ShieldOff className="h-4 w-4" /> Remove admin
                        </button>
                      ) : (
                        <button
                          onClick={() => setRole(u.id, "ADMIN")}
                          disabled={busy === u.id}
                          className="flex items-center gap-1 text-xs text-gold hover:text-gold-dark disabled:opacity-50"
                          title="Make this user an admin"
                        >
                          <ShieldCheck className="h-4 w-4" /> Make admin
                        </button>
                      )}
                      <button
                        onClick={() => remove(u.id, u.email)}
                        disabled={busy === u.id}
                        className="text-stone hover:text-sale disabled:opacity-50"
                        aria-label="Delete account"
                        title="Delete account"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
