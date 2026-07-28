"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, ArrowLeft } from "lucide-react";
import { requestPasswordResetCode } from "@/lib/composition/api";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await requestPasswordResetCode(email);
      router.push(`/verify-code?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reset code");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Kitchen Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#3a3530] via-[#4a433c] to-[#2e2925] flex-col justify-end p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center opacity-60">
          <div className="w-40 h-40 rounded-full bg-gray-300/20 blur-3xl" />
        </div>
        <div className="relative z-10 max-w-md">
          <h2 className="text-3xl font-bold mb-3">Back to the Kitchen Soon.</h2>
          <p className="text-gray-300 mb-4">
            Let&apos;s get you back in the kitchen so you can keep crafting those culinary masterpieces.
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <Mail className="w-4 h-4" />
            chef@e-recipe.com
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-6">
            <h1 className="text-2xl font-bold text-[#B34B20]">🍴 E-Recipe</h1>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password?</h2>
          <p className="text-gray-500 mb-8">
            No worries! It happens to the best chefs. Enter your email and we&apos;ll send you a secure code to reset your password.
          </p>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  required
                  placeholder="chef@e-recipe.com"
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#B34B20]/20 focus:border-[#B34B20] transition-all"
                />
              </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full bg-gradient-to-r from-[#B34B20] to-[#A64B1C] text-white font-semibold py-3.5 rounded-xl hover:from-[#A64B1C] hover:to-[#963D19] transition-all shadow-lg shadow-orange-900/20 flex items-center justify-center gap-2 ${
                isSubmitting ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? "Sending..." : "Send Code"}
              <span aria-hidden>→</span>
            </button>

            <Link
              href="/login"
              className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-[#B34B20] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Sign In
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}
