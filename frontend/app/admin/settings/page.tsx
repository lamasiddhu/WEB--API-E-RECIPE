"use client";

import { useState } from "react";
import GlobalAnnouncementForm from "../../_components/admin/GlobalAnnouncementForm";
import MaintenancePanel from "../../_components/admin/MaintenancePanel";
import { broadcastAnnouncement } from "../../../lib/api/notification";

export default function AdminSettingsPage() {
  const [message, setMessage] = useState("");
  const [pushNotification, setPushNotification] = useState(true);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [feedback, setFeedback] = useState("");

  const handleBroadcast = async () => {
    if (!message.trim()) return;
    setIsBroadcasting(true);
    setFeedback("");
    try {
      await broadcastAnnouncement(message.trim());
      setFeedback("Announcement sent to all users.");
      setMessage("");
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : "Failed to broadcast announcement");
    } finally {
      setIsBroadcasting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Settings</h1>
        <p className="text-gray-500 mt-1">Manage global system configurations and broadcast announcements.</p>
      </div>

      <div className="space-y-6">
        <GlobalAnnouncementForm
          message={message}
          onMessageChange={setMessage}
          pushNotification={pushNotification}
          onPushNotificationChange={setPushNotification}
          onBroadcast={handleBroadcast}
          isBroadcasting={isBroadcasting}
          feedback={feedback}
        />
        <MaintenancePanel />
      </div>
    </div>
  );
}
