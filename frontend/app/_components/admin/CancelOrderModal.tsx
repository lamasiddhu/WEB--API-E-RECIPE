"use client";

import { FormEvent, useState } from "react";
import { X, Ban, Loader2 } from "lucide-react";
import { Order } from "./OrderCard";

interface CancelOrderModalProps {
  order: Order;
  onClose: () => void;
  onConfirm: (id: string, reason: string) => Promise<void>;
}

export default function CancelOrderModal({ order, onClose, onConfirm }: CancelOrderModalProps) {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!reason.trim()) return;
    setIsSubmitting(true);
    setError("");
    try {
      await onConfirm(order.id, reason.trim());
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel order");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Cancel Order #{order.orderNumber}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-gray-500 mb-4">
          {order.customer} will be notified that their order was cancelled, along with the reason you give below.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
              Reason for cancellation
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              rows={3}
              placeholder="e.g., Out of stock ingredients, unable to fulfill in time..."
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#B34B20]/20 focus:border-[#B34B20] resize-none"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !reason.trim()}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Cancelling...
                </>
              ) : (
                <>
                  <Ban className="w-4 h-4" /> Confirm Cancellation
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
