"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Loader2, Crown, Clock } from "lucide-react";
import { useAuth } from "../../../lib/contexts/AuthContext";
import { getMe } from "@/lib/composition/api";
import { requestProAccess } from "@/lib/composition/api";
import { resolveAssetUrl } from "@/lib/composition/api";
import { ApiRecipe } from "@/lib/composition/api";

interface PromoBannerProps {
  recipes: ApiRecipe[];
}

export default function PromoBanner({ recipes }: PromoBannerProps) {
  const { user, updateUser } = useAuth();
  const [isRequesting, setIsRequesting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getMe()
      .then((result) => {
        if (result.data) {
          updateUser({ isPro: result.data.isPro, proRequestPending: result.data.proRequestPending });
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const recommended = [...recipes].sort((a, b) => (b.protein || 0) - (a.protein || 0))[0];

  const handleRequest = async () => {
    setIsRequesting(true);
    setError("");
    try {
      await requestProAccess();
      updateUser({ proRequestPending: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to request Pro access");
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <section className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#B34B20] via-[#C0582B] to-[#A64B1C] text-white shadow-xl">
      <div className="absolute inset-0 opacity-10"><div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div></div>
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-8 lg:p-12 gap-8">
        <div className="flex-1 space-y-4">
          {user?.isPro ? (
            <>
              <div className="flex items-center gap-2">
                <Crown className="w-7 h-7 text-amber-200" />
                <h2 className="text-3xl lg:text-4xl font-bold leading-tight">You&apos;re a Pro Member</h2>
              </div>
              <p className="text-amber-100 text-lg max-w-lg">
                Enjoy full access to Premium recipes, seasonal ingredient guides, and the complete recipe archive.
              </p>
            </>
          ) : user?.proRequestPending ? (
            <>
              <div className="flex items-center gap-2">
                <Clock className="w-7 h-7 text-amber-200" />
                <h2 className="text-3xl lg:text-4xl font-bold leading-tight">Pro Access Requested</h2>
              </div>
              <p className="text-amber-100 text-lg max-w-lg">
                Your request has been sent to an admin for review. You&apos;ll be notified as soon as it&apos;s approved.
              </p>
            </>
          ) : (
            <>
              <h2 className="text-3xl lg:text-4xl font-bold leading-tight">Elevate Your Culinary Skills</h2>
              <p className="text-amber-100 text-lg max-w-lg">
                Unlock recipes marked &quot;Premium&quot; and get full access to the recipe archive. Request Pro access and an admin will review it shortly.
              </p>
              <button
                onClick={handleRequest}
                disabled={isRequesting}
                className="mt-4 bg-white text-[#B34B20] px-6 py-3 rounded-xl font-bold hover:bg-amber-50 transition-colors shadow-lg flex items-center gap-2 disabled:opacity-70"
              >
                {isRequesting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Sending Request...
                  </>
                ) : (
                  <>
                    Request Pro Access <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
              {error && <p className="text-sm text-red-100 bg-red-900/30 rounded-lg px-3 py-1.5 inline-block">{error}</p>}
            </>
          )}
        </div>

        {recommended && (
          <div className="hidden md:block w-64 lg:w-80 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
            <p className="text-xs font-semibold text-amber-200 uppercase tracking-wider mb-3">Recommended for You</p>
            <a href={`/recipes/${recommended._id}`} className="flex gap-3 items-center hover:opacity-90 transition-opacity">
              <div
                className="w-12 h-12 rounded-lg bg-gray-300 bg-cover bg-center shrink-0"
                style={recommended.imageUrl ? { backgroundImage: `url(${resolveAssetUrl(recommended.imageUrl)})` } : undefined}
              />
              <div className="min-w-0">
                <p className="font-bold text-sm line-clamp-1">{recommended.title}</p>
                <p className="text-xs text-amber-200">
                  {recommended.protein ? `${recommended.protein}g Protein` : recommended.category || "Recipe"}
                  {recommended.calories ? ` • ${recommended.calories} kcal` : ""}
                </p>
              </div>
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
