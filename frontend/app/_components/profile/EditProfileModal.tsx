"use client";

import { FormEvent, useState } from "react";
import { X, Camera } from "lucide-react";
import { uploadFile } from "../../../lib/api/upload";
import { updateMe } from "../../../lib/api/auth";
import { resolveAssetUrl } from "../../../lib/api/axios-instance";

interface EditProfileModalProps {
  currentName: string;
  currentAvatarUrl?: string;
  currentBio?: string;
  onClose: () => void;
  onSaved: (data: { fullName: string; avatarUrl?: string; bio?: string }) => void;
}

export default function EditProfileModal({ currentName, currentAvatarUrl, currentBio, onClose, onSaved }: EditProfileModalProps) {
  const [fullName, setFullName] = useState(currentName);
  const [bio, setBio] = useState(currentBio || "");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(resolveAssetUrl(currentAvatarUrl));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");
    try {
      let avatarUrl = currentAvatarUrl;
      if (file) {
        const uploaded = await uploadFile(file);
        avatarUrl = uploaded.url;
      }
      await updateMe({ fullName, avatarUrl, bio });
      onSaved({ fullName, avatarUrl, bio });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Edit Profile</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex justify-center">
            <label className="relative cursor-pointer group">
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewUrl} alt="Avatar preview" className="w-20 h-20 rounded-full object-cover" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#B34B20] to-[#A64B1C] flex items-center justify-center text-white text-2xl font-bold">
                  {fullName.charAt(0) || "C"}
                </div>
              )}
              <div className="absolute bottom-0 right-0 bg-[#B34B20] text-white p-1.5 rounded-full border-2 border-white group-hover:bg-[#963D19]">
                <Camera className="w-3.5 h-3.5" />
              </div>
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
              Full Name
            </label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#B34B20]/20 focus:border-[#B34B20]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={280}
              rows={3}
              placeholder="Tell others a bit about yourself..."
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#B34B20]/20 focus:border-[#B34B20] resize-none"
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{bio.length}/280</p>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 py-2.5 bg-[#B34B20] text-white rounded-xl text-sm font-semibold hover:bg-[#A64B1C] disabled:opacity-60"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
