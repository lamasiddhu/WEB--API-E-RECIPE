"use client";

import { Loader2, Megaphone, Send } from "lucide-react";

interface GlobalAnnouncementFormProps {
  message: string;
  onMessageChange: (message: string) => void;
  pushNotification: boolean;
  onPushNotificationChange: (value: boolean) => void;
  onBroadcast: () => void;
  isBroadcasting?: boolean;
  feedback?: string;
}

export default function GlobalAnnouncementForm({
  message,
  onMessageChange,
  pushNotification,
  onPushNotificationChange,
  onBroadcast,
  isBroadcasting,
  feedback,
}: GlobalAnnouncementFormProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center text-[#B34B20]">
          <Megaphone className="w-5 h-5" />
        </div>
        <h3 className="font-bold text-gray-900">Global Announcements</h3>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
          Broadcast Message
        </label>
        <textarea
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          rows={4}
          placeholder="Type the message that will be displayed to all users upon their next login..."
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#B34B20]/20 focus:border-[#B34B20] transition-all resize-none"
        />
      </div>

      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
        <div>
          <p className="text-sm font-semibold text-gray-800">Push Notification</p>
          <p className="text-xs text-gray-500">Send this as a real-time mobile alert</p>
        </div>
        <button
          onClick={() => onPushNotificationChange(!pushNotification)}
          className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${
            pushNotification ? "bg-[#B34B20]" : "bg-gray-300"
          }`}
        >
          <div
            className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
              pushNotification ? "translate-x-6" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      <button
        onClick={onBroadcast}
        disabled={isBroadcasting || !message.trim()}
        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#B34B20] to-[#A64B1C] text-white font-semibold py-3 rounded-xl hover:from-[#A64B1C] hover:to-[#963D19] transition-all shadow-lg shadow-orange-900/20 disabled:opacity-60"
      >
        {isBroadcasting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Broadcasting...
          </>
        ) : (
          <>
            <Send className="w-4 h-4" /> Broadcast Announcement
          </>
        )}
      </button>
      {feedback && <p className="text-sm text-center text-gray-600">{feedback}</p>}
    </div>
  );
}
