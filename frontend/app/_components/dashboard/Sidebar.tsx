"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, UtensilsCrossed, ShoppingBasket, History, User, Users, LayoutGrid, Package, Settings, LogOut, BookOpen, Heart, BookMarked, Sparkles } from "lucide-react";
import { useAuth } from "../../../lib/contexts/AuthContext";
import { resolveAssetUrl } from "../../../lib/api/axios-instance";
import AiAssistantPanel from "./AiAssistantPanel";

const MENU_ITEMS = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { name: "Recipes", icon: UtensilsCrossed, href: "/search" },
  { name: "Shopping List", icon: ShoppingBasket, href: "/shopping-list" },
  { name: "Your Recipes", icon: BookMarked, href: "/my-recipes" },
  { name: "Favorites", icon: Heart, href: "/favorites" },
  { name: "History", icon: History, href: "/history" },
  { name: "Profile", icon: User, href: "/profile" },
  { name: "Cockpit", icon: LayoutGrid, href: "/admin" },
  { name: "Recipe Library", icon: BookOpen, href: "/admin/recipes" },
  { name: "Users", icon: Users, href: "/admin/users" },
  { name: "Orders", icon: Package, href: "/admin/orders" },
  { name: "Settings", icon: Settings, href: "/admin/settings" },
];

const ADMIN_ONLY_ITEMS = new Set(["Cockpit", "Recipe Library", "Users", "Orders", "Settings"]);

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const isAdmin = user?.role === "admin";
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
  // Always show the full menu for the user's role — the item set must stay
  // identical across every page so the sidebar never visibly changes on navigation.
  const menuItems = MENU_ITEMS.filter((item) => !ADMIN_ONLY_ITEMS.has(item.name) || isAdmin);

  return (
    <div className="flex flex-col h-full dark:bg-gray-900">
      <div className="p-6 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2 text-[#B34B20]">
          <UtensilsCrossed className="w-8 h-8" />
          <span className="text-xl font-bold tracking-tight">E-Recipe</span>
        </div>
      </div>

      <div className="p-6 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          {user?.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={resolveAssetUrl(user.avatarUrl)} alt={user.fullName} className="w-10 h-10 rounded-full object-cover shrink-0" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#B34B20] to-[#A64B1C] flex items-center justify-center text-white font-bold shrink-0">
              {user?.fullName?.charAt(0) || "C"}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.fullName || "Chef de Cuisine"}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{isAdmin ? "Admin Panel" : "Home Chef"}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? "bg-[#B34B20] text-white shadow-md shadow-orange-900/10" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"}`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? "text-white" : "text-gray-400"}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-gray-100 dark:border-gray-800">
        <button
          onClick={() => setIsAiPanelOpen(true)}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-[#B34B20] bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
        >
          <Sparkles className="w-5 h-5" /> Ask AI
        </button>
      </div>

      <div className="p-4 border-t border-gray-100 dark:border-gray-800">
        <button onClick={logout} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
          <LogOut className="w-5 h-5" /> Sign Out
        </button>
      </div>

      <AiAssistantPanel isOpen={isAiPanelOpen} onClose={() => setIsAiPanelOpen(false)} />
    </div>
  );
}
