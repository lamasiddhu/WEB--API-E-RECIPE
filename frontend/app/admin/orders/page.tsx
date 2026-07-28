"use client";

import { useEffect, useState } from "react";
import { Search, Plus, Loader2 } from "lucide-react";
import OrderCard, { Order } from "../../_components/admin/OrderCard";
import OrderDetailModal from "../../_components/admin/OrderDetailModal";
import CancelOrderModal from "../../_components/admin/CancelOrderModal";
import LogisticsSummary from "../../_components/admin/LogisticsSummary";
import { getAllOrders, cancelOrder, acceptOrder, deleteOrder, ApiOrder } from "@/lib/composition/api";

const FILTERS = ["All Orders", "Today", "Delayed", "Cancelled"];

const toOrder = (apiOrder: ApiOrder): Order => ({
  id: apiOrder._id,
  orderNumber: apiOrder.orderNumber,
  customer: apiOrder.customer,
  item: apiOrder.item,
  items: apiOrder.items,
  price: apiOrder.price,
  status: apiOrder.status,
  createdAt: apiOrder.createdAt,
  cancelReason: apiOrder.cancelReason,
  format: apiOrder.format,
});

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All Orders");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [cancellingOrder, setCancellingOrder] = useState<Order | null>(null);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  useEffect(() => {
    getAllOrders()
      .then((result) => setOrders((result.data || []).map(toOrder)))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Failed to load orders"))
      .finally(() => setIsLoading(false));
  }, []);

  const filteredOrders = orders.filter((order) => {
    if (activeFilter === "Delayed" && order.status !== "Delayed") return false;
    if (activeFilter === "Cancelled" && order.status !== "Cancelled") return false;
    if (!query) return true;
    const q = query.toLowerCase();
    return order.orderNumber.toLowerCase().includes(q) || order.customer.toLowerCase().includes(q);
  });

  const handleCancel = async (id: string, reason: string) => {
    await cancelOrder(id, reason);
    setOrders((prev) =>
      prev.map((order) => (order.id === id ? { ...order, status: "Cancelled", cancelReason: reason } : order))
    );
  };

  const handleAccept = async (id: string) => {
    setAcceptingId(id);
    try {
      await acceptOrder(id);
      setOrders((prev) => prev.map((order) => (order.id === id ? { ...order, status: "Completed" } : order)));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to accept order");
    } finally {
      setAcceptingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteOrder(id);
      setOrders((prev) => prev.filter((order) => order.id !== id));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete order");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
          <p className="text-gray-500 mt-1">Review and manage recent ingredient deliveries and recipe kit orders across your culinary network.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#B34B20] text-white rounded-xl text-sm font-semibold hover:bg-[#A64B1C]">
          <Plus className="w-4 h-4" /> Create New Order
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by order ID or customer name..."
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#B34B20]/20"
          />
        </div>
        <div className="flex bg-gray-100 rounded-xl p-1">
          {FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                activeFilter === filter ? "bg-white text-[#B34B20] shadow-sm" : "text-gray-600"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onViewDetails={setViewingOrder}
                onCancelClick={setCancellingOrder}
                onAccept={handleAccept}
                isAccepting={acceptingId === order.id}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
        <LogisticsSummary />
      </div>

      {viewingOrder && (
        <OrderDetailModal
          order={viewingOrder}
          onClose={() => setViewingOrder(null)}
          onCancelClick={setCancellingOrder}
          onAccept={handleAccept}
          isAccepting={acceptingId === viewingOrder.id}
        />
      )}

      {cancellingOrder && (
        <CancelOrderModal
          order={cancellingOrder}
          onClose={() => setCancellingOrder(null)}
          onConfirm={handleCancel}
        />
      )}
    </div>
  );
}
