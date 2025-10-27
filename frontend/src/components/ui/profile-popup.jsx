import { X, User, Mail, Phone, Wallet } from "lucide-react";

export function ProfilePopup({ isOpen, onClose, profile, user }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-neutral-white/20 relative w-full max-w-sm mx-auto rounded-xl border border-white/10 px-4 py-3 text-white shadow-xl backdrop-blur-xl max-h-fit">
        {/* Close Icon */}
        <div
          onClick={onClose}
          className="absolute right-3 top-3 cursor-pointer hover:bg-white/10 rounded-full p-1 transition-colors z-10"
        >
          <X className="text-white" size={18} />
        </div>

        <div className="space-y-3">
          {/* Profile Picture and Title */}
          <div className="text-center pt-1">
            <div className="flex justify-center mb-2">
              <div className="w-14 h-14 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center overflow-hidden">
                {user?.photo_url ? (
                  <img
                    src={user.photo_url}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User size={24} className="text-white/70" />
                )}
              </div>
            </div>
            <h2 className="text-base font-bold uppercase">Profile</h2>
          </div>

          {/* Profile Information */}
          <div className="space-y-2.5">
            {/* Name */}
            <div className="flex items-center gap-3 p-2 rounded-lg bg-white/5 border border-white/10">
              <User size={16} className="text-white/70 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-white/60 uppercase mb-1">Name</div>
                <div className="text-sm font-medium text-white truncate">
                  {profile?.data?.telegramFirstName && profile?.data?.telegramLastName 
                    ? `${profile.data.telegramFirstName} ${profile.data.telegramLastName}`
                    : profile?.data?.telegramFirstName 
                    ? profile.data.telegramFirstName
                    : user?.first_name && user?.last_name
                    ? `${user.first_name} ${user.last_name}`
                    : user?.first_name
                    ? user.first_name
                    : "Guest User"}
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center gap-3 p-2 rounded-lg bg-white/5 border border-white/10">
              <Mail size={16} className="text-white/70 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-white/60 uppercase mb-1">Email</div>
                <div className="text-sm font-medium text-white truncate">
                  {profile?.data?.email || "Not provided"}
                </div>
              </div>
            </div>

            {/* Contact Number */}
            <div className="flex items-center gap-3 p-2 rounded-lg bg-white/5 border border-white/10">
              <Phone size={16} className="text-white/70 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-white/60 uppercase mb-1">Contact</div>
                <div className="text-sm font-medium text-white truncate">
                  {profile?.data?.phoneNumber || "Not provided"}
                </div>
              </div>
            </div>

            {/* Wallet Address */}
            <div className="flex items-center gap-3 p-2 rounded-lg bg-white/5 border border-white/10">
              <Wallet size={16} className="text-white/70 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-white/60 uppercase mb-1">Wallet</div>
                <div className="text-sm font-medium text-white truncate">
                  {profile?.data?.walletConnected && profile?.data?.walletAddress
                    ? `${profile.data.walletAddress.slice(0, 6)}...${profile.data.walletAddress.slice(-4)}`
                    : "Not connected"}
                </div>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-2.5">
            <div className="text-xs text-yellow-200/90 text-center leading-relaxed">
              <strong>Disclaimer:</strong> You can redeem your Read Points for Read Tokens at the time of official launch event.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}