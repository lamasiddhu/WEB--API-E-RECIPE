"use client";

import { FormEvent, useState } from "react";
import { X, Lock, Eye, EyeOff, Globe, ShieldCheck } from "lucide-react";
import { changeMyPassword, updateMe } from "@/lib/composition/api";

interface SecurityPrivacyModalProps {
  currentIsProfilePublic?: boolean;
  onClose: () => void;
  onPrivacySaved: (isProfilePublic: boolean) => void;
}

export default function SecurityPrivacyModal({ currentIsProfilePublic = true, onClose, onPrivacySaved }: SecurityPrivacyModalProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const [isProfilePublic, setIsProfilePublic] = useState(currentIsProfilePublic);
  const [isSavingPrivacy, setIsSavingPrivacy] = useState(false);
  const [privacyError, setPrivacyError] = useState("");

  const handleChangePassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess(false);

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation don't match.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }

    setIsChangingPassword(true);
    try {
      await changeMyPassword({ currentPassword, newPassword });
      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : "Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleTogglePrivacy = async () => {
    const next = !isProfilePublic;
    setIsSavingPrivacy(true);
    setPrivacyError("");
    try {
      await updateMe({ isProfilePublic: next });
      setIsProfilePublic(next);
      onPrivacySaved(next);
    } catch (err) {
      setPrivacyError(err instanceof Error ? err.message : "Failed to update privacy setting");
    } finally {
      setIsSavingPrivacy(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Security & Privacy</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Change Password */}
        <div className="mb-6">
          <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#B34B20]" /> Change Password
          </h4>
          <form onSubmit={handleChangePassword} className="space-y-3">
            <div className="relative">
              <input
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                type={showPasswords ? "text" : "password"}
                placeholder="Current password"
                required
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#B34B20]/20 focus:border-[#B34B20]"
              />
            </div>
            <div className="relative">
              <input
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                type={showPasswords ? "text" : "password"}
                placeholder="New password (min. 8 characters)"
                required
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#B34B20]/20 focus:border-[#B34B20]"
              />
            </div>
            <div className="relative">
              <input
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                type={showPasswords ? "text" : "password"}
                placeholder="Confirm new password"
                required
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#B34B20]/20 focus:border-[#B34B20]"
              />
              <button
                type="button"
                onClick={() => setShowPasswords(!showPasswords)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
            {passwordSuccess && (
              <p className="text-sm text-green-600 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> Password changed successfully.
              </p>
            )}

            <button
              type="submit"
              disabled={isChangingPassword}
              className="w-full py-2.5 bg-[#B34B20] text-white rounded-xl text-sm font-semibold hover:bg-[#A64B1C] disabled:opacity-60"
            >
              {isChangingPassword ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>

        {/* Profile visibility */}
        <div className="pt-5 border-t border-gray-100">
          <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#B34B20]" /> Data & Privacy
          </h4>
          <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">Public Profile</p>
              <p className="text-xs text-gray-500">Let other chefs see your profile and shared recipes.</p>
            </div>
            <button
              type="button"
              onClick={handleTogglePrivacy}
              disabled={isSavingPrivacy}
              className={`w-11 h-6 rounded-full p-1 transition-colors duration-300 shrink-0 ${isProfilePublic ? "bg-[#B34B20]" : "bg-gray-300"}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${isProfilePublic ? "translate-x-5" : "translate-x-0"}`} />
            </button>
          </div>
          {privacyError && <p className="text-sm text-red-600 mt-2">{privacyError}</p>}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full mt-6 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50"
        >
          Close
        </button>
      </div>
    </div>
  );
}
