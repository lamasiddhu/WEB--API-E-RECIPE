"use client";

import Link from "next/link";
import { Heart, Star, Clock, Loader2 } from "lucide-react";
import { resolveAssetUrl } from "@/lib/composition/api";

export interface DisplayRecipe {
  id: string;
  title: string;
  tag: string;
  badge?: string;
  tags?: string[];
  category?: string;
  mealType?: string;
  time: string;
  rating: number;
  imageUrl?: string;
}

interface RecommendedGridProps {
  recipes: DisplayRecipe[];
  isLoading: boolean;
  onViewMore: () => void;
  favoriteIds: Set<string>;
  onToggleFavorite: (recipeId: string) => void;
}

export default function RecommendedGrid({ recipes, isLoading, onViewMore, favoriteIds, onToggleFavorite }: RecommendedGridProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">Recommended for You</h3>
        <button onClick={onViewMore} className="text-sm font-semibold text-[#B34B20] hover:underline">
          View more
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : recipes.length === 0 ? (
        <p className="text-gray-400 text-sm py-8 text-center">No recipes match your search.</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {recipes.map((recipe, index) => (
            <Link
              key={recipe.id}
              href={`/recipes/${recipe.id}`}
              className={`group relative rounded-2xl overflow-hidden bg-gray-200 h-64 flex flex-col justify-end p-5 text-white ${
                index === 0 ? "lg:col-span-2" : ""
              }`}
              style={
                recipe.imageUrl
                  ? {
                      backgroundImage: `url(${resolveAssetUrl(recipe.imageUrl)})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }
                  : undefined
              }
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
              <span className="absolute top-3 left-3 bg-[#B34B20] text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase z-10">
                {recipe.tag}
              </span>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onToggleFavorite(recipe.id);
                }}
                className={`absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 z-10 ${
                  favoriteIds.has(recipe.id) ? "text-red-500" : "text-white"
                }`}
              >
                <Heart className={`w-4 h-4 ${favoriteIds.has(recipe.id) ? "fill-red-500" : ""}`} />
              </button>
              <div className="relative z-10">
                <h4 className="font-bold text-lg mb-1 line-clamp-1">{recipe.title}</h4>
                <div className="flex items-center gap-3 text-xs text-gray-200">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {recipe.time}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /> {recipe.rating}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
