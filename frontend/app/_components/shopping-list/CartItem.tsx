"use client";

import Link from "next/link";
import { Trash2, Minus, Plus, Loader2 } from "lucide-react";
import { resolveAssetUrl } from "@/lib/composition/api";

export interface CartItemData {
  id: string;
  recipeId: string;
  title: string;
  imageUrl?: string;
  price: number;
  quantity: number;
}

interface CartItemProps {
  item: CartItemData;
  isUpdating: boolean;
  onQuantityChange: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

export default function CartItem({ item, isUpdating, onQuantityChange, onRemove }: CartItemProps) {
  return (
    <div className="flex items-center gap-4 bg-white rounded-2xl border border-gray-100 p-4">
      <div
        className="w-16 h-16 rounded-xl bg-gray-200 bg-cover bg-center shrink-0"
        style={item.imageUrl ? { backgroundImage: `url(${resolveAssetUrl(item.imageUrl)})` } : undefined}
      />
      <div className="flex-1 min-w-0">
        <Link href={`/recipes/${item.recipeId}`} className="font-semibold text-gray-900 truncate hover:text-[#B34B20] transition-colors">
          {item.title}
        </Link>
        <p className="text-xs text-gray-400">
          {item.price > 0 ? `NPR ${item.price.toFixed(2)} each` : "Free"}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onQuantityChange(item.id, Math.max(1, item.quantity - 1))}
          disabled={isUpdating}
          className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-50"
        >
          <Minus className="w-3 h-3" />
        </button>
        <span className="w-6 text-center font-semibold text-sm">
          {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin mx-auto" /> : item.quantity}
        </span>
        <button
          onClick={() => onQuantityChange(item.id, item.quantity + 1)}
          disabled={isUpdating}
          className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-50"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>
      <span className="w-16 text-right font-semibold text-sm text-gray-900">
        {item.price > 0 ? `NPR ${(item.price * item.quantity).toFixed(2)}` : "Free"}
      </span>
      <button onClick={() => onRemove(item.id)} className="text-gray-300 hover:text-red-500">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
