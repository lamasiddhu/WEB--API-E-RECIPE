"use client";

import { Users, Flame, Beef, Gauge } from "lucide-react";

interface NutritionStatsProps {
  servings: number;
  calories: number;
  protein: number;
  difficulty: string;
}

export default function NutritionStats({ servings, calories, protein, difficulty }: NutritionStatsProps) {
  const stats = [
    { label: "People", value: String(servings), icon: Users, sub: "SERVES" },
    { label: "kcal", value: String(calories), icon: Flame, sub: "CALORIES" },
    { label: "g", value: String(protein), icon: Beef, sub: "PROTEIN" },
    { label: "", value: difficulty, icon: Gauge, sub: "DIFFICULTY" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div key={stat.sub} className="bg-white p-4 rounded-xl border border-gray-100 text-center">
          <stat.icon className="w-5 h-5 text-[#B34B20] mx-auto mb-2" />
          <p className="text-lg font-bold text-gray-900">
            {stat.value}
            {stat.label && <span className="text-xs font-normal text-gray-400">{stat.label}</span>}
          </p>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{stat.sub}</p>
        </div>
      ))}
    </div>
  );
}
