"use client";

import { CheckCircle2, AlertTriangle, Clock, Ban, Trash2, Monitor, BookOpen, PackageCheck, Loader2 } from "lucide-react";

export interface Order {
  id: string;
  orderNumber: string;
  customer: string;
  item: string;
  price?: number;
  status: "Completed" | "Processing" | "Delayed" | "Cancelled";
  createdAt?: string;
  cancelReason?: string;
  format?: "digital" | "physical";
}

const STATUS_CONFIG = {
  Completed: { icon: CheckCircle2, className: "bg-green-100 text-green-700", border: "border-green-500" },
  Processing: { icon: Clock, className: "bg-orange-100 text-orange-700", border: "border-[#B34B20]" },
  Delayed: { icon: AlertTriangle, className: "bg-red-100 text-red-700", border: "border-red-500" },
  Cancelled: { icon: Ban, className: "bg-gray-100 text-gray-500", border: "border-gray-300" },
};

interface OrderCardProps {
  order: Order;
  onViewDetails: (order: Order) => void;
  onCancelClick: (order: Order) => void;
  onAccept: (id: string) => void;
  isAccepting: boolean;
  onDelete: (id: string) => void;
}

export default function OrderCard({ order, onViewDetails, onCancelClick, onAccept, isAccepting, onDelete }: OrderCardProps) {
  const config = STATUS_CONFIG[order.status];
  const Icon = config.icon;
  const canCancel = order.status === "Processing" || order.status === "Delayed";
  const canAccept = order.format === "physical" && canCancel;

  return (
    <div className={`bg-white rounded-xl border border-gray-100 border-l-4 ${config.border} p-4 flex flex-wrap items-center justify-between gap-3`}>
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${config.className}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <p className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
            #{order.orderNumber}
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-gray-400">
              {order.format === "physical" ? (
                <>
                  <BookOpen className="w-3 h-3" /> Physical
                </>
              ) : (
                <>
                  <Monitor className="w-3 h-3" /> Digital
                </>
              )}
            </span>
          </p>
          <p className="text-xs text-gray-500">
            {order.customer} • {order.item}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {typeof order.price === "number" && order.price > 0 && (
          <span className="text-sm font-bold text-gray-700">NPR {order.price.toFixed(2)}</span>
        )}
        <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase ${config.className}`}>
          {order.status}
        </span>
        <button onClick={() => onViewDetails(order)} className="text-sm font-semibold text-[#B34B20] hover:underline">
          View Details →
        </button>
        {canAccept && (
          <button
            onClick={() => onAccept(order.id)}
            disabled={isAccepting}
            className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 disabled:opacity-60"
          >
            {isAccepting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <PackageCheck className="w-3.5 h-3.5" />} Accept
          </button>
        )}
        {canCancel && (
          <button
            onClick={() => onCancelClick(order)}
            className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50"
          >
            <Ban className="w-3.5 h-3.5" /> Cancel
          </button>
        )}
        <button
          onClick={() => {
            if (confirm(`Permanently delete order #${order.orderNumber}? This cannot be undone.`)) onDelete(order.id);
          }}
          className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
