"use client";

import { Clock, Package } from "lucide-react";
import { ApiOrder } from "../../../lib/api/order";

const STATUS_CLASSNAMES: Record<ApiOrder["status"], string> = {
  Completed: "bg-green-100 text-green-700",
  Processing: "bg-orange-100 text-orange-700",
  Delayed: "bg-red-100 text-red-700",
  Cancelled: "bg-gray-100 text-gray-500",
};

interface ThisWeekSectionProps {
  orders: ApiOrder[];
}

export default function ThisWeekSection({ orders }: ThisWeekSectionProps) {
  if (orders.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">This Week</h2>
        <span className="text-xs font-bold bg-gray-100 px-3 py-1 rounded-full text-gray-600">
          {orders.length} Order{orders.length === 1 ? "" : "s"}
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {orders.map((order) => (
          <div key={order._id} className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Package className="w-4 h-4 text-[#B34B20]" /> #{order.orderNumber}
              </h3>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${STATUS_CLASSNAMES[order.status]}`}>
                {order.status}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-3">{order.item}</p>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {order.createdAt &&
                  new Date(order.createdAt).toLocaleString(undefined, { weekday: "long", hour: "numeric", minute: "2-digit" })}
              </span>
              {typeof order.price === "number" && (
                <span className="font-semibold text-gray-900">{order.price > 0 ? `NPR ${order.price.toFixed(2)}` : "Free"}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
