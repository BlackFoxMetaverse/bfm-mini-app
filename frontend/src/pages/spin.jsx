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
    <div className="relative h-[100dvh] min-h-screen w-full bg-gradient-to-b from-zinc-900 via-slate-900 to-black font-sans text-white">
      <section className="mx-auto flex h-full min-h-screen w-full max-w-md flex-col items-center justify-between overflow-y-auto px-6 pt-6">
        <Header />

        {/* Header */}
        <div className="mb-5 mt-6 text-center">
          <h1 className="mb-4 text-7xl font-black leading-[0.85] tracking-tight">
            <span
              className="block"
              style={{
                color: "#42b077",
                textShadow:
                  "0 4px 0px #2d7a54, 0 6px 15px rgba(66, 176, 119, 0.4)",
              }}
            >
              SPIN
            </span>
            <span
              className="my-1 block"
              style={{
                color: "#fff",
                textShadow:
                  "0 4px 0px #666, 0 6px 15px rgba(255, 255, 255, 0.3)",
                transform: "rotate(-3deg)",
                display: "inline-block",
              }}
            >
              TO
            </span>
            <span
              className="block"
              style={{
                color: "#8463ED",
                textShadow:
                  "0 4px 0px #5a3fb3, 0 6px 15px rgba(132, 99, 237, 0.4)",
              }}
            >
              WIN!
            </span>
          </h1>
          <p className="mb-1 text-sm text-gray-400">Your next spin could win</p>
        </div>

        <div className="font-medium uppercase text-white">
          <div className="text-center">next spin in</div>
          <Timer />
        </div>

        <SpinningWheel
          onSpinComplete={handleSpinComplete}
          canSpin={canSpin}
          className="min-h-[570px] px-6 py-6"
        />
      </section>

      {/* Glass Modal */}
      {showGlassModal && selectedPrize && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50">
          <GlassModal
            reward={selectedPrize.text}
            setShowModal={handleGlassModalClose}
          />
        </div>
      )}
    </div>
  );
}
