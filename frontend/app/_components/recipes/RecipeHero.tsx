"use client";

import { resolveAssetUrl } from "../../../lib/api/axios-instance";

interface RecipeHeroProps {
  title: string;
  description: string;
  badge: string;
  duration: string;
  chef: string;
  imageUrl?: string;
}

export default function RecipeHero({ title, description, badge, duration, chef, imageUrl }: RecipeHeroProps) {
  return (
    <div
      className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-gray-700 to-gray-900 bg-cover bg-center h-96 flex flex-col justify-end p-6 text-white"
      style={imageUrl ? { backgroundImage: `url(${resolveAssetUrl(imageUrl)})` } : undefined}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
        {badge && (
          <span
            className={`text-xs font-bold px-3 py-1 rounded-full uppercase ${
              badge.toLowerCase() === "pro"
                ? "bg-amber-500 text-white"
                : badge.toLowerCase() === "free"
                ? "bg-green-500 text-white"
                : "bg-white/20 backdrop-blur-sm text-white"
            }`}
          >
            {badge}
          </span>
        )}
        <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full">
          {duration}
        </span>
      </div>
      <div className="relative z-10">
        <p className="text-sm text-gray-300 mb-1">By {chef}</p>
        <h1 className="text-3xl font-bold mb-2">{title}</h1>
        <p className="text-gray-300 max-w-lg text-sm">{description}</p>
      </div>
    </div>
  );
}
