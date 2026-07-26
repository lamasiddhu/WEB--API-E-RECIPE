"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Clock, Star, Loader2, Plus } from "lucide-react";
import Sidebar from "../_components/dashboard/Sidebar";
import TopBar from "../_components/dashboard/TopBar";
import RecipeLibraryTable, { Recipe } from "../_components/admin/RecipeLibraryTable";
import AddRecipeModal, { NewRecipeInput } from "../_components/admin/AddRecipeModal";
import {
  getAllRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  ApiRecipe,
} from "../../lib/api/recipe";
import { useAuth } from "../../lib/contexts/AuthContext";
import { resolveAssetUrl } from "../../lib/api/axios-instance";

const toRecipe = (apiRecipe: ApiRecipe): Recipe => ({
  id: apiRecipe._id,
  title: apiRecipe.title,
  category: apiRecipe.category || "Uncategorized",
  time: apiRecipe.duration || "30 min",
  difficulty: apiRecipe.difficulty || "Intermediate",
  imageUrl: apiRecipe.imageUrl,
  price: apiRecipe.price || 0,
  badge: apiRecipe.badge,
});

export default function MyRecipesPage() {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [recipes, setRecipes] = useState<ApiRecipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<ApiRecipe | null>(null);

  const canAddRecipes = user?.role === "admin" || !!user?.isPro;

  const loadRecipes = () => {
    getAllRecipes()
      .then((result) => setRecipes(result.data || []))
      .catch(() => setRecipes([]))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadRecipes();
  }, []);

  const purchasedIds = new Set(user?.purchasedRecipeIds || []);
  const purchasedRecipes = recipes.filter((recipe) => purchasedIds.has(recipe._id));
  const createdRecipes = recipes.filter((recipe) => recipe.createdBy === user?._id);

  const handleAdd = async (input: NewRecipeInput) => {
    try {
      await createRecipe({
        title: input.title,
        category: input.category,
        duration: input.time,
        difficulty: input.difficulty,
        imageUrl: input.imageUrl,
        price: input.price,
        tags: input.tags,
        badge: input.badge,
        chef: input.chef,
        description: input.description,
        servings: input.servings,
        calories: input.calories,
        protein: input.protein,
        ingredients: input.ingredients,
        steps: input.steps,
      });
      loadRecipes();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to add recipe");
    }
  };

  const handleEditClick = async (id: string) => {
    try {
      const result = await getRecipeById(id);
      setEditingRecipe(result.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load recipe");
    }
  };

  const handleSaveEdit = async (input: NewRecipeInput) => {
    if (!editingRecipe) return;
    try {
      await updateRecipe(editingRecipe._id, {
        title: input.title,
        category: input.category,
        duration: input.time,
        difficulty: input.difficulty,
        imageUrl: input.imageUrl,
        price: input.price,
        tags: input.tags,
        badge: input.badge,
        chef: input.chef,
        description: input.description,
        servings: input.servings,
        calories: input.calories,
        protein: input.protein,
        ingredients: input.ingredients,
        steps: input.steps,
      });
      loadRecipes();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update recipe");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteRecipe(id);
      setRecipes((prev) => prev.filter((recipe) => recipe._id !== id));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete recipe");
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
          <div className="max-w-6xl mx-auto space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">Your Recipes</h1>
                <p className="text-gray-500">Recipes you&apos;ve purchased, fully unlocked, anytime.</p>
              </div>
              {canAddRecipes && (
                <button
                  onClick={() => setIsAddOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#B34B20] text-white rounded-xl text-sm font-semibold hover:bg-[#A64B1C] shrink-0"
                >
                  <Plus className="w-4 h-4" /> Add Recipe
                </button>
              )}
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            {isLoading ? (
              <div className="flex items-center justify-center py-16 text-gray-400">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : purchasedRecipes.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
                You haven&apos;t purchased any recipes yet. Buy a Normal or Pro recipe from its detail page to see it here.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {purchasedRecipes.map((recipe) => (
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
                    <span className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center z-10 text-green-400">
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
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

            {canAddRecipes && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Recipes You Created</h2>
                <p className="text-gray-500 mb-4">
                  Recipes you&apos;ve added yourself. You can edit or delete these. Recipes added by others aren&apos;t editable here.
                </p>
                {!isLoading && createdRecipes.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
                    You haven&apos;t added any recipes yet.
                  </div>
                ) : (
                  <RecipeLibraryTable
                    recipes={createdRecipes.map(toRecipe)}
                    onEdit={handleEditClick}
                    onDelete={handleDelete}
                  />
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {isAddOpen && <AddRecipeModal onClose={() => setIsAddOpen(false)} onAdd={handleAdd} />}

      {editingRecipe && (
        <AddRecipeModal
          initialData={editingRecipe}
          onClose={() => setEditingRecipe(null)}
          onAdd={handleSaveEdit}
        />
      )}
    </div>
  );
}
