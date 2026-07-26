"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import Sidebar from "../_components/dashboard/Sidebar";
import TopBar from "../_components/dashboard/TopBar";
import { useAuth } from "../../lib/contexts/AuthContext";

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, user, loading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Auth is per-tab sessionStorage now, so the server (middleware) can't check
  // it before the page loads — this client-side guard replaces that check.
  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      router.replace("/admin-login");
    } else if (user?.role !== "admin") {
      router.replace("/dashboard");
    }
  }, [loading, isAuthenticated, user, router]);

  if (loading || !isAuthenticated || user?.role !== "admin") {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FDFBF7] text-gray-400">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#FDFBF7] overflow-hidden">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-auto ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar />
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth">
          {children}
        </main>
      </div>
    </div>
  );
}
