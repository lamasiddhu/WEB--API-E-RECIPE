"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Loader2 } from "lucide-react";
import RecipeLibraryTable, { Recipe } from "../../_components/admin/RecipeLibraryTable";
import AddRecipeModal, { NewRecipeInput } from "../../_components/admin/AddRecipeModal";
import { getAllRecipesForAdmin, getRecipeById, createRecipe, updateRecipe, deleteRecipe, ApiRecipe } from "@/lib/composition/api";

const toRecipe = (apiRecipe: ApiRecipe): Recipe => ({
  id: apiRecipe._id,
  title: apiRecipe.title,
  category: apiRecipe.category || "Uncategorized",
  time: apiRecipe.duration || "30 min",
  difficulty: apiRecipe.difficulty || "Intermediate",
  imageUrl: apiRecipe.imageUrl,
  price: apiRecipe.price || 0,
  badge: apiRecipe.badge,
  approvalStatus: apiRecipe.approvalStatus,
});

export default function AdminRecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [query, setQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<ApiRecipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getAllRecipesForAdmin()
      .then((result) => setRecipes((result.data || []).map(toRecipe)))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Failed to load recipes"))
      .finally(() => setIsLoading(false));
  }, []);

  const filteredRecipes = recipes.filter((recipe) =>
    recipe.title.toLowerCase().includes(query.toLowerCase())
  );

  const handleAdd = async (input: NewRecipeInput) => {
    try {
      const result = await createRecipe({
        title: input.title,
        category: input.category,
        duration: input.time,
        difficulty: input.difficulty,
        imageUrl: input.imageUrl,
        price: input.price,
        tags: input.tags,
        badge: input.badge,
        mealType: input.mealType,
        chef: input.chef,
        description: input.description,
        servings: input.servings,
        calories: input.calories,
        protein: input.protein,
        ingredients: input.ingredients,
        steps: input.steps,
        videoUrl: input.videoUrl,
      });
      setRecipes((prev) => [toRecipe(result.data), ...prev]);
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
      const result = await updateRecipe(editingRecipe._id, {
        title: input.title,
        category: input.category,
        duration: input.time,
        difficulty: input.difficulty,
        imageUrl: input.imageUrl,
        price: input.price,
        tags: input.tags,
        badge: input.badge,
        mealType: input.mealType,
        chef: input.chef,
        description: input.description,
        servings: input.servings,
        calories: input.calories,
        protein: input.protein,
        ingredients: input.ingredients,
        steps: input.steps,
        videoUrl: input.videoUrl,
      });
      setRecipes((prev) => prev.map((recipe) => (recipe.id === editingRecipe._id ? toRecipe(result.data) : recipe)));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update recipe");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteRecipe(id);
      setRecipes((prev) => prev.filter((recipe) => recipe.id !== id));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete recipe");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Recipe Library</h1>
          <p className="text-gray-500 mt-1">Add new recipes to the platform or remove ones that no longer belong.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#B34B20] text-white rounded-xl text-sm font-semibold hover:bg-[#A64B1C]"
        >
          <Plus className="w-4 h-4" /> Add Recipe
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search recipes..."
          className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#B34B20]/20"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : (
        <RecipeLibraryTable recipes={filteredRecipes} onEdit={handleEditClick} onDelete={handleDelete} />
      )}

      {isModalOpen && (
        <AddRecipeModal onClose={() => setIsModalOpen(false)} onAdd={handleAdd} />
      )}

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
