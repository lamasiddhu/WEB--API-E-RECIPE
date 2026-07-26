"use client";

import { useState } from "react";

interface ERecipeProfileData {
  dietaryPreference: "none" | "vegetarian" | "vegan" | "halal" | "kosher" | "gluten_free";
  allergies: string[];
  spiceLevel: "mild" | "medium" | "spicy" | "extra_spicy";
  cookingSkill: "beginner" | "intermediate" | "advanced" | "professional";
  mealsPerWeek: number;
  preferredCuisine: string;
}

interface ERecipeProfileFormProps {
  onSubmit: (data: ERecipeProfileData) => Promise<{ success: boolean; message?: string }>;
  initialData?: ERecipeProfileData | null;
}

const ALLERGY_OPTIONS = [
  "Peanuts", "Tree Nuts", "Dairy", "Eggs", "Shellfish", 
  "Fish", "Soy", "Wheat", "Gluten", "None"
];

export default function ERecipeProfileForm({ onSubmit, initialData }: ERecipeProfileFormProps) {
  const [formData, setFormData] = useState<ERecipeProfileData>({
    dietaryPreference: initialData?.dietaryPreference ?? "none",
    allergies: initialData?.allergies ?? [],
    spiceLevel: initialData?.spiceLevel ?? "medium",
    cookingSkill: initialData?.cookingSkill ?? "intermediate",
    mealsPerWeek: initialData?.mealsPerWeek ?? 5,
    preferredCuisine: initialData?.preferredCuisine ?? "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggleAllergy = (allergy: string) => {
    if (allergy === "None") {
      setFormData({ ...formData, allergies: [] });
      return;
    }

    const newAllergies = formData.allergies.includes(allergy)
      ? formData.allergies.filter((a) => a !== allergy)
      : [...formData.allergies.filter((a) => a !== "None"), allergy];

    setFormData({ ...formData, allergies: newAllergies });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await onSubmit(formData);
      if (response.success) {
        alert("Recipe profile saved successfully!");
        window.location.reload();
      } else {
        setError(response.message || "Failed to save profile");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">E-Recipe Profile</h2>
          <p className="text-gray-600">Tell us about your taste so we can recommend the perfect recipes for you</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dietary Preference */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Dietary Preference *</label>
            <select
              value={formData.dietaryPreference}
              onChange={(e) => setFormData({ ...formData, dietaryPreference: e.target.value as any })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B34B20]/20 focus:border-[#B34B20] transition-all bg-gray-50"
            >
              <option value="none">No Restrictions</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="vegan">Vegan</option>
              <option value="halal">Halal</option>
              <option value="kosher">Kosher</option>
              <option value="gluten_free">Gluten Free</option>
            </select>
          </div>

          {/* Allergies */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Allergies & Intolerances</label>
            <div className="flex flex-wrap gap-2">
              {ALLERGY_OPTIONS.map((allergy) => {
                const isSelected = formData.allergies.includes(allergy);
                const isNoneSelected = formData.allergies.length === 0;
                
                return (
                  <button
                    key={allergy}
                    type="button"
                    onClick={() => toggleAllergy(allergy)}
                    className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                      (allergy === "None" && isNoneSelected) || (allergy !== "None" && isSelected)
                        ? "border-[#B34B20] bg-[#B34B20]/10 text-[#B34B20]"
                        : "border-gray-200 hover:border-[#B34B20]/50 text-gray-600"
                    }`}
                  >
                    {allergy}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Spice Level */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Spice Tolerance *</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { value: "mild", icon: "️", label: "Mild" },
                { value: "medium", icon: "️🌶️", label: "Medium" },
                { value: "spicy", icon: "🌶️️🌶️", label: "Spicy" },
                { value: "extra_spicy", icon: "🔥", label: "Extra Spicy" },
              ].map((level) => {
                const isActive = formData.spiceLevel === level.value;
                return (
                  <label
                    key={level.value}
                    className={`flex items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      isActive ? "border-[#B34B20] bg-[#B34B20]/10" : "border-gray-200 hover:border-[#B34B20]/50"
                    }`}
                  >
                    <input
                      type="radio"
                      value={level.value}
                      checked={isActive}
                      onChange={(e) => setFormData({ ...formData, spiceLevel: e.target.value as any })}
                      className="hidden"
                    />
                    <div className="text-center">
                      <div className="text-2xl mb-1">{level.icon}</div>
                      <div className="font-semibold text-gray-800 text-sm">{level.label}</div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Cooking Skill */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Cooking Skill Level *</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { value: "beginner", icon: "👨‍🍳", label: "Beginner" },
                { value: "intermediate", icon: "🧑‍🍳", label: "Intermediate" },
                { value: "advanced", icon: "👩‍", label: "Advanced" },
                { value: "professional", icon: "⭐", label: "Professional" },
              ].map((skill) => {
                const isActive = formData.cookingSkill === skill.value;
                return (
                  <label
                    key={skill.value}
                    className={`flex items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      isActive ? "border-[#B34B20] bg-[#B34B20]/10" : "border-gray-200 hover:border-[#B34B20]/50"
                    }`}
                  >
                    <input
                      type="radio"
                      value={skill.value}
                      checked={isActive}
                      onChange={(e) => setFormData({ ...formData, cookingSkill: e.target.value as any })}
                      className="hidden"
                    />
                    <div className="text-center">
                      <div className="text-2xl mb-1">{skill.icon}</div>
                      <div className="font-semibold text-gray-800 text-sm">{skill.label}</div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Meals Per Week */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Meals Cooked Per Week *</label>
            <input
              type="number"
              min="0"
              max="21"
              value={formData.mealsPerWeek}
              onChange={(e) => setFormData({ ...formData, mealsPerWeek: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B34B20]/20 focus:border-[#B34B20] transition-all bg-gray-50"
              placeholder="5"
              required
            />
          </div>

          {/* Preferred Cuisine */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Preferred Cuisine</label>
            <input
              type="text"
              value={formData.preferredCuisine}
              onChange={(e) => setFormData({ ...formData, preferredCuisine: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B34B20]/20 focus:border-[#B34B20] transition-all bg-gray-50"
              placeholder="e.g., Italian, Nepali, Thai..."
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-gradient-to-r from-[#B34B20] to-[#A64B1C] text-white font-semibold py-4 rounded-xl hover:from-[#A64B1C] hover:to-[#963D19] transform hover:scale-[1.01] transition-all shadow-lg shadow-orange-900/20 ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving Profile...
              </span>
            ) : (
              "Save Recipe Profile & Get Recommendations"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}