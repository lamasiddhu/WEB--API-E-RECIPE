"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, Clock, Star, Loader2 } from "lucide-react";
import Sidebar from "../_components/dashboard/Sidebar";
import TopBar from "../_components/dashboard/TopBar";
import { getAllRecipes, ApiRecipe } from "../../lib/api/recipe";
import { removeFavorite } from "../../lib/api/auth";
import { useAuth } from "../../lib/contexts/AuthContext";
import { resolveAssetUrl } from "../../lib/api/axios-instance";

export default function FavoritesPage() {
  const { user, updateUser } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [recipes, setRecipes] = useState<ApiRecipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getAllRecipes()
      .then((result) => setRecipes(result.data || []))
      .catch(() => setRecipes([]))
      .finally(() => setIsLoading(false));
  }, []);

  const favoriteIds = new Set(user?.favoriteRecipeIds || []);
  const favoriteRecipes = recipes.filter((recipe) => favoriteIds.has(recipe._id));

  const handleUnfavorite = async (recipeId: string) => {
    try {
      await removeFavorite(recipeId);
      updateUser({ favoriteRecipeIds: (user?.favoriteRecipeIds || []).filter((id) => id !== recipeId) });
    } catch {
      // Silently ignored — the heart stays filled so the user can retry.
    }
  };

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
              <h1 className="text-3xl font-bold text-gray-900 mb-1">Your Favorites</h1>
              <p className="text-gray-500">Recipes you&apos;ve saved with the heart button.</p>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-16 text-gray-400">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : favoriteRecipes.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
                No favorites yet. Tap the heart on any recipe to save it here.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoriteRecipes.map((recipe) => (
                  <Link
                    key={recipe._id}
                    href={`/recipes/${recipe._id}`}
                    className="group relative rounded-2xl overflow-hidden bg-gray-200 h-56 flex flex-col justify-end p-5 text-white"
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
                      {recipe.badge || "Normal"}
                    </span>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleUnfavorite(recipe._id);
                      }}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 z-10 text-red-500"
                    >
                      <Heart className="w-4 h-4 fill-red-500" />
                    </button>
                    <div className="relative z-10">
                      <h4 className="font-bold text-lg mb-1 line-clamp-1">{recipe.title}</h4>
                      <div className="flex items-center gap-3 text-xs text-gray-200">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {recipe.duration || "30 min"}
                        </span>
                        {typeof recipe.rating === "number" && recipe.rating > 0 && (
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /> {recipe.rating}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
