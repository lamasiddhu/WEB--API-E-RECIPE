"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "@/app/_components/Logo";
import { handleLoginUser } from "@/lib/actions/auth-action";
import { useAuth } from "@/lib/contexts/AuthContext";
import { setSession } from "@/lib/composition/session";
import { loginWithGoogle } from "@/lib/composition/api";
import GoogleSignInButton from "@/app/_components/auth/GoogleSignInButton";

export default function LoginPage() {
  const router = useRouter();
  const { checkAuth } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [chefIdOrEmail, setChefIdOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setMessage("");
  setIsSubmitting(true);

  try {
    // FIXED: Send as 'email' to match the backend DTO
    const result = await handleLoginUser({ email: chefIdOrEmail, password });
    if (result.success && result.data) {
      setSession(result.data.token, result.data.user);
      checkAuth();
      router.push("/dashboard");
    } else {
      setMessage(result.message || "Login failed.");
    }
  } catch (error: any) {
    setMessage(error?.message || "Login failed.");
  } finally {
    setIsSubmitting(false);
  }
};

  const handleGoogleCredential = async (idToken: string) => {
    setMessage("");
    try {
      const result = await loginWithGoogle(idToken);
      if (result.success && result.data) {
        setSession(result.data.token, result.data.user);
        checkAuth();
        router.push("/dashboard");
      } else {
        setMessage(result.message || "Google sign-in failed.");
      }
    } catch (error: any) {
      setMessage(error?.message || "Google sign-in failed.");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Brown Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#B34B20] via-[#C0582B] to-[#A64B1C] flex-col justify-between p-12 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-black rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
        </div>

        {/* Header */}
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-3xl font-bold">E-Recipe</h1>
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-semibold">LOGIN</span>
          </div>
          <p className="text-amber-100 text-lg">Where precision meets the passion of home cooking.</p>
        </div>

        {/* Center */}
        <div className="relative z-10 flex flex-col items-center justify-center flex-1">
          <Logo size="lg" variant="light" className="mb-6" />
          <h2 className="text-2xl font-bold mb-2">Welcome to E-Recipe</h2>
          <p className="text-amber-100 text-center max-w-xs">
            Discover, share, and organize your favorite recipes
          </p>
        </div>

        {/* Quote */}
        <div className="relative z-10 bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <p className="text-lg italic text-amber-50 mb-4">
            "Cooking is at once child's play and adult joy. And cooking done with care is an act of love."
          </p>
          <p className="text-amber-200 font-semibold">SIDDHARTHA</p>
        </div>
      </div>

      {/* Right Side - White Section */}
      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-6">
            <Logo size="md" variant="dark" />
          </div>

          {/* Welcome */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-600">Enter your details to manage your kitchen.</p>
          </div>

          {/* Admin Login Link */}
          <div className="flex justify-end mb-4">
            <Link
              href="/admin-login"
              className="text-sm font-semibold text-gray-500 hover:text-[#B34B20] transition-colors"
            >
              Admin Login →
            </Link>
          </div>

          {/* Form */}
          <form className="space-y-5" onSubmit={handleLogin}>
            {/* Email or Chef ID */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                EMAIL OR CHEF ID
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  value={chefIdOrEmail}
                  onChange={(e) => setChefIdOrEmail(e.target.value)}
                  type="text"
                  placeholder="chef@e-recipe.com"
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#B34B20]/20 focus:border-[#B34B20] transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-gray-700">
                  PASSWORD
                </label>
                <Link href="/forgot-password" className="text-sm text-[#B34B20] hover:underline font-semibold">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#B34B20]/20 focus:border-[#B34B20] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 text-[#B34B20] border-gray-300 rounded focus:ring-[#B34B20]"
              />
              <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
                Keep me logged in
              </label>
            </div>

            {/* Sign In Button */}
            {message && <p className="text-center text-sm text-red-600">{message}</p>}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full bg-gradient-to-r from-[#B34B20] to-[#A64B1C] text-white font-semibold py-3.5 rounded-xl hover:from-[#A64B1C] hover:to-[#963D19] transform hover:scale-[1.02] transition-all shadow-lg shadow-orange-900/20 ${
                isSubmitting ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? "Signing in..." : "Sign In to Dashboard"}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-medium">OR CONTINUE WITH</span>
            </div>
          </div>

          {/* Social Login */}
          <div className="flex justify-center">
            <GoogleSignInButton onCredential={handleGoogleCredential} onError={setMessage} />
          </div>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link href="/register" className="text-[#B34B20] font-semibold hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}