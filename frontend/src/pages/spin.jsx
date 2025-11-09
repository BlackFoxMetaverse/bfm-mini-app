import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import SpinningWheel from "../components/spinning-wheel";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/header";
import { GlassModal } from "../components/ui/glass-modal";
import { getUserProfile } from "../api/user";
import { Timer } from "../components/timer";
import dayjs from "dayjs";

export default function Spin() {
  const [showGlassModal, setShowGlassModal] = useState(false);
  const [selectedPrize, setSelectedPrize] = useState(null);
  const navigate = useNavigate();

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
    <div className="relative min-h-[100dvh] w-full bg-gradient-to-b from-zinc-900 via-slate-900 to-black font-sans text-white">
      {/* Header */}
      <div className="mb- px-6 pt-6 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="rounded-lg bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
      </div>
      <section className="mx-auto flex h-full min-h-screen w-full max-w-md flex-col items-center justify-between px-6 pt-6">
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
