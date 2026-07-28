"use client";
import Link from "next/link";
import { Star, Clock, ChefHat, Loader2 } from "lucide-react";
import { ApiRecipe } from "@/lib/composition/api";
import { resolveAssetUrl } from "@/lib/composition/api";

interface ChefSpecialsProps {
  recipes: ApiRecipe[];
  isLoading: boolean;
}

export default function ChefSpecials({ recipes, isLoading }: ChefSpecialsProps) {
  const specials = recipes.slice(0, 3);

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Chef&apos;s Specials</h2>
        <Link href="/search" className="text-[#B34B20] font-semibold text-sm hover:underline flex items-center gap-1">
          View All <span className="text-lg">›</span>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : specials.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-10 text-center text-gray-400">
          No recipes yet. Add one from{" "}
          <Link href="/admin/recipes" className="text-[#B34B20] font-semibold hover:underline">
            Recipe Library
          </Link>
          .
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {specials.map((item) => (
            <Link
              key={item._id}
              href={`/recipes/${item._id}`}
              className="group bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-800"
            >
              <div
                className="relative h-48 bg-gray-200 dark:bg-gray-800 bg-cover bg-center overflow-hidden"
                style={item.imageUrl ? { backgroundImage: `url(${resolveAssetUrl(item.imageUrl)})` } : undefined}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <span className="bg-white text-gray-900 px-4 py-2 rounded-lg text-sm font-semibold shadow-lg">View Details</span>
                </div>
                {typeof item.rating === "number" && item.rating > 0 && (
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                    <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" /><span className="text-xs font-bold text-gray-900">{item.rating}</span>
                  </div>
                )}
                {item.badge && (
                  <div className="absolute top-3 left-3 bg-[#B34B20] text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg whitespace-nowrap">{item.badge}</div>
                )}
              </div>
              <div className="p-5">
                <p className="text-xs font-bold text-[#B34B20] uppercase tracking-wider mb-1">{item.category || "Recipe"}</p>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 line-clamp-1">{item.title}</h3>
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1"><Clock className="w-4 h-4" /><span>{item.duration || "30 min"}</span></div>
                  <div className="flex items-center gap-1"><ChefHat className="w-4 h-4" /><span>{item.difficulty || "Intermediate"}</span></div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
