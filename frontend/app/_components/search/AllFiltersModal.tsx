"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { MEAL_TYPES, RECIPE_TAGS } from "../../../lib/recipeTags";

export interface RecipeFilters {
  tags: string[];
  mealTypes: string[];
  categories: string[];
  badges: string[];
}

const toggle = (values: string[], value: string) =>
  values.includes(value) ? values.filter((item) => item !== value) : [...values, value];

export default function AllFiltersModal({
  open,
  value,
  categories,
  onClose,
  onApply,
}: {
  open: boolean;
  value: RecipeFilters;
  categories: string[];
  onClose: () => void;
  onApply: (filters: RecipeFilters) => void;
}) {
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    if (open) setDraft(value);
  }, [open, value]);

  if (!open) return null;

  const group = (title: string, key: keyof RecipeFilters, options: readonly string[]) => (
    <div>
      <h3 className="text-sm font-bold text-gray-900 mb-2">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = draft[key].includes(option);
          return (
            <button key={option} type="button" onClick={() => setDraft({ ...draft, [key]: toggle(draft[key], option) })}
              className={`px-3 py-2 rounded-full border text-sm font-semibold ${selected ? "bg-[#B34B20] border-[#B34B20] text-white" : "bg-white border-gray-200 text-gray-600"}`}>
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[70] bg-black/50 flex items-center justify-center p-4" onMouseDown={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6" onMouseDown={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div><h2 className="text-xl font-bold text-gray-900">All Filters</h2><p className="text-sm text-gray-500">Choose one or more options.</p></div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-6">
          {group("Diet & style", "tags", RECIPE_TAGS)}
          {group("Meal type", "mealTypes", MEAL_TYPES)}
          {group("Category", "categories", categories)}
          {group("Recipe tier", "badges", ["Free", "Normal", "Pro"])}
        </div>
        <div className="flex justify-end gap-3 mt-8 pt-5 border-t border-gray-100">
          <button onClick={() => setDraft({ tags: [], mealTypes: [], categories: [], badges: [] })} className="px-4 py-2.5 rounded-xl border border-gray-200 font-semibold text-gray-600">Clear</button>
          <button onClick={() => { onApply(draft); onClose(); }} className="px-5 py-2.5 rounded-xl bg-[#B34B20] text-white font-semibold">Apply filters</button>
        </div>
      </div>
    </div>
  );
}
