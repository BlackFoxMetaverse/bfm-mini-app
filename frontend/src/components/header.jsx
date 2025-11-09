import { User, Zap } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useTelegramUser } from "../hooks/useTelegramUser";
import { useAccount } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { getUserProfile } from "../api/user";
import { useDisconnect } from "@reown/appkit/react";
import { useEffect, useState, useRef } from "react";
import CountUp from "react-countup";
import { truncateText } from "../utils/helper";

// Modern coin icon component
const CoinIcon = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 28 28"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="14" cy="14" r="12" fill="#6C63FF" />
    <circle cx="14" cy="14" r="12" fill="url(#coinGradient)" />
    <path
      d="M14 6C9.58 6 6 9.58 6 14C6 18.42 9.58 22 14 22C18.42 22 22 18.42 22 14C22 9.58 18.42 6 14 6ZM14 20C10.69 20 8 17.31 8 14C8 10.69 10.69 8 14 8C17.31 8 20 10.69 20 14C20 17.31 17.31 20 14 20Z"
      fill="white"
      fillOpacity="0.3"
    />
    <path
      d="M15.5 11H14V10C14 9.45 13.55 9 13 9C12.45 9 12 9.45 12 10V11H11.5C10.67 11 10 11.67 10 12.5C10 13.33 10.67 14 11.5 14H13V16H11.5C11.22 16 11 15.78 11 15.5C11 14.95 10.55 14.5 10 14.5C9.45 14.5 9 14.95 9 15.5C9 16.88 10.12 18 11.5 18H12V19C12 19.55 12.45 20 13 20C13.55 20 14 19.55 14 19V18H14.5C15.88 18 17 16.88 17 15.5C17 14.12 15.88 13 14.5 13H13V11H14.5C14.78 11 15 11.22 15 11.5C15 12.05 15.45 12.5 16 12.5C16.55 12.5 17 12.05 17 11.5C17 10.12 15.88 9 14.5 9H14V10H15.5C15.78 10 16 10.22 16 10.5C16 10.78 15.78 11 15.5 11Z"
      fill="white"
    />
    <defs>
      <linearGradient
        id="coinGradient"
        x1="14"
        y1="2"
        x2="14"
        y2="26"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#6C63FF" />
        <stop offset="1" stopColor="#5952d4" />
      </linearGradient>
    </defs>
  </svg>
);

const Header = () => {
  const { user, isLoaded } = useTelegramUser();
  const [displayedPoints, setDisplayedPoints] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const isFirstLoad = useRef(true);
  const navigate = useNavigate();

  // Get wallet information using Wagmi hooks
  useAccount();
  useDisconnect();

  // Format user name
  const displayName =
    isLoaded && user
      ? `${user.first_name}${user.last_name ? ` ${user.last_name}` : ""}`
      : "Guest User";

  // Get a user token
  const { data: profile, isLoading } = useQuery({
    queryKey: ["user-profile"],
    queryFn: getUserProfile,
  });

  // Handle points updates
  useEffect(() => {
    if (profile?.data?.token !== undefined) {
      const currentPoints = profile.data.token;
      const storedPoints = localStorage.getItem("bfm-points");

      if (isFirstLoad.current) {
        // First load - just store and display without animation
        if (storedPoints === null) {
          localStorage.setItem("bfm-points", currentPoints.toString());
        }
        setDisplayedPoints(currentPoints);
        isFirstLoad.current = false;
      } else {
        // Subsequent updates - check if points increased
        const previousPoints = parseInt(storedPoints || "0");

        if (currentPoints > previousPoints) {
          // Points increased - show animation
          setIsAnimating(true);

          // Update localStorage after animation completes
          setTimeout(() => {
            localStorage.setItem("bfm-points", currentPoints.toString());
            setDisplayedPoints(currentPoints);
            setIsAnimating(false);
          }, 2000); // Match animation duration
        } else {
          // Points same or decreased - just update without animation
          setDisplayedPoints(currentPoints);
          localStorage.setItem("bfm-points", currentPoints.toString());
        }
      }
    }
  }, [profile?.data?.token]);

  // Initialize displayed points from localStorage on component mount
  useEffect(() => {
    const storedPoints = localStorage.getItem("bfm-points");
    if (storedPoints) {
      setDisplayedPoints(parseInt(storedPoints));
    }
  }, []);

  // Navigate to profile page
  const handleProfileClick = () => {
    navigate("/profile");
  };

  if (isLoading) {
    return (
      <div className="flex w-full items-center justify-between px-4 py-3">
        <div className="h-8 w-24 animate-pulse rounded-lg bg-white/10"></div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-24 animate-pulse rounded-full bg-white/10"></div>
          <div className="h-10 w-10 animate-pulse rounded-full bg-white/10"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full items-center justify-between px-4 py-3">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <img src="/logo-dark.png" alt="Logo" className="h-8 w-auto" />
      </div>

      {/* User and coins info */}
      <div className="flex items-center gap-3">
        {/* Tokens with enhanced design */}
        <div className="group relative">
          {/* Glow effect on animation */}
          {isAnimating && (
            <div className="absolute -inset-1 animate-pulse rounded-full bg-[#6C63FF]/30 blur-md"></div>
          )}
          
          <div
            className={`relative flex items-center gap-2 rounded-full bg-[#2a2a3e] px-3 py-2 transition-all ${
              isAnimating ? "scale-105" : ""
            }`}
          >
            <CoinIcon />
            <span className="text-base font-bold text-white">
              {isAnimating &&
              profile?.data?.token >
                parseInt(localStorage.getItem("bfm-points") || "0") ? (
                <CountUp
                  start={parseInt(localStorage.getItem("bfm-points") || "0")}
                  end={profile.data.token}
                  duration={2}
                  separator=","
                  onEnd={() => setDisplayedPoints(profile.data.token)}
                />
              ) : (
                displayedPoints.toLocaleString()
              )}
            </span>
            
            {/* Sparkle effect when animating */}
            {isAnimating && (
              <>
                <Zap
                  size={14}
                  className="absolute -right-1 -top-1 animate-ping text-[#6C63FF]"
                />
                <Zap
                  size={14}
                  className="absolute -right-1 -top-1 text-[#6C63FF]"
                />
              </>
            )}
          </div>
        </div>

        {/* User Profile Button */}
        <div className="relative">
          <button
            onClick={handleProfileClick}
            className="group relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[#2a2a3e] transition-all hover:bg-[#3a3a4e] hover:scale-105"
          >
            {/* Hover gradient effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#6C63FF]/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100"></div>
            
            {user?.photo_url ? (
              <img
                src={user.photo_url}
                alt="User"
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <User size={20} className="text-white" />
            )}
          </button>
          
          {/* Online indicator dot */}
          <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#1a1a2e] bg-green-500"></div>
        </div>
      </div>
    </div>
  );
};

export default Header;