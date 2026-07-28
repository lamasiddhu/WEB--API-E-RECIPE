"use client";

import { useEffect, useState } from "react";
import { Wrench, Loader2 } from "lucide-react";
import { getAppSettings, setMaintenanceMode, clearSystemCache } from "@/lib/composition/api";

const formatRelativeTime = (iso?: string): string => {
  if (!iso) return "Never cleared yet";
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `Last cleared ${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Last cleared ${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `Last cleared ${days} day${days === 1 ? "" : "s"} ago`;
};

export default function MaintenancePanel() {
  const [maintenanceMode, setMaintenanceModeState] = useState(false);
  const [cacheLastClearedAt, setCacheLastClearedAt] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [isTogglingMaintenance, setIsTogglingMaintenance] = useState(false);
  const [isClearingCache, setIsClearingCache] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getAppSettings()
      .then((result) => {
        setMaintenanceModeState(!!result.data?.maintenanceMode);
        setCacheLastClearedAt(result.data?.cacheLastClearedAt);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const handleToggleMaintenance = async () => {
    const next = !maintenanceMode;
    setIsTogglingMaintenance(true);
    setError("");
    try {
      await setMaintenanceMode(next);
      setMaintenanceModeState(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update maintenance mode");
    } finally {
      setIsTogglingMaintenance(false);
    }
  };

  const handleClearCache = async () => {
    setIsClearingCache(true);
    setError("");
    try {
      const result = await clearSystemCache();
      setCacheLastClearedAt(result.data?.cacheLastClearedAt);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to clear cache");
    } finally {
      setIsClearingCache(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center text-[#B34B20]">
          <Wrench className="w-5 h-5" />
        </div>
        <h3 className="font-bold text-gray-900">Maintenance</h3>
      </div>

      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
        <div>
          <p className="text-sm font-semibold text-gray-800">Maintenance Mode</p>
          <p className="text-xs text-gray-500">
            {maintenanceMode
              ? "On. Only admins can log in right now."
              : "Off. Everyone can log in normally."}
          </p>
        </div>
        <button
          onClick={handleToggleMaintenance}
          disabled={isLoading || isTogglingMaintenance}
          className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 disabled:opacity-60 ${
            maintenanceMode ? "bg-[#B34B20]" : "bg-gray-300"
          }`}
        >
          <div
            className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
              maintenanceMode ? "translate-x-6" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-800">System Cache</p>
          <p className="text-xs text-gray-500">
            {isLoading ? "Loading…" : formatRelativeTime(cacheLastClearedAt)}
          </p>
        </div>
        <button
          onClick={handleClearCache}
          disabled={isClearingCache}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold hover:bg-gray-100 disabled:opacity-60 shrink-0"
        >
          {isClearingCache && <Loader2 className="w-3 h-3 animate-spin" />}
          Clear Cache
        </button>
      </div>
      <p className="text-xs text-gray-400 -mt-2">
        The recipe list is kept in memory for up to a minute to speed up browsing. Clearing the
        cache forces the next request to read fresh data straight from the database, which is
        useful right after a bulk change, though normal adds/edits/deletes already do this automatically.
      </p>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
