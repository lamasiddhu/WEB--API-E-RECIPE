"use client";

import { useEffect, useState } from "react";
import { Search, Filter, Plus, KeyRound, Edit, Trash2, Loader2, ShieldCheck } from "lucide-react";
import { getAllUsers, createUser, updateUser, deleteUser, requestPasswordReset, AdminUser } from "../../../lib/api/admin/user";
import AddUserModal, { NewUserInput } from "../../_components/admin/AddUserModal";
import EditUserModal, { EditUserInput } from "../../_components/admin/EditUserModal";

const PAGE_LIMIT = 10;

const getRoleColor = (role: string) => {
  switch (role) {
    case "admin": return "bg-[#B34B20]/10 text-[#B34B20]";
    default: return "bg-gray-100 text-gray-600";
  }
};

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [adminCount, setAdminCount] = useState(0);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [resettingId, setResettingId] = useState<string | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsLoading(true);
      setError("");
      getAllUsers({ page, limit: PAGE_LIMIT, search: query })
        .then((result) => {
          setUsers(result.data || []);
          setTotal(result.meta?.total || 0);
        })
        .catch((err: unknown) => setError(err instanceof Error ? err.message : "Failed to load users"))
        .finally(() => setIsLoading(false));
    }, 300);
    return () => clearTimeout(timeout);
  }, [page, query]);

  useEffect(() => {
    getAllUsers({ page: 1, limit: 1000 })
      .then((result) => {
        const all: AdminUser[] = result.data || [];
        setAdminCount(all.filter((u) => u.role === "admin").length);
      })
      .catch(() => {});
  }, [users]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT));

  const handleAdd = async (input: NewUserInput) => {
    await createUser(input);
    setPage(1);
    const result = await getAllUsers({ page: 1, limit: PAGE_LIMIT, search: query });
    setUsers(result.data || []);
    setTotal(result.meta?.total || 0);
  };

  const handleSaveEdit = async (input: EditUserInput) => {
    if (!editingUser) return;
    await updateUser(editingUser._id, input);
    setUsers((prev) => prev.map((u) => (u._id === editingUser._id ? { ...u, ...input } : u)));
  };

  const handleRequestPasswordReset = async (user: AdminUser) => {
    if (!confirm(`Send a password reset request to ${user.fullName}? They'll get a notification to set a new password themselves.`)) return;
    setResettingId(user._id);
    try {
      await requestPasswordReset(user._id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send password reset request");
    } finally {
      setResettingId(null);
    }
  };

  const handleDelete = async (user: AdminUser) => {
    if (!confirm(`Delete ${user.fullName}? This cannot be undone.`)) return;
    try {
      await deleteUser(user._id);
      setUsers((prev) => prev.filter((u) => u._id !== user._id));
      setTotal((prev) => prev - 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete user");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500 mt-1">Manage culinary access, roles, and community activity.</p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#B34B20] text-white rounded-xl text-sm font-semibold hover:bg-[#A64B1C]"
        >
          <Plus className="w-4 h-4" /> Invite User
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
          <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-3 text-[#B34B20]">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-3xl font-bold text-gray-900">{total.toLocaleString()}</h3>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">Total Users</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
          <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3 text-green-600">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-3xl font-bold text-gray-900">{adminCount.toLocaleString()}</h3>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">Admin Accounts</p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="font-bold text-gray-900 text-lg">Community Members</h3>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={query}
                onChange={(e) => {
                  setPage(1);
                  setQuery(e.target.value);
                }}
                type="text"
                placeholder="Search by name or email..."
                className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#B34B20]/20 w-64"
              />
            </div>
            <button className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50"><Filter className="w-4 h-4 text-gray-600" /></button>
          </div>
        </div>

        {error && <p className="px-6 pt-4 text-sm text-red-600">{error}</p>}

        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 font-semibold uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">User Name</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Joined</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#B34B20] to-[#A64B1C] flex items-center justify-center text-white font-bold text-xs">
                          {initials(user.fullName)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{user.fullName}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${getRoleColor(user.role)}`}>{user.role}</span>
                        {user.isPro && (
                          <span className="px-2 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">PRO</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingUser(user)}
                          className="p-2 text-gray-400 hover:text-[#B34B20] hover:bg-orange-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRequestPasswordReset(user)}
                          disabled={resettingId === user._id}
                          title="Send password reset request"
                          className="p-2 text-gray-400 hover:text-[#B34B20] hover:bg-orange-50 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {resettingId === user._id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <KeyRound className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400">No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
          <p>Showing {users.length} of {total.toLocaleString()} members</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-2">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {isAddOpen && <AddUserModal onClose={() => setIsAddOpen(false)} onAdd={handleAdd} />}
      {editingUser && (
        <EditUserModal
          initialData={{ fullName: editingUser.fullName, email: editingUser.email, role: editingUser.role, isPro: !!editingUser.isPro }}
          onClose={() => setEditingUser(null)}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
}
