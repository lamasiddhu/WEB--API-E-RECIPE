"use client";

import { useState } from "react";
import { Check } from "lucide-react";

interface IngredientsListProps {
  ingredients: string[];
}

export default function IngredientsList({ ingredients }: IngredientsListProps) {
  const [checked, setChecked] = useState<Set<number>>(new Set());

  const toggle = (index: number) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Ingredients</h2>
      {ingredients.length === 0 && (
        <p className="text-sm text-gray-400">No ingredients have been added for this recipe yet.</p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {ingredients.map((ingredient, i) => {
          const isChecked = checked.has(i);
          return (
            <button
              key={i}
              type="button"
              onClick={() => toggle(i)}
              className="flex items-center gap-3 text-left"
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors ${
                  isChecked ? "bg-[#B34B20] border-[#B34B20] text-white" : "border-gray-300"
                }`}
              >
                {isChecked && <Check className="w-3 h-3" />}
              </span>
              <span className={`text-sm ${isChecked ? "line-through text-gray-400" : "text-gray-700"}`}>
                {ingredient}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
