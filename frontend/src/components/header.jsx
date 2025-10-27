import { User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useTelegramUser } from "../hooks/useTelegramUser";
import { useAccount } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { getUserProfile } from "../api/user";
import { useDisconnect } from "@reown/appkit/react";
import { useEffect, useState, useRef } from "react";
import CountUp from "react-countup";
import { truncateText } from "../utils/helper";

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
    return <p>Loading...</p>;
  }

  return (
    <div className="flex w-full items-center justify-between px-2 pt-2">
      {/* Logo */}
      <img src="/logo-dark.png" alt="Logo" className="h-8 w-auto" />

      {/* User and coins info */}
      <div className="flex items-center gap-4 text-background">
        {/* Logo Points */}
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full border border-background bg-accent/10">
            <img src="/logo-dark.png" className="h-4 w-4" />
          </div>
          <span className="text-md font-medium">
            {isAnimating &&
            profile?.data?.token >
              parseInt(localStorage.getItem("bfm-tokens") || "0") ? (
              <CountUp start={0} end={0} duration={2} separator="," />
            ) : (
              0
            )}
          </span>
        </div>

        {/* Tokens */}
        <div className="flex items-center gap-2">
          <img src="/token-new.png" className="h-7 w-7 object-cover" />
          <span className="text-md font-medium">
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
        </div>

        {/* User - Click to navigate to profile page */}
        <div className="flex items-center gap-2">
          <div
            onClick={handleProfileClick}
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-background bg-accent/10 transition-colors hover:bg-accent/20"
          >
            {user?.photo_url ? (
              <img
                src={user.photo_url}
                alt="User"
                className="h-5 w-5 rounded-full object-cover"
              />
            ) : (
              <User size={16} />
            )}
          </div>
          <span
            onClick={handleProfileClick}
            className="cursor-pointer text-xs font-medium text-white/70 transition-colors hover:text-white"
          >
            {truncateText(
              profile.data?.telegramFirstName || displayName || "Guest User",
              12,
            )}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Header;
