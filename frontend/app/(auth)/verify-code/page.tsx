"use client";

import { KeyboardEvent, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, Lock, HelpCircle } from "lucide-react";

const CODE_LENGTH = 6;

export default function VerifyCodePage() {
  const router = useRouter();
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (value && !/^[0-9]$/.test(value)) return;
    const next = [...digits];
    next[index] = value;
    setDigits(next);
    if (value && index < CODE_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    router.push("/reset-password");
  };

  const code = digits.join("");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFBF7] p-6">
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold text-[#B34B20]">🍴 E-Recipe</h1>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">
          Secure Identity Verification
        </p>
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Enter Verification Code</h2>
        <p className="text-gray-500 mb-6">
          We&apos;ve sent a 6-digit secure code to your registered chef email. Please enter it below to confirm your session.
        </p>

        <div className="flex justify-center gap-2 mb-6">
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => {
                inputsRef.current[i] = el;
              }}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              maxLength={1}
              inputMode="numeric"
              className="w-12 h-14 text-center text-lg font-bold bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#B34B20]/20 focus:border-[#B34B20] transition-all"
            />
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={code.length !== CODE_LENGTH || isSubmitting}
          className={`w-full bg-gradient-to-r from-[#B34B20] to-[#A64B1C] text-white font-semibold py-3.5 rounded-xl hover:from-[#A64B1C] hover:to-[#963D19] transition-all shadow-lg shadow-orange-900/20 flex items-center justify-center gap-2 ${
            code.length !== CODE_LENGTH || isSubmitting ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <ShieldCheck className="w-4 h-4" /> Verify My Account
        </button>

        <p className="text-sm text-gray-500 mt-4">
          Didn&apos;t receive the code?{" "}
          <button
            type="button"
            onClick={() => setDigits(Array(CODE_LENGTH).fill(""))}
            className="text-[#B34B20] font-semibold hover:underline"
          >
            Resend Code
          </button>
        </p>
      </div>

      <div className="flex items-center gap-4 mt-6 text-xs text-gray-500">
        <span className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">
          <Lock className="w-3 h-3" /> End-to-End Encrypted
        </span>
        <span className="flex items-center gap-1">
          <HelpCircle className="w-3 h-3" /> Need Help?
        </span>
        <Link href="/login" className="hover:text-[#B34B20]">
          Privacy Policy
        </Link>
      </div>
    </div>
  );
}
