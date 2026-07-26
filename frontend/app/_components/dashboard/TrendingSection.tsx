"use client";
import Link from "next/link";
import { Clock, Loader2 } from "lucide-react";
import { ApiRecipe } from "../../../lib/api/recipe";
import { resolveAssetUrl } from "../../../lib/api/axios-instance";

interface TrendingSectionProps {
  recipes: ApiRecipe[];
  isLoading: boolean;
}

export default function TrendingSection({ recipes, isLoading }: TrendingSectionProps) {
  const [featured, ...rest] = recipes;
  const sideList = rest.slice(0, 2);

  if (isLoading) {
    return (
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Trending Now</h2>
        <div className="flex items-center justify-center py-12 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      </section>
    );
  }

  if (!featured) {
    return (
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Trending Now</h2>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-10 text-center text-gray-400">
          Nothing trending yet. Add some recipes to get started.
        </div>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Trending Now</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Link
          href={`/recipes/${featured._id}`}
          className="lg:col-span-2 relative h-80 rounded-3xl overflow-hidden group cursor-pointer bg-gray-300 dark:bg-gray-800 bg-cover bg-center"
          style={featured.imageUrl ? { backgroundImage: `url(${resolveAssetUrl(featured.imageUrl)})` } : undefined}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-8 text-white">
            <span className="inline-block bg-[#B34B20] text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
              {featured.badge || "Trending"}
            </span>
            <h3 className="text-3xl font-bold mb-2">{featured.title}</h3>
            <div className="flex items-center gap-4 text-sm text-gray-300">
              <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {featured.duration || "30 min"}</span>
              {featured.category && <span>• {featured.category}</span>}
            </div>
          </div>
        </Link>
        <div className="space-y-4">
          {sideList.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 text-center text-gray-400 text-sm">
              More recipes will show up here.
            </div>
          ) : (
            sideList.map((item) => (
              <Link
                key={item._id}
                href={`/recipes/${item._id}`}
                className="flex gap-4 p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div
                  className="w-20 h-20 rounded-xl bg-gray-200 dark:bg-gray-800 bg-cover bg-center shrink-0"
                  style={item.imageUrl ? { backgroundImage: `url(${resolveAssetUrl(item.imageUrl)})` } : undefined}
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-900 dark:text-white mb-1 line-clamp-1">{item.title}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 line-clamp-2">{item.description || item.category || "Recipe"}</p>
                  <span className="text-xs font-semibold text-[#B34B20] flex items-center gap-1"><Clock className="w-3 h-3" /> {item.duration || "30 min"}</span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
