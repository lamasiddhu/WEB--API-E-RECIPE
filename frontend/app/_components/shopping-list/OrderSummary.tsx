"use client";

import Link from "next/link";
import { ArrowRight, Loader2, CheckCircle2, Monitor, BookOpen } from "lucide-react";

export type OrderFormat = "digital" | "physical";

interface OrderSummaryProps {
  itemCount: number;
  totalQuantity: number;
  totalPrice: number;
  isCheckingOut: boolean;
  checkoutError: string;
  placedOrderNumber: string | null;
  format: OrderFormat;
  onFormatChange: (format: OrderFormat) => void;
  onCheckout: () => void;
}

export default function OrderSummary({
  itemCount,
  totalQuantity,
  totalPrice,
  isCheckingOut,
  checkoutError,
  placedOrderNumber,
  format,
  onFormatChange,
  onCheckout,
}: OrderSummaryProps) {
  if (placedOrderNumber) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
        <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-3" />
        <h3 className="font-bold text-gray-900 mb-1">Order Placed!</h3>
        <p className="text-sm text-gray-500 mb-4">
          Order <span className="font-semibold text-gray-700">#{placedOrderNumber}</span> has been created
          {totalPrice > 0 ? ` for NPR ${totalPrice.toFixed(2)}.` : "."}{" "}
          {format === "digital"
            ? "Your recipes are unlocked and ready to view."
            : "We'll notify you once your book order is accepted."}
        </p>
        <Link
          href="/search"
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#B34B20] to-[#A64B1C] text-white font-semibold py-3 rounded-xl hover:from-[#A64B1C] hover:to-[#963D19] transition-all shadow-lg shadow-orange-900/20"
        >
          Browse More Recipes <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <h3 className="font-bold text-gray-900 mb-4">Basket Summary</h3>
      <div className="space-y-2 text-sm mb-4">
        <div className="flex justify-between text-gray-600">
          <span>Recipes in basket</span>
          <span className="font-semibold text-gray-900">{itemCount}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Total planned batches</span>
          <span className="font-semibold text-gray-900">{totalQuantity}</span>
        </div>
        <div className="flex justify-between pt-2 border-t border-gray-100 text-base">
          <span className="font-bold text-gray-900">Total</span>
          <span className="font-bold text-gray-900">{totalPrice > 0 ? `NPR ${totalPrice.toFixed(2)}` : "Free"}</span>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Delivery Format</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onFormatChange("digital")}
            className={`flex flex-col items-center gap-1 py-3 rounded-xl border text-sm font-semibold transition-colors ${
              format === "digital" ? "border-[#B34B20] bg-orange-50 text-[#B34B20]" : "border-gray-200 text-gray-500 hover:bg-gray-50"
            }`}
          >
            <Monitor className="w-4 h-4" /> Digital
          </button>
          <button
            type="button"
            onClick={() => onFormatChange("physical")}
            className={`flex flex-col items-center gap-1 py-3 rounded-xl border text-sm font-semibold transition-colors ${
              format === "physical" ? "border-[#B34B20] bg-orange-50 text-[#B34B20]" : "border-gray-200 text-gray-500 hover:bg-gray-50"
            }`}
          >
            <BookOpen className="w-4 h-4" /> Physical Book
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          {format === "digital"
            ? "Instant access. View your recipes right after checkout."
            : "We'll ship a printed book. An admin needs to accept the order first."}
        </p>
      </div>

      {checkoutError && <p className="text-sm text-red-600 mb-3">{checkoutError}</p>}

      <button
        onClick={onCheckout}
        disabled={isCheckingOut || itemCount === 0}
        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#B34B20] to-[#A64B1C] text-white font-semibold py-3 rounded-xl hover:from-[#A64B1C] hover:to-[#963D19] transition-all shadow-lg shadow-orange-900/20 disabled:opacity-60"
      >
        {isCheckingOut ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Placing Order...
          </>
        ) : (
          <>Proceed to Checkout <ArrowRight className="w-4 h-4" /></>
        )}
      </button>

      <Link href="/search" className="block text-center text-sm text-gray-500 hover:text-[#B34B20] mt-3">
        Browse More Recipes
      </Link>
    </div>
  );
}
