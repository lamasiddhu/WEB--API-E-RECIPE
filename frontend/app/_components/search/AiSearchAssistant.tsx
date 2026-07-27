"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Send, Loader2, Clock, Star } from "lucide-react";
import { aiRecipeSearch, AiRecipeCard } from "../../../lib/api/aiAssistant";
import { resolveAssetUrl } from "../../../lib/api/axios-instance";

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
  recipes?: AiRecipeCard[];
}

export default function AiSearchAssistant() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const question = input.trim();
    if (!question || isSending) return;

    setMessages((prev) => [...prev, { role: "user", text: question }]);
    setInput("");
    setError("");
    setIsSending(true);
    try {
      const result = await aiRecipeSearch(question);
      const data = result.data as { message: string; recipes: AiRecipeCard[] };
      setMessages((prev) => [...prev, { role: "assistant", text: data.message, recipes: data.recipes }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "The AI assistant is unavailable right now");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.length === 0 && (
          <p className="text-sm text-gray-400">
            Try asking something like &quot;quick vegan dinner&quot; or &quot;something spicy under 30 minutes&quot;.
          </p>
        )}

        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
            <p
              className={`inline-block px-4 py-2 rounded-2xl text-sm max-w-[85%] ${
                m.role === "user" ? "bg-[#B34B20] text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100"
              }`}
            >
              {m.text}
            </p>

            {m.recipes && m.recipes.length > 0 && (
              <div className="mt-3 grid grid-cols-2 gap-3 text-left">
                {m.recipes.map((recipe) => (
                  <Link
                    key={recipe._id}
                    href={`/recipes/${recipe._id}`}
                    className="group relative rounded-xl overflow-hidden bg-gray-200 h-28 flex flex-col justify-end p-3 text-white"
                    style={
                      recipe.imageUrl
                        ? {
                            backgroundImage: `url(${resolveAssetUrl(recipe.imageUrl)})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }
                        : undefined
                    }
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                    <span className="absolute top-2 left-2 bg-[#B34B20] text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase z-10">
                      {recipe.badge || "Recipe"}
                    </span>
                    <div className="relative z-10">
                      <h5 className="font-bold text-xs line-clamp-1">{recipe.title}</h5>
                      <div className="flex items-center gap-2 text-[10px] text-gray-200 mt-0.5">
                        <span className="flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5" /> {recipe.duration || "30 min"}
                        </span>
                        {!!recipe.rating && (
                          <span className="flex items-center gap-0.5">
                            <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" /> {recipe.rating}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
        {isSending && (
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" /> Thinking...
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-600 mb-2">{error}</p>}

      <form onSubmit={handleSubmit} className="flex items-center gap-2 shrink-0">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          type="text"
          placeholder="Ask about a recipe..."
          className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#B34B20]/20 focus:border-[#B34B20]"
        />
        <button
          type="submit"
          disabled={isSending || !input.trim()}
          className="w-10 h-10 shrink-0 rounded-xl bg-[#B34B20] text-white flex items-center justify-center hover:bg-[#A64B1C] disabled:opacity-60"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
