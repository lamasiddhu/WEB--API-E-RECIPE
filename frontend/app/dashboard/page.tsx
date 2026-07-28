"use client";

import { useEffect, useState } from "react";
import Sidebar from "../_components/dashboard/Sidebar";
import TopBar from "../_components/dashboard/TopBar";
import ChefSpecials from "../_components/dashboard/ChefSpecials";
import PromoBanner from "../_components/dashboard/PromoBanner";
import TrendingSection from "../_components/dashboard/TrendingSection";
import { getAllRecipes, ApiRecipe } from "@/lib/composition/api";

export default function DashboardPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [recipes, setRecipes] = useState<ApiRecipe[]>([]);
  const [isLoadingRecipes, setIsLoadingRecipes] = useState(true);

  useEffect(() => {
    getAllRecipes()
      .then((result) => setRecipes(result.data || []))
      .catch(() => setRecipes([]))
      .finally(() => setIsLoadingRecipes(false));
  }, []);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-auto ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar />
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

        <main className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto space-y-8">
            <ChefSpecials recipes={recipes} isLoading={isLoadingRecipes} />
            <PromoBanner recipes={recipes} />
            <TrendingSection recipes={recipes} isLoading={isLoadingRecipes} />

            {/* Bottom spacing */}
            <div className="h-20"></div>
          </div>
        </main>
      </div>
    </div>
  );
}
