"use client";

import { useState } from "react";
import { Calendar, Edit } from "lucide-react";
import { useAuth } from "../../../lib/contexts/AuthContext";
import { resolveAssetUrl } from "@/lib/composition/api";
import EditProfileModal from "./EditProfileModal";

export default function ProfileHeader() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const fullName = user?.fullName || "Chef de Cuisine";
  const avatarUrl = user?.avatarUrl;
  const joinedLabel = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : null;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50"></div>

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className="relative group cursor-pointer" onClick={() => setIsEditing(true)}>
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={resolveAssetUrl(avatarUrl)} alt={fullName} className="w-24 h-24 rounded-full object-cover shadow-lg" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#B34B20] to-[#A64B1C] flex items-center justify-center text-white text-3xl font-bold shadow-lg">
              {fullName.charAt(0)}
            </div>
          )}
          <div className="absolute bottom-0 right-0 bg-[#B34B20] text-white p-2 rounded-full border-4 border-white shadow-md hover:bg-[#963D19] transition-colors">
            <Edit className="w-4 h-4" />
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-gray-900">{fullName}</h1>
            {user?.isPro ? (
              <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                <span className="w-2 h-2 bg-amber-500 rounded-full"></span> Pro Member
              </span>
            ) : (
              <span className="bg-gray-100 text-gray-500 text-xs font-bold px-2 py-1 rounded-full">
                Free Account
              </span>
            )}
          </div>

          {user?.bio ? (
            <p className="text-gray-600 mb-4 max-w-xl italic">&quot;{user.bio}&quot;</p>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="text-gray-400 mb-4 max-w-xl italic text-sm hover:text-[#B34B20] transition-colors text-left"
            >
              No bio yet. Click to add one.
            </button>
          )}

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            {joinedLabel && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-[#B34B20]" />
                Joined {joinedLabel}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 mt-4 md:mt-0">
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#B34B20] text-white rounded-xl font-semibold hover:bg-[#A64B1C] transition-colors shadow-md shadow-orange-900/10"
          >
            <Edit className="w-4 h-4" /> Edit Profile
          </button>
        </div>
      </div>

      {isEditing && (
        <EditProfileModal
          currentName={fullName}
          currentAvatarUrl={avatarUrl}
          currentBio={user?.bio}
          onClose={() => setIsEditing(false)}
          onSaved={(data) => updateUser(data)}
        />
      )}
    </div>
  );
}
