"use client";

import { useState } from "react";
import { X, Bell } from "lucide-react";
import { updateMe, NotificationPreferencesInput } from "../../../lib/api/auth";

interface NotificationsModalProps {
  currentPreferences?: NotificationPreferencesInput;
  onClose: () => void;
  onSaved: (preferences: NotificationPreferencesInput) => void;
}

export default function NotificationsModal({ currentPreferences, onClose, onSaved }: NotificationsModalProps) {
  const [enabled, setEnabled] = useState(currentPreferences?.push !== false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setIsSaving(true);
    setError("");
    try {
      await updateMe({ notificationPreferences: { push: enabled } });
      onSaved({ push: enabled });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save notification preferences");
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-4 py-2">
          <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
            <Bell className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900">Notifications</p>
            <p className="text-xs text-gray-500">Turn the notification bell on or off.</p>
          </div>
          <button
            type="button"
            onClick={() => setEnabled((prev) => !prev)}
            className={`w-11 h-6 rounded-full p-1 transition-colors duration-300 shrink-0 ${enabled ? "bg-[#B34B20]" : "bg-gray-300"}`}
          >
            <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${enabled ? "translate-x-5" : "translate-x-0"}`} />
          </button>
        </div>

        {error && <p className="text-sm text-red-600 mt-3">{error}</p>}

        <div className="flex gap-3 pt-5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 py-2.5 bg-[#B34B20] text-white rounded-xl text-sm font-semibold hover:bg-[#A64B1C] disabled:opacity-60"
          >
            {isSaving ? "Saving..." : "Save Preferences"}
          </button>
        </div>
      </div>
    </div>
  );
}
