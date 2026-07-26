"use client";

import { SlidersHorizontal } from "lucide-react";
import { RECIPE_TAGS } from "../../../lib/recipeTags";

const FILTERS = RECIPE_TAGS;

interface FilterChipsProps {
  active: string | null;
  onSelect: (filter: string | null) => void;
}

export default function FilterChips({ active, onSelect }: FilterChipsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {FILTERS.map((filter) => (
        <button
          key={filter}
          onClick={() => onSelect(active === filter ? null : filter)}
          className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
            active === filter
              ? "bg-[#B34B20] text-white border-[#B34B20]"
              : "bg-white text-gray-600 border-gray-200 hover:border-[#B34B20]/50"
          }`}
        >
          {filter}
        </button>
      ))}
      <button className="flex items-center gap-1 px-4 py-2 rounded-full text-sm font-semibold text-[#B34B20] border border-[#B34B20]/30 hover:bg-orange-50 transition-colors">
        <SlidersHorizontal className="w-4 h-4" /> All Filters
      </button>
    </div>
  );
}
