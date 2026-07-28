"use client";

import { useEffect, useState } from "react";
import { Loader2, Pencil, Save, Star, Trash2, X } from "lucide-react";
import { ApiReview, deleteReview, getAllReviews, resolveAssetUrl, updateReview } from "@/lib/composition/api";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ApiReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ApiReview | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const result = await getAllReviews();
      setReviews(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    setError("");
    try {
      const result = await updateReview(editing._id, { rating: editing.rating, comment: editing.comment });
      setReviews((current) => current.map((review) => review._id === editing._id ? result.data : review));
      setEditing(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update review");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (review: ApiReview) => {
    if (!window.confirm(`Delete ${review.userName}'s review?`)) return;
    setError("");
    try {
      await deleteReview(review._id);
      setReviews((current) => current.filter((item) => item._id !== review._id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete review");
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Reviews</h1>
        <p className="text-gray-500 mt-1">View and edit ratings and comments submitted by users.</p>
      </div>
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
      {loading ? <Loader2 className="w-6 h-6 animate-spin text-gray-400" /> : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-500">
                <tr><th className="p-4">User</th><th className="p-4">Recipe</th><th className="p-4">Rating</th><th className="p-4">Comment</th><th className="p-4">Date</th><th className="p-4"></th></tr>
              </thead>
              <tbody>
                {reviews.map((review) => (
                  <tr key={review._id} className="border-t border-gray-100">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {review.userAvatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={resolveAssetUrl(review.userAvatarUrl)} alt={review.userName} className="w-9 h-9 rounded-full object-cover" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-[#B34B20] text-white flex items-center justify-center font-bold">{review.userName.charAt(0).toUpperCase()}</div>
                        )}
                        <span className="font-semibold text-gray-900">{review.userName}</span>
                      </div>
                    </td>
                    <td className="p-4"><p className="font-medium text-gray-800">{review.recipeTitle}</p><p className="text-gray-400 font-mono text-xs">{review.recipeId}</p></td>
                    <td className="p-4"><span className="inline-flex items-center gap-1"><Star className="w-4 h-4 text-amber-400 fill-current" />{review.rating}</span></td>
                    <td className="p-4 text-gray-600 max-w-md">{review.comment}</td>
                    <td className="p-4 text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</td>
                    <td className="p-4"><div className="flex gap-1"><button onClick={() => setEditing({ ...review })} className="p-2 text-[#B34B20] hover:bg-orange-50 rounded-lg"><Pencil className="w-4 h-4" /></button><button onClick={() => void remove(review)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button></div></td>
                  </tr>
                ))}
                {!reviews.length && <tr><td colSpan={6} className="p-10 text-center text-gray-400">No reviews have been submitted.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-[70] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-5"><h2 className="text-xl font-bold">Edit Review</h2><button onClick={() => setEditing(null)}><X className="w-5 h-5" /></button></div>
            <div className="flex gap-1 mb-4">{[1,2,3,4,5].map((star) => <button key={star} onClick={() => setEditing({ ...editing, rating: star })}><Star className={`w-7 h-7 ${star <= editing.rating ? "text-amber-400 fill-current" : "text-gray-300"}`} /></button>)}</div>
            <textarea value={editing.comment} maxLength={1000} onChange={(event) => setEditing({ ...editing, comment: event.target.value })} className="w-full min-h-32 border border-gray-200 rounded-xl p-3" />
            <button onClick={save} disabled={saving || !editing.comment.trim()} className="mt-4 inline-flex items-center gap-2 bg-[#B34B20] text-white px-5 py-2.5 rounded-xl font-semibold disabled:opacity-60">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
