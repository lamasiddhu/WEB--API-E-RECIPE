"use client";

import { X, User, Package, DollarSign, Calendar, Ban, Monitor, BookOpen, PackageCheck, Loader2 } from "lucide-react";
import { Order } from "./OrderCard";

interface OrderDetailModalProps {
  order: Order;
  onClose: () => void;
  onCancelClick: (order: Order) => void;
  onAccept: (id: string) => void;
  isAccepting: boolean;
}

const STATUS_CLASSNAMES: Record<Order["status"], string> = {
  Completed: "bg-green-100 text-green-700",
  Processing: "bg-orange-100 text-orange-700",
  Delayed: "bg-red-100 text-red-700",
  Cancelled: "bg-gray-100 text-gray-500",
};

export default function OrderDetailModal({ order, onClose, onCancelClick, onAccept, isAccepting }: OrderDetailModalProps) {
  const canCancel = order.status === "Processing" || order.status === "Delayed";
  const canAccept = order.format === "physical" && canCancel;
  const items = order.item.split(",").map((entry) => entry.trim()).filter(Boolean);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">#{order.orderNumber}</h3>
            <span className={`inline-block mt-1 text-xs font-bold px-3 py-1 rounded-full uppercase ${STATUS_CLASSNAMES[order.status]}`}>
              {order.status}
            </span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <User className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Customer</p>
              <p className="text-sm text-gray-900">{order.customer}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            {order.format === "physical" ? (
              <BookOpen className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
            ) : (
              <Monitor className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
            )}
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Format</p>
              <p className="text-sm text-gray-900">{order.format === "physical" ? "Physical Book" : "Digital"}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Package className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Items</p>
              <ul className="text-sm text-gray-900 space-y-1">
                {items.length > 0 ? items.map((entry, i) => <li key={i}>• {entry}</li>) : <li>{order.item}</li>}
              </ul>
            </div>
          </div>

          {typeof order.price === "number" && (
            <div className="flex items-start gap-3">
              <DollarSign className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Total</p>
                <p className="text-sm text-gray-900">{order.price > 0 ? `NPR ${order.price.toFixed(2)}` : "Free"}</p>
              </div>
            </div>
          )}

          {order.createdAt && (
            <div className="flex items-start gap-3">
              <Calendar className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Placed</p>
                <p className="text-sm text-gray-900">
                  {new Date(order.createdAt).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </div>
            </div>
          )}

          {order.status === "Cancelled" && order.cancelReason && (
            <div className="flex items-start gap-3">
              <Ban className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Cancellation Reason</p>
                <p className="text-sm text-gray-900">{order.cancelReason}</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50"
          >
            Close
          </button>
          {canAccept && (
            <button
              onClick={() => {
                onAccept(order.id);
                onClose();
              }}
              disabled={isAccepting}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 disabled:opacity-60"
            >
              {isAccepting ? <Loader2 className="w-4 h-4 animate-spin" /> : <PackageCheck className="w-4 h-4" />} Accept
            </button>
          )}
          {canCancel && (
            <button
              onClick={() => {
                onCancelClick(order);
                onClose();
              }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-50 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-100"
            >
              <Ban className="w-4 h-4" /> Cancel Order
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
