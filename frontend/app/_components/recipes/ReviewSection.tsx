"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Loader2, Star } from "lucide-react";
import { ApiReview, getRecipeReviews, resolveAssetUrl, submitReview } from "@/lib/composition/api";

export default function ReviewSection({ recipeId, canReview }: { recipeId: string; canReview: boolean }) {
  const [reviews, setReviews] = useState<ApiReview[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const result = await getRecipeReviews(recipeId);
      setReviews(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch reviews");
    } finally {
      setLoading(false);
    }
  }, [recipeId]);

  useEffect(() => { void load(); }, [load]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await submitReview(recipeId, { rating, comment });
      setComment("");
      setRating(5);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit review");
    } finally {
      setSaving(false);
    }
  };

  const average = reviews.length
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  return (
    <section className="mt-8 bg-white rounded-2xl border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Ratings & Reviews</h2>
          <p className="text-sm text-gray-500">{reviews.length ? `${average.toFixed(1)} out of 5 · ${reviews.length} review${reviews.length === 1 ? "" : "s"}` : "No reviews yet"}</p>
        </div>
        <div className="flex text-amber-400">
          {[1, 2, 3, 4, 5].map((star) => <Star key={star} className={`w-5 h-5 ${star <= Math.round(average) ? "fill-current" : "text-gray-200"}`} />)}
        </div>
      </div>

      {canReview ? (
        <form onSubmit={submit} className="border-t border-gray-100 pt-5 mb-6">
          <label className="text-sm font-semibold text-gray-700">Your rating</label>
          <div className="flex gap-1 my-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button type="button" key={star} onClick={() => setRating(star)} aria-label={`${star} stars`}>
                <Star className={`w-7 h-7 ${star <= rating ? "text-amber-400 fill-current" : "text-gray-300"}`} />
              </button>
            ))}
          </div>
          <textarea value={comment} onChange={(event) => setComment(event.target.value)} required maxLength={1000}
            placeholder="Share your experience with this recipe"
            className="w-full min-h-24 rounded-xl border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#B34B20]/30" />
          <button disabled={saving || !comment.trim()} className="mt-3 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#B34B20] text-white font-semibold disabled:opacity-60">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />} Submit review
          </button>
        </form>
      ) : (
        <p className="border-t border-gray-100 py-4 text-sm text-gray-500">Log in and purchase or unlock this recipe before leaving a review. Free recipes can be reviewed immediately.</p>
      )}

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
      {loading ? <Loader2 className="w-5 h-5 animate-spin text-gray-400" /> : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <article key={review._id} className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
              <div className="flex items-start gap-3">
                {review.userAvatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={resolveAssetUrl(review.userAvatarUrl)} alt={review.userName} className="w-11 h-11 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-[#B34B20] text-white flex items-center justify-center font-bold shrink-0">
                    {review.userName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap justify-between gap-2">
                    <div>
                      <p className="font-semibold text-gray-900">{review.userName}</p>
                      <p className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex text-amber-400">{[1, 2, 3, 4, 5].map((star) => <Star key={star} className={`w-4 h-4 ${star <= review.rating ? "fill-current" : "text-gray-200"}`} />)}</div>
                  </div>
                  <p className="text-sm text-gray-600 mt-3 whitespace-pre-wrap">{review.comment}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
