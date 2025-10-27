import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import SpinningWheel from "../components/spinning-wheel";
import { Link } from "react-router-dom";
import Header from "../components/header";
import { GlassModal } from "../components/ui/glass-modal";
import { getUserProfile } from "../api/user";
import { Timer } from "../components/timer";
import dayjs from "dayjs";

export default function Spin() {
  const [showGlassModal, setShowGlassModal] = useState(false);
  const [selectedPrize, setSelectedPrize] = useState(null);

  // Check if user can spin
  const { data: profileData, isLoading: loadingProfile } = useQuery({
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

  const handleSpinComplete = (prize) => {
    // Show the glass modal with the prize
    setSelectedPrize(prize);
    setShowGlassModal(true);
  };

  const handleGlassModalClose = () => {
    setShowGlassModal(false);
    setSelectedPrize(null);
  };

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-brandblue">
      <section className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-start gap-3 space-y-3 bg-brandblue px-4 py-4">
        <Header />

        <div className="space-y-4">
          <div className="text-center text-lg font-bold uppercase text-white">
            Let's see what you can get
          </div>
          <div className="text-center text-sm font-medium uppercase text-white">
            Get unexpected prizes which will benefit your future
          </div>
        </div>

        <div className="font-medium uppercase text-white">
          <div className="text-center">next spin in</div>
          <Timer />
        </div>

        <SpinningWheel onSpinComplete={handleSpinComplete} canSpin={canSpin} />
      </section>

      {/* Glass Modal */}
      {showGlassModal && selectedPrize && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50">
          <GlassModal reward={selectedPrize.text} setShowModal={handleGlassModalClose} />
        </div>
      )}
    </div>
  );
}
