"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Briefcase, Lock, Eye, EyeOff, KeyRound } from "lucide-react";
import { handleLoginUser } from "@/lib/actions/auth-action";
import { setSession } from "@/lib/composition/session";
import { useAuth } from "@/lib/contexts/AuthContext";

export default function AdminLoginPage() {
  const router = useRouter();
  const { checkAuth } = useAuth();
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberTerminal, setRememberTerminal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");
    setIsSubmitting(true);
    try {
      const result = await handleLoginUser({ email: adminId, password });
      if (result.success && result.data) {
        if (result.data.user?.role === "admin") {
          setSession(result.data.token, result.data.user);
          checkAuth();
          router.push("/admin");
          return;
        }
        setMessage("This account does not have admin access.");
      } else {
        setMessage(result.message || "Authentication failed.");
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Authentication failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFBF7] p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-xl bg-[#B34B20] flex items-center justify-center text-white mb-4">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin Access</h2>
          <p className="text-gray-500 text-sm">
            Welcome back to the E-Recipe administration portal. Please verify your credentials.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">
              Admin ID
            </label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                type="text"
                name="admin-portal-id"
                autoComplete="off"
                required
                placeholder="Enter your administrative ID"
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#B34B20]/20 focus:border-[#B34B20] transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide">
                Secure Password
              </label>
              <Link href="/forgot-password" className="text-xs font-semibold text-[#B34B20] hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPassword ? "text" : "password"}
                name="admin-portal-secret"
                autoComplete="new-password"
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

          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={rememberTerminal}
              onChange={(e) => setRememberTerminal(e.target.checked)}
              className="rounded border-gray-300 text-[#B34B20] focus:ring-[#B34B20]/20"
            />
            Remember this terminal for 24 hours
          </label>

          {message && <p className="text-center text-sm text-red-600">{message}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full bg-gradient-to-r from-[#B34B20] to-[#A64B1C] text-white font-semibold py-3.5 rounded-xl hover:from-[#A64B1C] hover:to-[#963D19] transition-all shadow-lg shadow-orange-900/20 flex items-center justify-center gap-2 ${
              isSubmitting ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {isSubmitting ? "Authenticating..." : "Authenticate Access"} <span aria-hidden>🔑</span>
          </button>

          <Link
            href="/login"
            className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-[#B34B20] transition-colors"
          >
            ← Back to Sign In
          </Link>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-100 text-center">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Authorized Access Only</p>
          <p className="text-xs text-gray-400 mt-1">System Version 4.2.0 • ID: 88-XF9</p>
        </div>
      </div>
    </div>
  );
}
