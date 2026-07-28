"use client";

import { useState } from "react";
import { X, Trash2, Loader2, BookOpen } from "lucide-react";
import { AdminUser } from "../../../lib/api/admin/user";

interface PurchasedRecipeInfo {
  id: string;
  title: string;
}

interface UserPurchasesModalProps {
  user: AdminUser;
  recipes: PurchasedRecipeInfo[];
  onClose: () => void;
  onRemove: (recipeId: string) => Promise<void>;
}

export default function UserPurchasesModal({ user, recipes, onClose, onRemove }: UserPurchasesModalProps) {
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleRemove = async (recipeId: string) => {
    if (!confirm("Remove this recipe from the user's library? They'll need to buy it again to unlock it.")) return;
    setRemovingId(recipeId);
    setError("");
    try {
      await onRemove(recipeId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove recipe");
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Purchased Recipes</h3>
            <p className="text-xs text-gray-500">{user.fullName}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

        {recipes.length === 0 ? (
          <div className="py-10 text-center text-gray-400">
            <BookOpen className="w-8 h-8 mx-auto mb-2" />
            This user hasn&apos;t purchased any recipes.
          </div>
        ) : (
          <ul className="space-y-2">
            {recipes.map((recipe) => (
              <li
                key={recipe.id}
                className="flex items-center justify-between gap-3 bg-gray-50 rounded-xl px-4 py-3"
              >
                <span className="text-sm font-semibold text-gray-800 truncate">{recipe.title}</span>
                <button
                  onClick={() => handleRemove(recipe.id)}
                  disabled={removingId === recipe.id}
                  className="text-gray-400 hover:text-red-600 disabled:opacity-60 shrink-0"
                  title="Remove from library"
                >
                  {removingId === recipe.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}

        <button
          onClick={onClose}
          className="w-full mt-6 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50"
        >
          Close
        </button>
      </div>
    </div>
  );
}
