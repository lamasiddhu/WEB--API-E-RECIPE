"use client";

import { SlidersHorizontal } from "lucide-react";
import { RECIPE_TAGS } from "../../../lib/recipeTags";

const FILTERS = RECIPE_TAGS;

interface FilterChipsProps {
  active: string | null;
  onSelect: (filter: string | null) => void;
  onAllFilters: () => void;
  hasAdvancedFilters: boolean;
}

export default function FilterChips({ active, onSelect, onAllFilters, hasAdvancedFilters }: FilterChipsProps) {
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
      <button
        onClick={onAllFilters}
        className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
          hasAdvancedFilters
            ? "bg-[#B34B20] text-white border-[#B34B20]"
            : "text-[#B34B20] border-[#B34B20]/30 hover:bg-orange-50"
        }`}
      >
        <SlidersHorizontal className="w-4 h-4" /> All Filters
      </button>
    </div>
  );
}
