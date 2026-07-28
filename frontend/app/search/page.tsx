"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "../_components/dashboard/Sidebar";
import TopBar from "../_components/dashboard/TopBar";
import SearchBar from "../_components/search/SearchBar";
import FilterChips from "../_components/search/FilterChips";
import RecentSearches from "../_components/search/RecentSearches";
import RecommendedGrid, { DisplayRecipe } from "../_components/search/RecommendedGrid";
import { getAllRecipes, ApiRecipe } from "@/lib/composition/api";
import { useAuth } from "../../lib/contexts/AuthContext";
import { addFavorite, removeFavorite } from "@/lib/composition/api";
import { readStoredValue, writeStoredValue } from "../../lib/composition/localStorage";
import AllFiltersModal, { RecipeFilters } from "../_components/search/AllFiltersModal";

const toDisplayRecipe = (recipe: ApiRecipe): DisplayRecipe => ({
  id: recipe._id,
  title: recipe.title,
  tag: recipe.badge || recipe.category || "Recipe",
  badge: recipe.badge,
  tags: recipe.tags,
  time: recipe.duration || "30 min",
  rating: recipe.rating || 0,
  imageUrl: recipe.imageUrl,
  category: recipe.category,
  mealType: recipe.mealType,
});

const EMPTY_FILTERS: RecipeFilters = { tags: [], mealTypes: [], categories: [], badges: [] };

const MAX_RECENT_SEARCHES = 6;

const recentSearchesKey = (userId?: string) => `recent_searches_${userId || "guest"}`;

const loadRecentSearches = (userId?: string): string[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = readStoredValue(recentSearchesKey(userId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveRecentSearches = (userId: string | undefined, searches: string[]) => {
  if (typeof window === "undefined") return;
  writeStoredValue(recentSearchesKey(userId), JSON.stringify(searches));
};

export default function SearchPage() {
  const { user, updateUser } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [filters, setFilters] = useState<RecipeFilters>(EMPTY_FILTERS);
  const [allFiltersOpen, setAllFiltersOpen] = useState(false);
  const [advancedActive, setAdvancedActive] = useState(false);
  const [recipes, setRecipes] = useState<DisplayRecipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    getAllRecipes()
      .then((result) => setRecipes((result.data || []).map(toDisplayRecipe)))
      .catch(() => setRecipes([]))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    // Reads from localStorage (an external system) once the user id resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRecentSearches(loadRecentSearches(user?._id));
  }, [user?._id]);

  const filteredRecipes = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = recipes.filter((recipe) => {
      const searchable = [recipe.title, recipe.category, recipe.mealType, ...(recipe.tags || [])]
        .filter(Boolean).join(" ").toLowerCase();
      const matchesQuery = !q || searchable.includes(q);
      const matchesTags = !filters.tags.length || filters.tags.some((tag) => recipe.tags?.includes(tag));
      const matchesMealType = !filters.mealTypes.length || (!!recipe.mealType && filters.mealTypes.includes(recipe.mealType));
      const matchesCategory = !filters.categories.length || (!!recipe.category && filters.categories.includes(recipe.category));
      const matchesBadge = !filters.badges.length || (!!recipe.badge && filters.badges.includes(recipe.badge));
      return matchesQuery && matchesTags && matchesMealType && matchesCategory && matchesBadge;
    });
    return [...matches].sort((a, b) => a.title.localeCompare(b.title));
  }, [recipes, query, filters]);

  const categories = useMemo(
    () => [...new Set(recipes.map((recipe) => recipe.category).filter((value): value is string => !!value))].sort(),
    [recipes]
  );

  const commitSearch = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;
    setRecentSearches((prev) => {
      const next = [trimmed, ...prev.filter((s) => s.toLowerCase() !== trimmed.toLowerCase())].slice(
        0,
        MAX_RECENT_SEARCHES
      );
      saveRecentSearches(user?._id, next);
      return next;
    });
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    saveRecentSearches(user?._id, []);
  };

  const removeRecentSearch = (search: string) => {
    setRecentSearches((prev) => {
      const next = prev.filter((s) => s !== search);
      saveRecentSearches(user?._id, next);
      return next;
    });
  };

  const favoriteIds = new Set(user?.favoriteRecipeIds || []);

  const handleToggleFavorite = async (recipeId: string) => {
    const isFavorited = favoriteIds.has(recipeId);
    try {
      if (isFavorited) {
        await removeFavorite(recipeId);
        updateUser({ favoriteRecipeIds: (user?.favoriteRecipeIds || []).filter((id) => id !== recipeId) });
      } else {
        await addFavorite(recipeId);
        updateUser({ favoriteRecipeIds: [...(user?.favoriteRecipeIds || []), recipeId] });
      }
    } catch {
      // Silently ignored — the heart stays in its previous state so the user can retry.
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
              <h1 className="text-3xl font-bold text-gray-900 mb-1">Discover New Flavors</h1>
            </div>

            <SearchBar value={query} onChange={setQuery} onSearch={commitSearch} />
            <FilterChips
              active={activeFilter}
              onSelect={(filter) => {
                setActiveFilter(filter);
                setAdvancedActive(false);
                setFilters({ ...EMPTY_FILTERS, tags: filter ? [filter] : [] });
              }}
              onAllFilters={() => setAllFiltersOpen(true)}
              hasAdvancedFilters={advancedActive}
            />

            <RecentSearches
              searches={recentSearches}
              onClear={clearRecentSearches}
              onRemove={removeRecentSearch}
              onSelect={(search) => {
                setQuery(search);
                commitSearch(search);
              }}
            />

            <RecommendedGrid
              recipes={filteredRecipes}
              isLoading={isLoading}
              onViewMore={() => {
                setQuery("");
                setActiveFilter(null);
                setAdvancedActive(false);
                setFilters(EMPTY_FILTERS);
              }}
              favoriteIds={favoriteIds}
              onToggleFavorite={handleToggleFavorite}
            />
            <AllFiltersModal
              open={allFiltersOpen}
              value={filters}
              categories={categories}
              onClose={() => setAllFiltersOpen(false)}
              onApply={(next) => {
                setFilters(next);
                setActiveFilter(null);
                setAdvancedActive(Object.values(next).some((values) => values.length > 0));
              }}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
