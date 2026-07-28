"use client";

import { ApiOrder } from "@/lib/composition/api";

const STATUS_CLASSNAMES: Record<ApiOrder["status"], string> = {
  Completed: "bg-green-100 text-green-700",
  Processing: "bg-orange-100 text-orange-700",
  Delayed: "bg-red-100 text-red-700",
  Cancelled: "bg-gray-100 text-gray-500",
};

interface EarlierMonthListProps {
  orders: ApiOrder[];
}

export default function EarlierMonthList({ orders }: EarlierMonthListProps) {
  if (orders.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Earlier</h2>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100">
        {orders.map((order) => (
          <div key={order._id} className="flex items-center gap-4 p-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-xs text-gray-400">
                  {order.createdAt && new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" })}
                </p>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_CLASSNAMES[order.status]}`}>
                  {order.status}
                </span>
              </div>
              <h3 className="font-semibold text-gray-900">#{order.orderNumber}</h3>
              <p className="text-sm text-gray-500 truncate">{order.item}</p>
            </div>
            {typeof order.price === "number" && (
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold text-gray-900">{order.price > 0 ? `NPR ${order.price.toFixed(2)}` : "Free"}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
