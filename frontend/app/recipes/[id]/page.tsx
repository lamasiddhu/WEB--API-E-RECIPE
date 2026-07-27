"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Heart, Share2, ShoppingCart, ArrowLeft, Loader2, Lock, Crown } from "lucide-react";
import Sidebar from "../../_components/dashboard/Sidebar";
import TopBar from "../../_components/dashboard/TopBar";
import RecipeHero from "../../_components/recipes/RecipeHero";
import NutritionStats from "../../_components/recipes/NutritionStats";
import IngredientsList from "../../_components/recipes/IngredientsList";
import CookingSteps from "../../_components/recipes/CookingSteps";
import { getRecipeById, ApiRecipe } from "../../../lib/api/recipe";
import { useAuth } from "../../../lib/contexts/AuthContext";
import { requestProAccess } from "../../../lib/api/notification";
import { addFavorite, removeFavorite } from "../../../lib/api/auth";
import { addToShoppingList } from "../../../lib/api/shoppingList";
import { canAccessRecipe, getRecipeTier } from "../../../lib/recipeAccess";

function getYoutubeEmbedUrl(url?: string): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    let videoId = "";
    if (parsed.hostname.includes("youtu.be")) {
      videoId = parsed.pathname.slice(1);
    } else if (parsed.hostname.includes("youtube.com")) {
      videoId = parsed.searchParams.get("v") || "";
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  } catch {
    return null;
  }
}

export default function RecipeDetailPage() {
  const params = useParams<{ id: string }>();
  const { user, updateUser } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [recipe, setRecipe] = useState<ApiRecipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isRequestingPro, setIsRequestingPro] = useState(false);
  const [proRequestError, setProRequestError] = useState("");
  const [isAddingToBasket, setIsAddingToBasket] = useState(false);
  const [addedToBasket, setAddedToBasket] = useState(false);
  const [basketError, setBasketError] = useState("");
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

  useEffect(() => {
    if (!params.id) return;
    getRecipeById(params.id)
      .then((result) => setRecipe(result.data))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Failed to load recipe"))
      .finally(() => setIsLoading(false));
  }, [params.id]);

  const tier = recipe ? getRecipeTier(recipe) : "free";
  const isProTier = tier === "pro";
  const isLocked = !!recipe && !canAccessRecipe(recipe, user);
  const canBuyProTier = user?.role === "admin" || !!user?.isPro;
  const isFavorited = !!recipe && !!user?.favoriteRecipeIds?.includes(recipe._id);

  const handleAddToBasket = async () => {
    if (!recipe) return;
    setIsAddingToBasket(true);
    setBasketError("");
    try {
      await addToShoppingList({ recipeId: recipe._id, title: recipe.title, imageUrl: recipe.imageUrl, price: recipe.price });
      setAddedToBasket(true);
      setTimeout(() => setAddedToBasket(false), 2000);
    } catch (err) {
      setBasketError(err instanceof Error ? err.message : "Failed to add to basket");
    } finally {
      setIsAddingToBasket(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!recipe) return;
    setIsTogglingFavorite(true);
    try {
      if (isFavorited) {
        await removeFavorite(recipe._id);
        updateUser({ favoriteRecipeIds: (user?.favoriteRecipeIds || []).filter((id) => id !== recipe._id) });
      } else {
        await addFavorite(recipe._id);
        updateUser({ favoriteRecipeIds: [...(user?.favoriteRecipeIds || []), recipe._id] });
      }
    } catch {
      // Silently ignored — the heart stays in its previous state so the user can retry.
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  const handleRequestPro = async () => {
    setIsRequestingPro(true);
    setProRequestError("");
    try {
      await requestProAccess();
      updateUser({ proRequestPending: true });
    } catch (err) {
      setProRequestError(err instanceof Error ? err.message : "Failed to request Pro access");
    } finally {
      setIsRequestingPro(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
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
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <Link
                href="/search"
                className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:text-[#B34B20] transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-2">
                {!!recipe?.price && !isProTier && (
                  <span className="font-bold text-gray-900 text-lg mr-1">NPR {recipe.price.toFixed(2)}</span>
                )}
                <button
                  onClick={handleToggleFavorite}
                  disabled={isTogglingFavorite || !recipe}
                  className={`w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center transition-colors disabled:opacity-70 ${
                    isFavorited ? "text-red-500" : "text-gray-600 hover:text-red-500"
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isFavorited ? "fill-red-500" : ""}`} />
                </button>
                <button className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:text-[#B34B20] transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
                {(!isProTier || canBuyProTier) && (
                  <button
                    onClick={handleAddToBasket}
                    disabled={isAddingToBasket || !recipe}
                    className="flex items-center gap-2 px-4 py-2 bg-[#B34B20] text-white rounded-xl font-semibold hover:bg-[#A64B1C] transition-colors disabled:opacity-70"
                  >
                    {isAddingToBasket ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ShoppingCart className="w-4 h-4" />
                    )}
                    {addedToBasket ? "Added ✓" : "Add to Basket"}
                  </button>
                )}
              </div>
            </div>
            {basketError && <p className="text-sm text-red-600 text-right -mt-4 mb-4">{basketError}</p>}

            {isLoading ? (
              <div className="flex items-center justify-center py-24 text-gray-400">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : error || !recipe ? (
              <div className="text-center py-24">
                <p className="text-lg font-semibold text-gray-700 mb-2">Recipe not found</p>
                <p className="text-gray-500 mb-6">{error || "This recipe may have been removed."}</p>
                <Link href="/search" className="text-[#B34B20] font-semibold hover:underline">
                  ← Back to Search
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <RecipeHero
                    title={recipe.title}
                    description={recipe.description || "No description added yet."}
                    badge={recipe.badge || ""}
                    mealType={recipe.mealType}
                    duration={recipe.duration || "30 min"}
                    chef={recipe.chef || "E-Recipe Kitchen"}
                    imageUrl={recipe.imageUrl}
                  />
                  {!isLocked && getYoutubeEmbedUrl(recipe.videoUrl) && (
                    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                      <div className="aspect-video">
                        <iframe
                          src={getYoutubeEmbedUrl(recipe.videoUrl) || undefined}
                          title="Recipe video walkthrough"
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    </div>
                  )}
                  {isLocked ? (
                    <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                      <div className="w-14 h-14 rounded-full bg-orange-50 text-[#B34B20] flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-6 h-6" />
                      </div>
                      {isProTier ? (
                        <>
                          <h2 className="text-lg font-bold text-gray-900 mb-2">This is a Pro-only recipe</h2>
                          {user?.proRequestPending ? (
                            <p className="text-gray-500 text-sm max-w-xs mx-auto">
                              Your Pro access request is pending admin review. Once approved, this recipe unlocks automatically.
                            </p>
                          ) : (
                            <>
                              <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto">
                                This recipe can&apos;t be bought individually. You need Pro Access to view it.
                              </p>
                              <button
                                onClick={handleRequestPro}
                                disabled={isRequestingPro}
                                className="inline-flex items-center gap-2 bg-[#B34B20] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#A64B1C] transition-colors disabled:opacity-70"
                              >
                                {isRequestingPro ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin" /> Sending Request...
                                  </>
                                ) : (
                                  <>
                                    <Crown className="w-4 h-4" /> Request Pro Access
                                  </>
                                )}
                              </button>
                              {proRequestError && <p className="text-sm text-red-600 mt-3">{proRequestError}</p>}
                            </>
                          )}
                        </>
                      ) : (
                        <>
                          <h2 className="text-lg font-bold text-gray-900 mb-2">Buy this recipe to get access</h2>
                          <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto">
                            Buy this recipe to get access to the ingredients and step-by-step instructions.
                          </p>
                          <button
                            onClick={handleAddToBasket}
                            disabled={isAddingToBasket}
                            className="inline-flex items-center gap-2 bg-[#B34B20] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#A64B1C] transition-colors disabled:opacity-70"
                          >
                            {isAddingToBasket ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" /> Adding...
                              </>
                            ) : (
                              <>
                                <ShoppingCart className="w-4 h-4" /> {addedToBasket ? "Added ✓" : "Add to Basket"}
                              </>
                            )}
                          </button>
                        </>
                      )}
                    </div>
                  ) : (
                    <CookingSteps steps={recipe.steps && recipe.steps.length > 0 ? recipe.steps : []} />
                  )}
                </div>

                <div className="space-y-6">
                  <NutritionStats
                    servings={recipe.servings || 0}
                    calories={recipe.calories || 0}
                    protein={recipe.protein || 0}
                    difficulty={recipe.difficulty || "Intermediate"}
                  />
                  {isLocked ? (
                    <div className="bg-white rounded-2xl border border-gray-100 p-6">
                      <h2 className="text-xl font-bold text-gray-900 mb-4">Ingredients</h2>
                      <div className="relative">
                        <div className="space-y-2 blur-sm select-none pointer-events-none" aria-hidden>
                          {(recipe.ingredients && recipe.ingredients.length > 0
                            ? recipe.ingredients
                            : ["Ingredient", "Ingredient", "Ingredient"]
                          ).map((ingredient, i) => (
                            <p key={i} className="text-sm text-gray-700">• {ingredient}</p>
                          ))}
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center text-center px-4">
                          <p className="text-sm font-semibold text-gray-700 bg-white/90 rounded-lg px-3 py-1.5">
                            {isProTier
                              ? "Pro Access required to view ingredients"
                              : "Buy this recipe to get access to the ingredients"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <IngredientsList ingredients={recipe.ingredients && recipe.ingredients.length > 0 ? recipe.ingredients : []} />
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
