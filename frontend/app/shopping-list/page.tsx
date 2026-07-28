"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import Sidebar from "../_components/dashboard/Sidebar";
import TopBar from "../_components/dashboard/TopBar";
import CartItem, { CartItemData } from "../_components/shopping-list/CartItem";
import OrderSummary, { OrderFormat } from "../_components/shopping-list/OrderSummary";
import {
  getMyShoppingList,
  updateShoppingListQuantity,
  removeFromShoppingList,
  checkoutShoppingList,
  ApiShoppingListItem,
} from "@/lib/composition/api";
import { useAuth } from "../../lib/contexts/AuthContext";

const toCartItem = (item: ApiShoppingListItem): CartItemData => ({
  id: item._id,
  recipeId: item.recipeId,
  title: item.title,
  imageUrl: item.imageUrl,
  price: item.price || 0,
  quantity: item.quantity,
});

export default function ShoppingListPage() {
  const { user, updateUser } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [items, setItems] = useState<CartItemData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [format, setFormat] = useState<OrderFormat>("digital");
  const [checkoutError, setCheckoutError] = useState("");
  const [placedOrderNumber, setPlacedOrderNumber] = useState<string | null>(null);

  useEffect(() => {
    getMyShoppingList()
      .then((listResult) => setItems((listResult.data || []).map(toCartItem)))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Failed to load your basket"))
      .finally(() => setIsLoading(false));
  }, []);

  const updateQuantity = async (id: string, quantity: number) => {
    setUpdatingId(id);
    try {
      await updateShoppingListQuantity(id, quantity);
      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, quantity } : item)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update quantity");
    } finally {
      setUpdatingId(null);
    }
  };

  const removeItem = async (id: string) => {
    try {
      await removeFromShoppingList(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove item");
    }
  };

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    setCheckoutError("");
    try {
      const result = await checkoutShoppingList(format);
      const purchasedIds = items.map((item) => item.recipeId);
      updateUser({ purchasedRecipeIds: [...new Set([...(user?.purchasedRecipeIds || []), ...purchasedIds])] });
      setPlacedOrderNumber(result.data.orderNumber);
      setItems([]);
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : "Failed to place order");
    } finally {
      setIsCheckingOut(false);
    }
  };

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

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
              <h1 className="text-3xl font-bold text-gray-900 mb-1">My Shopping Basket</h1>
              <p className="text-gray-500">Recipes you&apos;ve added, ready to cook.</p>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            {isLoading ? (
              <div className="flex items-center justify-center py-16 text-gray-400">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                  {items.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
                      Your basket is empty. Add a recipe from its detail page to get started.
                    </div>
                  ) : (
                    items.map((item) => (
                      <CartItem
                        key={item.id}
                        item={item}
                        isUpdating={updatingId === item.id}
                        onQuantityChange={updateQuantity}
                        onRemove={removeItem}
                      />
                    ))
                  )}
                </div>

                <div>
                  <OrderSummary
                    itemCount={items.length}
                    totalQuantity={totalQuantity}
                    totalPrice={totalPrice}
                    isCheckingOut={isCheckingOut}
                    checkoutError={checkoutError}
                    placedOrderNumber={placedOrderNumber}
                    format={format}
                    onFormatChange={setFormat}
                    onCheckout={handleCheckout}
                  />
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
