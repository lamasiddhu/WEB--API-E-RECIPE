"use client";

import { FormEvent, Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { RotateCcw, Lock, ShieldCheck, Eye, EyeOff, Check, CheckCircle2 } from "lucide-react";
import { setNewPassword, resetPasswordWithCode } from "../../../lib/api/auth";
import { useAuth } from "../../../lib/contexts/AuthContext";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const code = searchParams.get("code") || "";
  const isCodeFlow = !!email && !!code;

  const { isAuthenticated, loading } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isDone, setIsDone] = useState(false);

  const rules = useMemo(
    () => [
      { label: "At least 8 characters long", met: password.length >= 8 },
      { label: "Contains a special character", met: /[^A-Za-z0-9]/.test(password) },
      { label: "Includes at least one number", met: /[0-9]/.test(password) },
      { label: "Passwords must match exactly", met: password.length > 0 && password === confirmPassword },
    ],
    [password, confirmPassword]
  );

  const metCount = rules.filter((r) => r.met).length;
  const strengthPercent = (metCount / rules.length) * 100;
  const strengthLabel =
    metCount === rules.length ? "Strong" : metCount >= rules.length / 2 ? "Fair" : "Weak";

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      if (isCodeFlow) {
        await resetPasswordWithCode(email, code, password);
      } else {
        await setNewPassword(password);
      }
      setIsDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to set new password");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isCodeFlow && !loading && !isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFBF7] p-6 text-center">
        <p className="text-gray-700 font-semibold mb-2">You need to be signed in to reset your password.</p>
        <Link href="/login" className="text-[#B34B20] font-semibold hover:underline">
          Go to Sign In
        </Link>
      </div>
    );
  }

  if (isDone) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFBF7] p-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Updated</h2>
          <p className="text-gray-500 text-sm mb-6">
            Your password has been changed. Use your new password the next time you sign in.
          </p>
          <button
            onClick={() => router.push(isCodeFlow ? "/login" : "/dashboard")}
            className="w-full bg-gradient-to-r from-[#B34B20] to-[#A64B1C] text-white font-semibold py-3.5 rounded-xl hover:from-[#A64B1C] hover:to-[#963D19] transition-all shadow-lg shadow-orange-900/20"
          >
            {isCodeFlow ? "Back to Sign In" : "Back to Dashboard"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFBF7] p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center text-[#B34B20] mb-4">
            <RotateCcw className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Secure Your Account</h2>
          <p className="text-gray-500 text-sm">
            Choose a strong password to protect your culinary secrets and personal ledger.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPassword ? "text" : "password"}
                required
                className="w-full pl-11 pr-11 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#B34B20]/20 focus:border-[#B34B20] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                type={showPassword ? "text" : "password"}
                required
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#B34B20]/20 focus:border-[#B34B20] transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">Password Strength</span>
              <span className="text-xs font-bold text-[#B34B20]">{strengthLabel}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#B34B20] to-[#A64B1C] h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${strengthPercent}%` }}
              />
            </div>
            <ul className="space-y-1.5">
              {rules.map((rule) => (
                <li key={rule.label} className="flex items-center gap-2 text-sm">
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                      rule.met ? "bg-green-500 text-white" : "border border-gray-300"
                    }`}
                  >
                    {rule.met && <Check className="w-3 h-3" />}
                  </span>
                  <span className={rule.met ? "text-gray-700" : "text-gray-400"}>{rule.label}</span>
                </li>
              ))}
            </ul>
          </div>

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          <button
            type="submit"
            disabled={metCount !== rules.length || isSubmitting}
            className={`w-full bg-gradient-to-r from-[#B34B20] to-[#A64B1C] text-white font-semibold py-3.5 rounded-xl hover:from-[#A64B1C] hover:to-[#963D19] transition-all shadow-lg shadow-orange-900/20 flex items-center justify-center gap-2 ${
              metCount !== rules.length || isSubmitting ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isSubmitting ? "Saving..." : "Reset Password"} <span aria-hidden>→</span>
          </button>

          <Link href={isCodeFlow ? "/login" : "/dashboard"} className="block text-center text-sm text-gray-500 hover:text-[#B34B20]">
            ← Back
          </Link>
        </form>
      </div>

      <div className="text-center mt-6">
        <p className="text-[#B34B20] font-bold">🍴 E-Recipe</p>
        <p className="text-xs text-gray-400 uppercase tracking-wider">Excellence in Every Bite</p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
