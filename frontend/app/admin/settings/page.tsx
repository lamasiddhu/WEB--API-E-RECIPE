"use client";

import { useEffect, useState } from "react";
import GlobalAnnouncementForm from "../../_components/admin/GlobalAnnouncementForm";
import MaintenancePanel from "../../_components/admin/MaintenancePanel";
import { broadcastAnnouncement, getAllUsers, sendPersonalNotification, AdminUser } from "@/lib/composition/api";

export default function AdminSettingsPage() {
  const [message, setMessage] = useState("");
  const [pushNotification, setPushNotification] = useState(true);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [recipientId, setRecipientId] = useState("");
  const [personalMessage, setPersonalMessage] = useState("");
  const [isSendingPersonal, setIsSendingPersonal] = useState(false);

  useEffect(() => {
    getAllUsers({ page: 1, limit: 100 })
      .then((result) => setUsers((result.data || []).filter((member: AdminUser) => member.role === "user")))
      .catch(() => setUsers([]));
  }, []);

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

  const handlePersonal = async () => {
    if (!recipientId || !personalMessage.trim()) return;
    setIsSendingPersonal(true);
    setFeedback("");
    try {
      await sendPersonalNotification(recipientId, personalMessage.trim());
      setFeedback("Personal notification sent from E-RECIPE.");
      setPersonalMessage("");
      setRecipientId("");
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : "Failed to send notification");
    } finally {
      setIsSendingPersonal(false);
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
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <div>
            <h3 className="font-bold text-gray-900">Send to one user</h3>
            <p className="text-sm text-gray-500">The sender will appear as E-RECIPE.</p>
          </div>
          <select value={recipientId} onChange={(event) => setRecipientId(event.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl">
            <option value="">Select a user</option>
            {users.map((member) => (
              <option key={member._id} value={member._id}>{member.fullName} — {member.email}</option>
            ))}
          </select>
          <textarea value={personalMessage} onChange={(event) => setPersonalMessage(event.target.value)} rows={4} placeholder="Write a personal notification..." className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl resize-none" />
          <button onClick={handlePersonal} disabled={!recipientId || !personalMessage.trim() || isSendingPersonal} className="w-full bg-[#B34B20] text-white font-semibold py-3 rounded-xl disabled:opacity-60">
            {isSendingPersonal ? "Sending..." : "Send from E-RECIPE"}
          </button>
        </div>
        <MaintenancePanel />
      </div>
    </div>
  );
}
