"use client";

import { X } from "lucide-react";

interface RecentSearchesProps {
  searches: string[];
  onClear: () => void;
  onRemove: (search: string) => void;
  onSelect: (search: string) => void;
}

export default function RecentSearches({ searches, onClear, onRemove, onSelect }: RecentSearchesProps) {
  if (searches.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-gray-900">Recent Searches</h3>
        <button onClick={onClear} className="text-xs font-semibold text-[#B34B20] hover:underline">
          Clear all
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {searches.map((search) => (
          <span
            key={search}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-600 text-sm rounded-full"
          >
            <button onClick={() => onSelect(search)} className="hover:text-gray-900">
              {search}
            </button>
            <button onClick={() => onRemove(search)} className="hover:text-gray-900">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
