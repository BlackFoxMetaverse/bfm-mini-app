import React from "react";
import { createPortal } from "react-dom";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { playCash } from "../../lib/sfx";
import { X } from "lucide-react";
import { Button } from "./button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateSpinResult } from "../../api/token";

const LOTTIE_SRC =
  "https://lottie.host/8f3b915e-b941-432a-a376-c83d871752df/Wee16GNEPX.lottie";
const WINNING_SOUND_SRC = "/popup.mp3";

export function GlassModal({
  reward,
  setShowModal,
  // optional props with sensible defaults:
  showFullPagePooper = true,
  pooperOpacity = 0.6,
  // supply a string like '200vw' or object { width: '200vw', height: '200vh' }
  pooperSize = { width: "200vw", height: "200vh" },
  respectReducedMotion = true,
}) {
  const queryClient = useQueryClient();
  const audioRef = React.useRef(null);

  // prefer reduced motion when requested (can be turned off by passing respectReducedMotion=false)
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const playAnimations = !respectsReduce(
    prefersReducedMotion,
    respectReducedMotion,
  );

  function respectsReduce(prefersReducedMotionFlag, respectFlag) {
    return respectFlag && prefersReducedMotionFlag;
  }

  // Play sound when component mounts (when poopers explode)
  React.useEffect(() => {
    if (audioRef.current && playAnimations) {
      // Set volume and play
      audioRef.current.volume = 0.5; // Adjust volume as needed
      const playPromise = audioRef.current.play();

      // Handle potential autoplay restrictions
      if (playPromise !== undefined) {
        playPromise.catch((error) => {});
      }
    }
  }, [playAnimations]);

  const { mutate, isPending, isSuccess, isError } = useMutation({
    mutationFn: (token) => updateSpinResult(token),
    onSuccess: () => {
      // play on any token increase
      playCash();
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      setShowModal(false);
    },
    onError: (error) => {
      console.error("❌ Error claiming reward:", error);
    },
  });

  const handleClaim = () => {
    if (!isPending && !isSuccess) {
      // Clamp spin reward to [100,500] before sending to backend
      const clampedReward = Math.min(Math.max(Number(reward), 100), 500);
      mutate(clampedReward);
    }
  };

  const handleClose = () => {
    if (isSuccess) {
      setShowModal(false);
    } else {
      alert("Please claim your reward before closing!");
    }
  };

  // Portal setup (client-only)
  const [portalEl, setPortalEl] = React.useState(null);
  React.useEffect(() => {
    if (typeof document === "undefined") return;
    const el = document.createElement("div");
    el.setAttribute("id", "glass-modal-pooper-portal");
    document.body.appendChild(el);
    setPortalEl(el);
    return () => {
      if (document.body.contains(el)) {
        document.body.removeChild(el);
      }
    };
  }, []);

  // normalize size
  const sizeStyle =
    typeof pooperSize === "string"
      ? { width: pooperSize, height: pooperSize }
      : {
          width: pooperSize.width || "200vw",
          height: pooperSize.height || "200vh",
        };

  // portal node rendering — autoplay controlled by prefers-reduced-motion, but loop is disabled so it plays once
  const pooperPortal =
    portalEl && showFullPagePooper
      ? createPortal(
          <div
            aria-hidden="true"
            style={{
              position: "fixed",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              pointerEvents: "none",
              zIndex: 40, // behind modal (modal uses z-50)
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: pooperOpacity,
              ...sizeStyle,
            }}
          >
            <div style={{ width: "100%", height: "100%", overflow: "visible" }}>
              <DotLottieReact
                src={LOTTIE_SRC}
                autoplay={playAnimations}
                loop={false} // <- changed: no looping, plays one time
                style={{ width: "100%", height: "100%" }}
              />
            </div>
          </div>,
          portalEl,
        )
      : null;

  return (
    <>
      {/* Audio element for winning sound */}
      <audio
        ref={audioRef}
        src={WINNING_SOUND_SRC}
        preload="auto"
        style={{ display: "none" }}
      />

      {pooperPortal}

      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-6">
        <div className="bg-neutral-white/20 relative mx-auto max-h-[90vh] w-full max-w-xs overflow-y-auto rounded-lg border border-white/10 px-4 py-6 text-white shadow-xl backdrop-blur-xl">
          {/* Close Icon */}
          <div
            onClick={handleClose}
            className={`absolute right-3 top-3 cursor-pointer rounded-full p-1 transition-colors hover:bg-white/10 ${!isSuccess ? "opacity-50" : ""}`}
          >
            <X className="text-white" size={18} />
          </div>

          <div className="space-y-4">
            {/* Title Section */}
            <div className="space-y-1 pt-4 text-center">
              <div className="text-3xl font-bold uppercase">Bravo!</div>
              <div className="text-lg font-semibold uppercase">
                Congratulations!
              </div>
              <div className="text-sm font-medium">You Won</div>
            </div>

            {/* Prize Section */}
            <div className="space-y-3 text-center">
              <div className="flex justify-center">
                <div className="relative">
                  {/* Outer gray ring */}
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/70 shadow-lg">
                    {/* Middle white ring */}
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white">
                      {/* Inner black circle with logo */}
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black">
                        <img
                          src="/logo-dark.png"
                          alt="Logo"
                          className="h-8 w-8"
                        />
                      </div>
                    </div>
                  </div>
                  {/* Glow effect */}
                  <div className="absolute inset-0 -z-10 rounded-full bg-white/30 blur-xl"></div>
                </div>
              </div>
              <div className="text-4xl font-bold">{reward}</div>
            </div>

            {/* Description */}
            <div className="px-2 text-center text-xs uppercase leading-relaxed">
              The points will reflect in your wallet when you claim them
            </div>

            {/* Button Section */}
            <div className="pt-2">
              <Button
                onClick={handleClaim}
                disabled={isPending || isSuccess}
                className="w-full bg-white px-4 py-3 text-sm font-semibold uppercase text-black transition-all duration-200 hover:bg-gray-100 disabled:opacity-50"
              >
                {isPending
                  ? "Claiming..."
                  : isSuccess
                    ? "Claimed!"
                    : "Claim Reward"}
              </Button>
            </div>

            {/* Error Message */}
            {isError && (
              <p className="rounded bg-red-500/10 p-2 text-center text-xs text-red-400">
                ❌ Something went wrong. Please try again.
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
