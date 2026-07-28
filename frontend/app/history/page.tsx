"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Loader2 } from "lucide-react";
import Sidebar from "../_components/dashboard/Sidebar";
import TopBar from "../_components/dashboard/TopBar";
import ThisWeekSection from "../_components/history/ThisWeekSection";
import EarlierMonthList from "../_components/history/EarlierMonthList";
import { getMyOrders, ApiOrder } from "@/lib/composition/api";

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export default function HistoryPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [query, setQuery] = useState("");
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [now] = useState(() => Date.now());

  useEffect(() => {
    getMyOrders()
      .then((result) => setOrders(result.data || []))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Failed to load your history"))
      .finally(() => setIsLoading(false));
  }, []);

  const filteredOrders = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter(
      (order) => order.item.toLowerCase().includes(q) || order.orderNumber.toLowerCase().includes(q)
    );
  }, [orders, query]);

  const { thisWeekOrders, earlierOrders } = useMemo(() => {
    return {
      thisWeekOrders: filteredOrders.filter(
        (order) => order.createdAt && now - new Date(order.createdAt).getTime() <= ONE_WEEK_MS
      ),
      earlierOrders: filteredOrders.filter(
        (order) => !order.createdAt || now - new Date(order.createdAt).getTime() > ONE_WEEK_MS
      ),
    };
  }, [filteredOrders, now]);

  return (
    <div className="flex h-screen bg-[#FDFBF7] overflow-hidden">
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-auto ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar />
      </div>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

        <main className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth">
          <div className="max-w-6xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">Order History</h1>
              <p className="text-gray-500">
                Everything you&apos;ve ordered, real and up to date.
              </p>
            </div>

            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search your history..."
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#B34B20]/20"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            {isLoading ? (
              <div className="flex items-center justify-center py-16 text-gray-400">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
                {orders.length === 0
                  ? "You haven't placed any orders yet."
                  : "No orders match your search."}
              </div>
            ) : (
              <>
                <ThisWeekSection orders={thisWeekOrders} />
                <EarlierMonthList orders={earlierOrders} />
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
