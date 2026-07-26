"use client";

import { useState } from "react";
import { User, Bell, Shield, Globe, Sun, Moon, ChevronRight, LogOut } from "lucide-react";
import { useAuth } from "../../../lib/contexts/AuthContext";
import { useTheme } from "../../../lib/contexts/ThemeContext";
import AccountInfoModal from "./AccountInfoModal";
import NotificationsModal from "./NotificationsModal";
import SecurityPrivacyModal from "./SecurityPrivacyModal";

type OpenPanel = "account" | "notifications" | "security" | null;

export default function AccountSettings() {
  const { user, logout, updateUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === "dark";
  const [openPanel, setOpenPanel] = useState<OpenPanel>(null);

  const settingsItems: { key: OpenPanel; icon: typeof User; title: string; desc: string }[] = [
    { key: "account", icon: User, title: "Account Information", desc: "Update your email, phone, and name." },
    { key: "notifications", icon: Bell, title: "Notifications", desc: "Turn the notification bell on or off." },
    { key: "security", icon: Shield, title: "Security & Privacy", desc: "Password and data preferences." },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
      <div className="p-6 border-b border-gray-100 dark:border-gray-800">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Account Settings</h2>
      </div>

      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {settingsItems.map((item) => (
          <button
            key={item.key}
            onClick={() => setOpenPanel(item.key)}
            className="w-full p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer flex items-center gap-4 group text-left"
          >
            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 group-hover:bg-[#B34B20]/10 group-hover:text-[#B34B20] transition-colors">
              <item.icon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white">{item.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#B34B20] transition-colors" />
          </button>
        ))}

        <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300">
            <Globe className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white">Language & Theme</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">English (US) • {isDarkMode ? "Dark Mode Active" : "Light Mode Active"}</p>
          </div>
          <div className="flex items-center gap-2">
            <Sun className={`w-4 h-4 ${!isDarkMode ? "text-[#B34B20]" : "text-gray-400"}`} />
            <button
              onClick={toggleTheme}
              className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${isDarkMode ? "bg-[#B34B20]" : "bg-gray-300"}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${isDarkMode ? "translate-x-6" : "translate-x-0"}`}></div>
            </button>
            <Moon className={`w-4 h-4 ${isDarkMode ? "text-[#B34B20]" : "text-gray-400"}`} />
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full p-4 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer flex items-center gap-4 group text-left"
        >
          <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-600">
            <LogOut className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-red-600">Sign Out</h3>
            <p className="text-sm text-red-400">Sign out from all devices</p>
          </div>
        </button>
      </div>

      {openPanel === "account" && (
        <AccountInfoModal
          currentName={user?.fullName || ""}
          currentEmail={user?.email || ""}
          currentPhone={user?.phone}
          onClose={() => setOpenPanel(null)}
          onSaved={(data) => updateUser(data)}
        />
      )}

      {openPanel === "notifications" && (
        <NotificationsModal
          currentPreferences={user?.notificationPreferences}
          onClose={() => setOpenPanel(null)}
          onSaved={(preferences) =>
            updateUser({
              notificationPreferences: {
                email: true,
                push: true,
                recipeRecommendations: true,
                weeklyDigest: false,
                ...user?.notificationPreferences,
                ...preferences,
              },
            })
          }
        />
      )}

      {openPanel === "security" && (
        <SecurityPrivacyModal
          currentIsProfilePublic={user?.isProfilePublic}
          onClose={() => setOpenPanel(null)}
          onPrivacySaved={(isProfilePublic) => updateUser({ isProfilePublic })}
        />
      )}
    </div>
  );
}
