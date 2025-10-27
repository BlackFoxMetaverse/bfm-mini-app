import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import SpinningWheel from "../spinning-wheel";
import { GlassModal } from "./glass-modal";
import { getUserProfile } from "../../api/user";
import dayjs from "dayjs";

export function SpinModal({ isOpen, onClose }) {
  const [selectedPrize, setSelectedPrize] = useState(null);
  const [showGlassModal, setShowGlassModal] = useState(false);

  // Check if user can spin
  const { data: profileData } = useQuery({
    queryKey: ["user-profile"],
    queryFn: getUserProfile,
    retry: false,
  });

  // Determine if user can spin
  const isLoggedIn = !!profileData?.data;
  const lastSpin = profileData?.data?.lastSpinAt
    ? dayjs(profileData.data.lastSpinAt)
    : null;
  const nextSpinTime = lastSpin?.add(24, "hour");
  const now = dayjs();
  const canSpin = isLoggedIn && (!lastSpin || now.isAfter(nextSpinTime));

  if (!isOpen && !showGlassModal) return null;

  const handleSpinComplete = (prize) => {
    // Close the spin modal first
    onClose();
    
    // Then show the glass modal with the prize
    setSelectedPrize(prize);
    setShowGlassModal(true);
  };

  const handleGlassModalClose = () => {
    setShowGlassModal(false);
    setSelectedPrize(null);
  };

  return (
    <>
      {/* Spin Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-6">
          <div className="bg-neutral-white/20 relative w-full max-w-xs mx-auto rounded-lg border border-white/10 px-4 py-6 text-white shadow-xl backdrop-blur-xl overflow-hidden">
            {/* Close Icon */}
            <div
              onClick={onClose}
              className="absolute right-3 top-3 cursor-pointer hover:bg-white/10 rounded-full p-1 transition-colors"
            >
              <X className="text-white" size={18} />
            </div>

            <div className="space-y-3">
              {/* Title Section */}
              <div className="text-center space-y-1 pt-4">
                <div className="text-2xl font-bold uppercase text-white">SPIN</div>
                <div className="text-lg font-bold uppercase text-white">& EARN</div>
              </div>

              {/* Subtitle */}
              <div className="text-center text-sm font-medium uppercase text-white/90 px-2 leading-relaxed">
                SPIN THE WHEEL & EARN
                <br />
                YOURSELF BONUS POINTS
              </div>

              {/* Spinning Wheel Visual */}
              <div className="flex justify-center">
                <div className="scale-75 -my-8">
                  <SpinningWheel onSpinComplete={handleSpinComplete} canSpin={canSpin} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Glass Modal */}
      {showGlassModal && selectedPrize && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50">
          <GlassModal reward={selectedPrize.text} setShowModal={handleGlassModalClose} />
        </div>
      )}
    </>
  );
}
