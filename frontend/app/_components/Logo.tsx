import { UtensilsCrossed } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "light" | "dark";
  showWordmark?: boolean;
  className?: string;
}

const SIZE_MAP = {
  sm: { box: "w-10 h-10 rounded-xl", icon: "w-5 h-5", text: "text-lg" },
  md: { box: "w-16 h-16 rounded-xl", icon: "w-8 h-8", text: "text-2xl" },
  lg: { box: "w-24 h-24 rounded-2xl", icon: "w-12 h-12", text: "text-3xl" },
};

export default function Logo({ size = "md", variant = "dark", showWordmark = false, className = "" }: LogoProps) {
  const s = SIZE_MAP[size];
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        className={`${s.box} flex items-center justify-center shrink-0 ${
          variant === "light"
            ? "bg-white/10 backdrop-blur-sm border border-white/20"
            : "bg-gradient-to-br from-[#B34B20] to-[#A64B1C]"
        }`}
      >
        <UtensilsCrossed className={`${s.icon} text-white`} />
      </div>
      {showWordmark && (
        <span className={`${s.text} font-bold ${variant === "light" ? "text-white" : "text-[#B34B20]"}`}>
          E-Recipe
        </span>
      )}
    </div>
  );
}
