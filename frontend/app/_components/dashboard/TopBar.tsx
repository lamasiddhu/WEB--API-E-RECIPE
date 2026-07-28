"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Filter, Menu, LogOut, User as UserIcon, Package, CheckCircle2, Megaphone, Crown, Check, X, Ban, PackageCheck, KeyRound, ChefHat } from "lucide-react";
import { useAuth } from "../../../lib/contexts/AuthContext";
import { resolveAssetUrl } from "@/lib/composition/api";
import { getAllOrders, ApiOrder } from "@/lib/composition/api";
import {
  getMyNotifications,
  respondToProRequest,
  respondToRecipeSubmission,
  markNotificationRead,
  markAllNotificationsRead,
  clearAllNotifications,
  ApiNotification,
} from "@/lib/composition/api";

interface TopBarProps {
  onToggleSidebar: () => void;
}

export default function TopBar({ onToggleSidebar }: TopBarProps) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const isAdmin = user?.role === "admin";
  const [openMenu, setOpenMenu] = useState<"notifications" | "profile" | null>(null);
  const [pendingOrders, setPendingOrders] = useState<ApiOrder[]>([]);
  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

  const loadNotifications = () => {
    getMyNotifications()
      .then((result) => setNotifications(result.data || []))
      .catch(() => setNotifications([]));
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    getAllOrders()
      .then((result) => {
        const orders: ApiOrder[] = result.data || [];
        setPendingOrders(orders.filter((o) => o.status === "Processing" || o.status === "Delayed"));
      })
      .catch(() => setPendingOrders([]));
  }, [isAdmin]);

  const toggleMenu = (menu: "notifications" | "profile") => {
    setOpenMenu((prev) => (prev === menu ? null : menu));
  };

  // Pending Pro requests / order alerts are actionable admin tasks, not
  // general notifications — they stay visible in the list even when
  // notifications are off. The red dot itself, though, follows read state
  // like everything else: "Mark all read" silences it even while a request
  // is still pending, and a genuinely new pending item lights it back up.
  const notificationsEnabled = user?.notificationPreferences?.push !== false;
  const pendingProRequests = notifications.filter((n) => n.type === "pro_request" && n.status === "pending");
  const pendingRecipeRequests = notifications.filter((n) => n.type === "recipe_submission" && n.status === "pending");
  const otherNotifications = notificationsEnabled
    ? notifications.filter((n) =>
        !((n.type === "pro_request" || n.type === "recipe_submission") && n.status === "pending")
      )
    : [];
  const hasUnread =
    pendingProRequests.some((n) => !n.isRead) ||
    pendingRecipeRequests.some((n) => !n.isRead) ||
    otherNotifications.some((n) => !n.isRead);

  const handleRespond = async (id: string, action: "approve" | "reject") => {
    setRespondingId(id);
    try {
      await respondToProRequest(id, action);
      loadNotifications();
    } catch {
      // no-op: request stays visible so the admin can retry
    } finally {
      setRespondingId(null);
    }
  };

  const handleRecipeRespond = async (id: string, action: "approve" | "reject") => {
    setRespondingId(id);
    try {
      await respondToRecipeSubmission(id, action);
      loadNotifications();
    } catch {
      // Keep the request visible so the admin can retry.
    } finally {
      setRespondingId(null);
    }
  };

  const handleOpenNotification = (n: ApiNotification) => {
    if (!n.isRead) {
      setNotifications((prev) => prev.map((item) => (item._id === n._id ? { ...item, isRead: true } : item)));
      markNotificationRead(n._id).catch(() => loadNotifications());
    }
    setOpenMenu(null);
    if (n.type === "password_reset_requested") {
      router.push("/reset-password");
    } else if (n.relatedRecipeId && n.type !== "recipe_rejected") {
      router.push(`/recipes/${n.relatedRecipeId}`);
    }
  };

  const handleMarkAllRead = async () => {
    setIsBulkUpdating(true);
    try {
      await markAllNotificationsRead();
      loadNotifications();
    } catch {
      // no-op: notifications stay as-is so the user can retry
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const handleClearAll = async () => {
    setIsBulkUpdating(true);
    try {
      await clearAllNotifications();
      loadNotifications();
    } catch {
      // no-op: notifications stay as-is so the user can retry
    } finally {
      setIsBulkUpdating(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-4 lg:px-8 py-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={onToggleSidebar} className="lg:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"><Menu className="w-6 h-6" /></button>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/search"
            className="p-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
            title="Filter & search recipes"
          >
            <Filter className="w-5 h-5" />
          </Link>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => toggleMenu("notifications")}
              className="p-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors relative"
            >
              <Bell className="w-5 h-5" />
              {hasUnread && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"></span>
              )}
            </button>

            {openMenu === "notifications" && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setOpenMenu(null)} />
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 z-50 overflow-hidden max-h-[28rem] overflow-y-auto">
                  <div className="p-4 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 flex items-center justify-between gap-2">
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm">Notifications</h3>
                    {notifications.length > 0 && (
                      <div className="flex items-center gap-3">
                        <button
                          onClick={handleMarkAllRead}
                          disabled={isBulkUpdating}
                          className="text-xs font-semibold text-[#B34B20] hover:underline disabled:opacity-60"
                        >
                          Mark all read
                        </button>
                        <button
                          onClick={handleClearAll}
                          disabled={isBulkUpdating}
                          className="text-xs font-semibold text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-60"
                        >
                          Clear all
                        </button>
                      </div>
                    )}
                  </div>

                  {isAdmin && pendingProRequests.length > 0 && (
                    <div className="divide-y divide-gray-50 dark:divide-gray-800 border-b border-gray-100 dark:border-gray-800">
                      {pendingProRequests.map((n) => (
                        <div key={n._id} className="p-4 flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 flex items-center justify-center shrink-0">
                            <Crown className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{n.message}</p>
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() => handleRespond(n._id, "approve")}
                                disabled={respondingId === n._id}
                                className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 disabled:opacity-60"
                              >
                                <Check className="w-3 h-3" /> Approve
                              </button>
                              <button
                                onClick={() => handleRespond(n._id, "reject")}
                                disabled={respondingId === n._id}
                                className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-xs font-semibold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-60"
                              >
                                <X className="w-3 h-3" /> Reject
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {isAdmin && pendingRecipeRequests.length > 0 && (
                    <div className="divide-y divide-gray-50 dark:divide-gray-800 border-b border-gray-100 dark:border-gray-800">
                      {pendingRecipeRequests.map((n) => (
                        <div key={n._id} className="p-4 flex items-start gap-3">
                          {n.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={resolveAssetUrl(n.imageUrl)} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-orange-50 text-[#B34B20] flex items-center justify-center shrink-0">
                              <ChefHat className="w-5 h-5" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-[#B34B20]">{n.senderName || "E-RECIPE"}</p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{n.message}</p>
                            <div className="flex gap-2 mt-2">
                              <button onClick={() => handleRecipeRespond(n._id, "approve")} disabled={respondingId === n._id} className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 disabled:opacity-60">
                                <Check className="w-3 h-3" /> Accept recipe
                              </button>
                              <button onClick={() => handleRecipeRespond(n._id, "reject")} disabled={respondingId === n._id} className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-xs font-semibold rounded-lg hover:bg-gray-200 disabled:opacity-60">
                                <X className="w-3 h-3" /> Reject
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {isAdmin && pendingOrders.length > 0 && (
                    <div className="max-h-60 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-800 border-b border-gray-100 dark:border-gray-800">
                      {pendingOrders.map((order) => (
                        <Link
                          key={order._id}
                          href="/admin/orders"
                          onClick={() => setOpenMenu(null)}
                          className="flex items-start gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <div className="w-8 h-8 rounded-full bg-orange-50 dark:bg-orange-900/20 text-[#B34B20] flex items-center justify-center shrink-0">
                            <Package className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">#{order.orderNumber} is {order.status.toLowerCase()}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{order.customer} • {order.item}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  {otherNotifications.length > 0 ? (
                    <div className="divide-y divide-gray-50 dark:divide-gray-800">
                      {otherNotifications.map((n) => (
                        <button
                          key={n._id}
                          onClick={() => handleOpenNotification(n)}
                          className={`w-full flex items-start gap-3 p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                            !n.isRead ? "bg-orange-50/40 dark:bg-orange-900/10" : ""
                          }`}
                        >
                          {n.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={resolveAssetUrl(n.imageUrl)} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                          ) : <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                              n.type === "announcement"
                                ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600"
                                : n.type === "pro_approved" || n.type === "order_accepted"
                                ? "bg-green-50 dark:bg-green-900/20 text-green-600"
                                : n.type === "order_cancelled"
                                ? "bg-red-50 dark:bg-red-900/20 text-red-600"
                                : n.type === "password_reset_requested"
                                ? "bg-amber-50 dark:bg-amber-900/20 text-amber-600"
                                : "bg-gray-100 dark:bg-gray-800 text-gray-500"
                            }`}
                          >
                            {n.type === "announcement" ? (
                              <Megaphone className="w-4 h-4" />
                            ) : n.type === "order_cancelled" ? (
                              <Ban className="w-4 h-4" />
                            ) : n.type === "order_accepted" ? (
                              <PackageCheck className="w-4 h-4" />
                            ) : n.type === "password_reset_requested" ? (
                              <KeyRound className="w-4 h-4" />
                            ) : (
                              <Crown className="w-4 h-4" />
                            )}
                          </div>}
                          <div className="min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-wide text-[#B34B20]">{n.senderName || "E-RECIPE"}</p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{n.title}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{n.message}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : !notificationsEnabled ? (
                    <div className="p-6 text-center text-gray-400 text-sm">
                      <Bell className="w-6 h-6 mx-auto mb-2 text-gray-300" />
                      Notifications are turned off. Enable them in Profile → Notifications.
                    </div>
                  ) : !isAdmin || (pendingProRequests.length === 0 && pendingRecipeRequests.length === 0 && pendingOrders.length === 0) ? (
                    <div className="p-6 text-center text-gray-400 text-sm">
                      <CheckCircle2 className="w-6 h-6 mx-auto mb-2 text-green-500" />
                      You&apos;re all caught up.
                    </div>
                  ) : null}

                  {isAdmin && (
                    <Link
                      href="/admin/orders"
                      onClick={() => setOpenMenu(null)}
                      className="block p-3 text-center text-sm font-semibold text-[#B34B20] hover:bg-gray-50 dark:hover:bg-gray-800 border-t border-gray-100 dark:border-gray-800"
                    >
                      View all orders
                    </Link>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Profile */}
          <div className="relative">
            <button onClick={() => toggleMenu("profile")} className="cursor-pointer">
              {user?.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={resolveAssetUrl(user.avatarUrl)}
                  alt={user.fullName}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#B34B20] to-[#A64B1C] flex items-center justify-center text-white font-bold text-sm">
                  {user?.fullName?.charAt(0) || "C"}
                </div>
              )}
            </button>

            {openMenu === "profile" && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setOpenMenu(null)} />
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 z-50 overflow-hidden">
                  <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.fullName || "Chef de Cuisine"}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                  </div>
                  <Link
                    href="/profile"
                    onClick={() => setOpenMenu(null)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <UserIcon className="w-4 h-4" /> View Profile
                  </Link>
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
