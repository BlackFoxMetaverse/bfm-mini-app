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
          <div className="bg-neutral-white/20 relative mx-auto w-full max-w-md overflow-hidden rounded-lg border border-white/10 px-4 py-6 text-white shadow-xl backdrop-blur-xl">
            <div
              onClick={onClose}
              className="absolute right-3 top-3 cursor-pointer rounded-full p-1 transition-colors hover:bg-white/10"
            >
              <X className="text-white" size={18} />
            </div>

            <div className="space-y-1 pt-4 text-center">
              <div className="text-2xl font-bold uppercase text-white">
                SPIN
              </div>
              <div className="text-lg font-bold uppercase text-white">
                & EARN
              </div>
            </div>

            <div className="px-2 text-center text-sm font-medium uppercase leading-relaxed text-white/90">
              SPIN THE WHEEL & EARN
              <br />
              YOURSELF BONUS POINTS
            </div>

            <div className="scale-75">
              <SpinningWheel
                onSpinComplete={handleSpinComplete}
                canSpin={canSpin}
                className="-mt-8 min-h-[500px]"
              />
            </div>
          </div>
        </div>
      )}

      {/* Glass Modal */}
      {showGlassModal && selectedPrize && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50">
          <GlassModal
            reward={selectedPrize.text}
            setShowModal={handleGlassModalClose}
          />
        </div>
      )}
    </>
  );
}
