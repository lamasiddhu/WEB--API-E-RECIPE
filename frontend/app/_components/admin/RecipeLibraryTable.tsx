"use client";

import Link from "next/link";
import { Clock, ChefHat, Trash2, Eye, Pencil } from "lucide-react";
import { resolveAssetUrl } from "@/lib/composition/api";

export interface Recipe {
  id: string;
  title: string;
  category: string;
  time: string;
  difficulty: string;
  imageUrl?: string;
  price?: number;
  badge?: string;
  approvalStatus?: "pending" | "approved" | "rejected";
}

interface RecipeLibraryTableProps {
  recipes: Recipe[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function RecipeLibraryTable({ recipes, onEdit, onDelete }: RecipeLibraryTableProps) {
  if (recipes.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
        No recipes yet. Click &quot;Add Recipe&quot; to create one.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100">
      {recipes.map((recipe) => (
        <div key={recipe.id} className="flex items-center gap-4 p-4">
          {recipe.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={resolveAssetUrl(recipe.imageUrl)}
              alt={recipe.title}
              className="w-14 h-14 rounded-xl object-cover shrink-0"
            />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-gray-200 shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="text-xs font-bold text-[#B34B20] uppercase tracking-wide">{recipe.category}</p>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                  recipe.badge?.toLowerCase() === "pro"
                    ? "bg-amber-100 text-amber-700"
                    : recipe.badge?.toLowerCase() === "free"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {recipe.badge || "Free"}
              </span>
              {recipe.approvalStatus && recipe.approvalStatus !== "approved" && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                  recipe.approvalStatus === "pending"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                }`}>
                  {recipe.approvalStatus}
                </span>
              )}
            </div>
            <h3 className="font-semibold text-gray-900 truncate">{recipe.title}</h3>
            <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> {recipe.time}
              </span>
              <span className="flex items-center gap-1">
                <ChefHat className="w-3 h-3" /> {recipe.difficulty}
              </span>
              <span className="font-semibold text-gray-700">
                {recipe.price ? `NPR ${recipe.price.toFixed(2)}` : "Free"}
              </span>
            </div>
          </div>
          <Link
            href={`/recipes/${recipe.id}`}
            className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-[#B34B20] hover:bg-orange-50 transition-colors shrink-0"
            title="View recipe"
          >
            <Eye className="w-4 h-4" />
          </Link>
          <button
            onClick={() => onEdit(recipe.id)}
            className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-[#B34B20] hover:bg-orange-50 transition-colors shrink-0"
            title="Edit recipe"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (confirm(`Delete "${recipe.title}"? This cannot be undone.`)) {
                onDelete(recipe.id);
              }
            }}
            className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
