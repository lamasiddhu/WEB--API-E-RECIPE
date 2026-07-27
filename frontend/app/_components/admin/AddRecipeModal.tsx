"use client";

import { FormEvent, useState } from "react";
import { X, ImagePlus, Plus, Trash2 } from "lucide-react";
import { uploadFile } from "../../../lib/api/upload";
import { resolveAssetUrl } from "../../../lib/api/axios-instance";
import { ApiRecipe } from "../../../lib/api/recipe";
import { RECIPE_TAGS, MEAL_TYPES } from "../../../lib/recipeTags";

export interface NewRecipeStep {
  title: string;
  description: string;
}

export interface NewRecipeInput {
  title: string;
  category: string;
  time: string;
  difficulty: string;
  imageUrl?: string;
  badge?: string;
  mealType?: string;
  chef?: string;
  description?: string;
  servings?: number;
  calories?: number;
  protein?: number;
  rating?: number;
  price?: number;
  tags?: string[];
  ingredients?: string[];
  steps?: NewRecipeStep[];
  videoUrl?: string;
}

interface AddRecipeModalProps {
  onClose: () => void;
  onAdd: (recipe: NewRecipeInput) => void;
  initialData?: ApiRecipe;
}

export default function AddRecipeModal({ onClose, onAdd, initialData }: AddRecipeModalProps) {
  const isEditMode = !!initialData;

  const [title, setTitle] = useState(initialData?.title || "");
  const [category, setCategory] = useState(initialData?.category || "");
  const [time, setTime] = useState(initialData?.duration || "");
  const [difficulty, setDifficulty] = useState(initialData?.difficulty || "Intermediate");
  const [badge, setBadge] = useState<"Free" | "Normal" | "Pro">(
    initialData?.badge === "Pro" ? "Pro" : initialData?.badge === "Normal" ? "Normal" : "Free"
  );
  const [mealType, setMealType] = useState(initialData?.mealType || "");
  const [chef, setChef] = useState(initialData?.chef || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [servings, setServings] = useState(initialData?.servings ? String(initialData.servings) : "4");
  const [calories, setCalories] = useState(initialData?.calories ? String(initialData.calories) : "");
  const [protein, setProtein] = useState(initialData?.protein ? String(initialData.protein) : "");
  const [price, setPrice] = useState(initialData?.price ? String(initialData.price) : "");
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [videoUrl, setVideoUrl] = useState(initialData?.videoUrl || "");

  const toggleTag = (tag: string) => {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const [ingredientDraft, setIngredientDraft] = useState("");
  const [ingredients, setIngredients] = useState<string[]>(initialData?.ingredients || []);

  const [stepTitleDraft, setStepTitleDraft] = useState("");
  const [stepDescDraft, setStepDescDraft] = useState("");
  const [steps, setSteps] = useState<NewRecipeStep[]>(initialData?.steps || []);

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(
    initialData?.imageUrl ? resolveAssetUrl(initialData.imageUrl) : undefined
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
  };

  const addIngredient = () => {
    if (!ingredientDraft.trim()) return;
    setIngredients((prev) => [...prev, ingredientDraft.trim()]);
    setIngredientDraft("");
  };

  const removeIngredient = (index: number) => {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  const addStep = () => {
    if (!stepTitleDraft.trim() || !stepDescDraft.trim()) return;
    setSteps((prev) => [...prev, { title: stepTitleDraft.trim(), description: stepDescDraft.trim() }]);
    setStepTitleDraft("");
    setStepDescDraft("");
  };

  const removeStep = (index: number) => {
    setSteps((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim()) return;
    setIsSaving(true);
    setError("");
    try {
      let imageUrl: string | undefined = initialData?.imageUrl;
      if (file) {
        const uploaded = await uploadFile(file);
        imageUrl = uploaded.url;
      }
      onAdd({
        title: title.trim(),
        category: category.trim() || "Uncategorized",
        time: time.trim() || "30 min",
        difficulty,
        imageUrl,
        badge,
        mealType: mealType || undefined,
        chef: chef.trim() || undefined,
        description: description.trim() || undefined,
        servings: servings ? Number(servings) : undefined,
        calories: calories ? Number(calories) : undefined,
        protein: protein ? Number(protein) : undefined,
        price: price ? Number(price) : undefined,
        tags: tags.length > 0 ? tags : undefined,
        ingredients: ingredients.length > 0 ? ingredients : undefined,
        steps: steps.length > 0 ? steps : undefined,
        videoUrl: badge !== "Free" && videoUrl.trim() ? videoUrl.trim() : undefined,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image");
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">{isEditMode ? "Edit Recipe" : "Add Recipe"}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-center">
            <label className="relative cursor-pointer group">
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewUrl} alt="Recipe preview" className="w-20 h-20 rounded-xl object-cover" />
              ) : (
                <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400">
                  <ImagePlus className="w-6 h-6" />
                </div>
              )}
              <div className="absolute bottom-0 right-0 bg-[#B34B20] text-white p-1.5 rounded-full border-2 border-white group-hover:bg-[#963D19]">
                <ImagePlus className="w-3.5 h-3.5" />
              </div>
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
              Recipe Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g., Heritage Sourdough"
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#B34B20]/20 focus:border-[#B34B20]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="A short description shown on the recipe page..."
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#B34B20]/20 focus:border-[#B34B20] resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                Category
              </label>
              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g., Classic French"
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#B34B20]/20 focus:border-[#B34B20]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                Meal Type
              </label>
              <select
                value={mealType}
                onChange={(e) => setMealType(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#B34B20]/20 focus:border-[#B34B20]"
              >
                <option value="">Not set</option>
                {MEAL_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
              Access Tier
            </label>
            <select
              value={badge}
              onChange={(e) => setBadge(e.target.value as "Free" | "Normal" | "Pro")}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#B34B20]/20 focus:border-[#B34B20]"
            >
              <option value="Free">Free</option>
              <option value="Normal">Normal</option>
              <option value="Pro">Pro</option>
            </select>
          </div>
          <p className="text-xs text-gray-400 -mt-2">
            Free recipes are open to everyone. Normal recipes can be bought individually (or unlocked with Pro access). Pro recipes can&apos;t be purchased. Only Pro members can view them.
          </p>

          {badge !== "Free" && (
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                Video Walkthrough (YouTube)
              </label>
              <input
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#B34B20]/20 focus:border-[#B34B20]"
              />
              <p className="text-xs text-gray-400 mt-1">
                Only shown to users who&apos;ve unlocked this recipe (purchased, or Pro access). Free recipes can&apos;t have a video.
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                Cook Time
              </label>
              <input
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="35 min"
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#B34B20]/20 focus:border-[#B34B20]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#B34B20]/20 focus:border-[#B34B20]"
              >
                <option>Basic</option>
                <option>Intermediate</option>
                <option>Advanced</option>
                <option>Expert</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
              Chef (optional)
            </label>
            <input
              value={chef}
              onChange={(e) => setChef(e.target.value)}
              placeholder="e.g., Gordon Ramsay"
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#B34B20]/20 focus:border-[#B34B20]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
              Price (NPR)
            </label>
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#B34B20]/20 focus:border-[#B34B20]"
            />
            <p className="text-xs text-gray-400 mt-1">Charged when a user checks out this recipe from their basket. Leave blank for free.</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
              Dietary &amp; Meal Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {RECIPE_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                    tags.includes(tag)
                      ? "bg-[#B34B20] text-white border-[#B34B20]"
                      : "bg-gray-50 text-gray-600 border-gray-200 hover:border-[#B34B20]/50"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-1">Used to match this recipe against the search page&apos;s filter chips.</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Servings</label>
              <input
                value={servings}
                onChange={(e) => setServings(e.target.value)}
                type="number"
                min="0"
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#B34B20]/20 focus:border-[#B34B20]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Calories</label>
              <input
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                type="number"
                min="0"
                placeholder="540"
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#B34B20]/20 focus:border-[#B34B20]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Protein (g)</label>
              <input
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                type="number"
                min="0"
                placeholder="42"
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#B34B20]/20 focus:border-[#B34B20]"
              />
            </div>
          </div>

          {/* Ingredients */}
          <div className="pt-2 border-t border-gray-100">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 mt-3">
              Ingredients
            </label>
            <div className="flex gap-2 mb-2">
              <input
                value={ingredientDraft}
                onChange={(e) => setIngredientDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addIngredient();
                  }
                }}
                placeholder="e.g., 1.5kg Organic Whole Chicken"
                className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#B34B20]/20 focus:border-[#B34B20]"
              />
              <button
                type="button"
                onClick={addIngredient}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-600"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {ingredients.length > 0 && (
              <ul className="space-y-1.5">
                {ingredients.map((ingredient, i) => (
                  <li key={i} className="flex items-center justify-between gap-2 bg-gray-50 rounded-lg px-3 py-1.5">
                    <span className="text-sm text-gray-700">{ingredient}</span>
                    <button type="button" onClick={() => removeIngredient(i)} className="text-gray-400 hover:text-red-600">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Cooking Steps */}
          <div className="pt-2 border-t border-gray-100">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 mt-3">
              Cooking Steps
            </label>
            <div className="space-y-2 mb-2">
              <input
                value={stepTitleDraft}
                onChange={(e) => setStepTitleDraft(e.target.value)}
                placeholder="Step title, e.g., Preheat and Prep"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#B34B20]/20 focus:border-[#B34B20]"
              />
              <div className="flex gap-2">
                <textarea
                  value={stepDescDraft}
                  onChange={(e) => setStepDescDraft(e.target.value)}
                  rows={2}
                  placeholder="Step details..."
                  className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#B34B20]/20 focus:border-[#B34B20] resize-none"
                />
                <button
                  type="button"
                  onClick={addStep}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-600 self-start"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
            {steps.length > 0 && (
              <ul className="space-y-1.5">
                {steps.map((step, i) => (
                  <li key={i} className="flex items-start justify-between gap-2 bg-gray-50 rounded-lg px-3 py-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800">{i + 1}. {step.title}</p>
                      <p className="text-xs text-gray-500 line-clamp-2">{step.description}</p>
                    </div>
                    <button type="button" onClick={() => removeStep(i)} className="text-gray-400 hover:text-red-600 shrink-0">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 py-2.5 bg-[#B34B20] text-white rounded-xl text-sm font-semibold hover:bg-[#A64B1C] disabled:opacity-60"
            >
              {isSaving ? "Saving..." : isEditMode ? "Save Changes" : "Add Recipe"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
