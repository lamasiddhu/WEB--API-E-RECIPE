"use client";

import { useEffect, useState } from "react";
import { Heart, BookMarked, Package } from "lucide-react";
import { useAuth } from "../../../lib/contexts/AuthContext";
import { getMyOrders } from "../../../lib/api/order";

export default function StatsCards() {
  const { user } = useAuth();
  const [orderCount, setOrderCount] = useState<number | null>(null);

  useEffect(() => {
    getMyOrders()
      .then((result) => setOrderCount((result.data || []).length))
      .catch(() => setOrderCount(0));
  }, []);

  const favoriteCount = user?.favoriteRecipeIds?.length ?? 0;
  const purchasedCount = user?.purchasedRecipeIds?.length ?? 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col justify-between h-32">
        <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-500 mb-4">
          <Heart className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Favorites</p>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{favoriteCount}</h3>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col justify-between h-32">
        <div className="w-10 h-10 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-[#B34B20] mb-4">
          <BookMarked className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Recipes Purchased</p>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{purchasedCount}</h3>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col justify-between h-32">
        <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600 mb-4">
          <Package className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Orders Placed</p>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{orderCount === null ? "…" : orderCount}</h3>
        </div>
      </div>
    </div>
  );
}
