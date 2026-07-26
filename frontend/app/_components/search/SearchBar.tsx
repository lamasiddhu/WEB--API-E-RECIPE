"use client";

import { FormEvent } from "react";
import { Search } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (value: string) => void;
}

export default function SearchBar({ value, onChange, onSearch }: SearchBarProps) {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSearch(value);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          type="text"
          placeholder="Search for recipes, ingredients, or cuisines..."
          className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#B34B20]/20 focus:border-[#B34B20] transition-all"
        />
      </div>
      <button type="submit" className="px-6 py-3.5 bg-[#B34B20] text-white rounded-xl font-semibold hover:bg-[#A64B1C] transition-colors">
        Find
      </button>
    </form>
  );
}
