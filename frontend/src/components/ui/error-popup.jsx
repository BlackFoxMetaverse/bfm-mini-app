import { useEffect, useState } from "react";
import { X, AlertCircle } from "lucide-react";

const ErrorPopup = ({
  isOpen,
  onClose,
  title = "Error",
  message,
  duration = 3000,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // Add a small delay before showing to ensure smooth entrance
      const showTimer = setTimeout(() => {
        setIsVisible(true);
      }, 100);

      // Auto close after duration
      if (duration > 0) {
        const closeTimer = setTimeout(() => {
          handleClose();
        }, duration);

        return () => {
          clearTimeout(showTimer);
          clearTimeout(closeTimer);
        };
      }

      return () => clearTimeout(showTimer);
    } else {
      setIsVisible(false);
      // Delay unmounting to allow exit animation
      const unmountTimer = setTimeout(() => {
        setShouldRender(false);
      }, 5000);
      return () => clearTimeout(unmountTimer);
    }
  }, [isOpen, duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 5000); // Wait for very slow evaporating animation to complete
  };

  if (!shouldRender) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-center p-4">
      {/* Popup - Slides down from top with evaporating effect */}
      <div
        className={`duration-[5000ms] relative w-full max-w-xs transform transition-all ease-in-out ${
          isVisible
            ? "translate-y-0 scale-100 opacity-100"
            : "-translate-y-full scale-90 opacity-0"
        }`}
      >
        <div className="relative overflow-hidden rounded-xl border border-red-300/30 bg-gradient-to-br from-red-400/50 to-pink-500/50 shadow-2xl backdrop-blur-xl">
          {/* Animated background pattern with more vibrancy */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-300/20 to-pink-400/20">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.15),transparent_60%)]" />
            <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,rgba(255,255,255,0.08),transparent,rgba(255,255,255,0.08))]" />
          </div>

          {/* Content */}
          <div className="relative p-4">
            {/* Header */}
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-300/30 backdrop-blur-sm">
                  <AlertCircle className="h-4 w-4 text-red-50" />
                </div>
                <h3 className="text-base font-bold text-white/90">{title}</h3>
              </div>

              <button
                onClick={handleClose}
                className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-white/80 backdrop-blur-sm transition-all duration-200 hover:bg-white/30 hover:text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </div>

            {/* Message */}
            <div className="mb-3">
              <p className="text-sm leading-relaxed text-white/80">{message}</p>
            </div>

            {/* Action Button */}
            <button
              onClick={handleClose}
              className="w-full rounded-lg bg-white/20 px-3 py-2 text-sm font-semibold text-white/90 backdrop-blur-sm transition-all duration-200 hover:scale-[1.02] hover:bg-white/30 active:scale-[0.98]"
            >
              Got it
            </button>
          </div>

          {/* Bottom accent with shimmer effect */}
          <div className="h-0.5 bg-gradient-to-r from-red-300/60 via-pink-400/60 to-red-300/60" />
        </div>
      </div>
    </div>
  );
};

export default ErrorPopup;
