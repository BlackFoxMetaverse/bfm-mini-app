import { useEffect, useState } from "react";
import Header from "../components/header";
import { getUserProfile } from "../api/user";
import axiosInstance from "../utils/axios";
import ReferredUsers from "./ReferredUsers";

const Invite = () => {
  const [friends, setFriends] = useState([]);
  const [user, setUser] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [referralStats, setReferralStats] = useState({
    level1: { count: 0, points: 0 },
    level2: { count: 0, points: 0 },
    level3: { count: 0, points: 0 },
  });

  const LEVEL_REWARDS = {
    level1: 2000,
    level2: 500,
    level3: 200,
  };

  const fetchReferralData = async () => {
    try {
      setIsLoading(true);
      const profile = await getUserProfile();
      setUser(profile.data);

      const res = await axiosInstance.get("/user/referrals", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("bfm-token")}`,
        },
      });

      const user_res = await axiosInstance.get("/user/profile", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("bfm-token")}`,
        },
      });

      const userData = user_res.data.data;
      const referralData = res.data.data || [];
      setFriends(referralData);

      // Get referral level rewards from user data
      const referralLevelRewards = userData.referralLevelRewards || [];

      // Find each level's data or use defaults
      const level1Data = referralLevelRewards.find((r) => r.level === 1) || {
        referralCount: 0,
        totalEarned: 0,
      };
      const level2Data = referralLevelRewards.find((r) => r.level === 2) || {
        referralCount: 0,
        totalEarned: 0,
      };
      const level3Data = referralLevelRewards.find((r) => r.level === 3) || {
        referralCount: 0,
        totalEarned: 0,
      };

      const stats = {
        level1: {
          count: level1Data.referralCount,
          points: level1Data.totalEarned,
        },
        level2: {
          count: level2Data.referralCount,
          points: level2Data.totalEarned,
        },
        level3: {
          count: level3Data.referralCount,
          points: level3Data.totalEarned,
        },
      };

      setReferralStats(stats);
    } catch (error) {
      console.error("Error fetching referral data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyReferralLink = () => {
    if (!user?.telegramId) {
      return;
    }

    const link = `https://t.me/invincibleminigame_bot?start=r${user.telegramId}`;

    const fallbackCopy = (text) => {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        document.execCommand("copy");
        textArea.remove();
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
        return true;
      } catch (err) {
        textArea.remove();
        console.error("Fallback copy failed:", err);
        return false;
      }
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(link)
        .then(() => {
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2000);
        })
        .catch((err) => {
          console.error("Clipboard API failed, using fallback:", err);
          fallbackCopy(link);
        });
    } else {
      fallbackCopy(link);
    }
  };

  useEffect(() => {
    fetchReferralData();
  }, []);

  const shareReferralLink = () => {
    if (!user?.telegramId) {
      return;
    }

    const referralLink = `https://t.me/invincibleminigame_bot?start=r${user.telegramId}`;

    if (navigator.share) {
      navigator
        .share({
          title: "Join Invincible Mini Game",
          text: "Earn tokens by joining through my invite link!",
          url: referralLink,
        })
        .then(() => {})
        .catch((error) => {
          console.error("Share failed:", error);
        });
    } else {
      const fallbackCopy = (text) => {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
          document.execCommand("copy");
          textArea.remove();
          alert(
            "Referral link copied to clipboard. Share it with your friends!",
          );
          return true;
        } catch (err) {
          textArea.remove();
          console.error("Copy failed:", err);
          alert("Could not copy link. Please copy it manually from below.");
          return false;
        }
      };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard
          .writeText(referralLink)
          .then(() => {
            alert(
              "Referral link copied to clipboard. Share it with your friends!",
            );
          })
          .catch(() => {
            fallbackCopy(referralLink);
          });
      } else {
        fallbackCopy(referralLink);
      }
    }
  };

  const totalPoints =
    referralStats.level1.points +
    referralStats.level2.points +
    referralStats.level3.points;
  const totalReferrals =
    referralStats.level1.count +
    referralStats.level2.count +
    referralStats.level3.count;

  return (
    <div className="h-dvh w-full bg-brandblue">
      <div className="h-full overflow-y-auto pb-28">
        <div className="relative mx-auto w-full max-w-md bg-brandblue p-4">
          <Header />

          {/* Animated Header */}
          <div className="relative z-10 mt-4 space-y-2 text-center text-white">
            <div className="animate-fade-in-down text-4xl font-bold uppercase tracking-tight">
              Invite Friends
            </div>
            <div className="animate-fade-in-up text-sm uppercase opacity-90">
              Build Your Network & Earn Rewards
            </div>
          </div>

          {/* Animated Background Logo */}
          <div className="animate-pulse-slow absolute left-1/2 top-3/4 z-0 -translate-x-1/2 -translate-y-1/2 scale-[2] transform">
            <img
              src="./logo-bg.png"
              alt="bg-overlay"
              className="h-auto max-w-full opacity-50"
            />
          </div>

          {/* Main Stats Card with Glass Effect */}
          <div className="animate-slide-up relative z-10 mx-2 mt-6">
            <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] p-5 text-white shadow-2xl backdrop-blur-sm">
              {/* Shimmer Effect */}
              <div className="animate-shimmer absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>

              {/* Total Points Display with Counter Animation */}
              <div className="relative mb-6 text-center">
                <div className="mb-1 text-xs font-medium uppercase tracking-wider text-gray-400">
                  Total Earnings
                </div>
                <div className="animate-scale-in mb-3 text-5xl font-extrabold">
                  {isLoading ? (
                    <div className="inline-block h-12 w-32 animate-pulse rounded-lg bg-gray-700"></div>
                  ) : (
                    <span className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
                      {totalPoints.toLocaleString()}
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-400">
                  from {totalReferrals}{" "}
                  {totalReferrals === 1 ? "referral" : "referrals"}
                </div>
              </div>

              {/* 3-Level Visual Breakdown with Stagger Animation */}
              <div className="mb-5 grid grid-cols-3 gap-3">
                {/* Level 1 */}
                <div className="animate-fade-in-stagger-1 group transform rounded-xl bg-gradient-to-br from-[#3a3a3a] to-[#2d2d2d] p-3 text-center transition-all duration-300 hover:scale-105 hover:shadow-lg">
                  <div className="mb-2 flex items-center justify-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-white to-gray-300 text-lg font-bold text-black shadow-lg transition-transform duration-300 group-hover:rotate-12">
                      {isLoading ? (
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-400 border-t-black"></div>
                      ) : (
                        referralStats.level1.count
                      )}
                    </div>
                  </div>
                  <div className="mb-1 text-xs font-bold uppercase tracking-wide">
                    Level 1
                  </div>
                  <div className="text-xl font-bold text-white transition-colors duration-300 group-hover:text-gray-200">
                    {referralStats.level1.points}
                  </div>
                  <div className="text-xs text-gray-400">points</div>
                </div>

                {/* Level 2 */}
                <div className="animate-fade-in-stagger-2 group transform rounded-xl bg-gradient-to-br from-[#3a3a3a] to-[#2d2d2d] p-3 text-center transition-all duration-300 hover:scale-105 hover:shadow-lg">
                  <div className="mb-2 flex items-center justify-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-gray-300 to-gray-400 text-lg font-bold text-black shadow-lg transition-transform duration-300 group-hover:rotate-12">
                      {isLoading ? (
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-500 border-t-black"></div>
                      ) : (
                        referralStats.level2.count
                      )}
                    </div>
                  </div>
                  <div className="mb-1 text-xs font-bold uppercase tracking-wide">
                    Level 2
                  </div>
                  <div className="text-xl font-bold text-white transition-colors duration-300 group-hover:text-gray-200">
                    {referralStats.level2.points}
                  </div>
                  <div className="text-xs text-gray-400">points</div>
                </div>

                {/* Level 3 */}
                <div className="animate-fade-in-stagger-3 group transform rounded-xl bg-gradient-to-br from-[#3a3a3a] to-[#2d2d2d] p-3 text-center transition-all duration-300 hover:scale-105 hover:shadow-lg">
                  <div className="mb-2 flex items-center justify-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-gray-500 to-gray-600 text-lg font-bold text-white shadow-lg transition-transform duration-300 group-hover:rotate-12">
                      {isLoading ? (
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-600 border-t-white"></div>
                      ) : (
                        referralStats.level3.count
                      )}
                    </div>
                  </div>
                  <div className="mb-1 text-xs font-bold uppercase tracking-wide">
                    Level 3
                  </div>
                  <div className="text-xl font-bold text-white transition-colors duration-300 group-hover:text-gray-200">
                    {referralStats.level3.points}
                  </div>
                  <div className="text-xs text-gray-400">points</div>
                </div>
              </div>

              {/* Animated Progress Bar */}
              <div className="relative mb-5 h-3 w-full overflow-hidden rounded-full bg-gray-700 shadow-inner">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-white via-gray-200 to-white shadow-lg transition-all duration-1000 ease-out"
                  style={{
                    width: `${Math.min(100, (totalReferrals / 20) * 100)}%`,
                  }}
                >
                  <div className="animate-shimmer-fast h-full w-full bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                </div>
              </div>

              {/* Action Buttons with Hover Effects */}
              <div className="mb-4 flex gap-3">
                <button
                  onClick={shareReferralLink}
                  className="group relative flex-1 overflow-hidden rounded-xl bg-white px-4 py-3.5 text-sm font-bold uppercase text-black shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95"
                >
                  <span className="relative z-10">INVITE FRIENDS</span>
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-gray-200 to-transparent transition-transform duration-500 group-hover:translate-x-full"></div>
                </button>

                <button
                  onClick={copyReferralLink}
                  className={`group relative flex items-center gap-2 overflow-hidden rounded-xl px-4 py-3.5 text-sm font-bold uppercase shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95 ${
                    copySuccess
                      ? "bg-green-500 text-white"
                      : "bg-white text-black"
                  }`}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className={`transition-transform duration-300 ${copySuccess ? "scale-110" : ""}`}
                  >
                    {copySuccess ? (
                      <path d="M20 6L9 17l-5-5" />
                    ) : (
                      <>
                        <rect
                          x="9"
                          y="9"
                          width="13"
                          height="13"
                          rx="2"
                          ry="2"
                        ></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </>
                    )}
                  </svg>
                  <span className="relative z-10">
                    {copySuccess ? "COPIED!" : "COPY"}
                  </span>
                  {!copySuccess && (
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-gray-200 to-transparent transition-transform duration-500 group-hover:translate-x-full"></div>
                  )}
                </button>
              </div>

              {/* Referral Link Display with Glass Effect */}
              <div className="group relative overflow-hidden rounded-xl bg-[#2d2d2d] p-3 transition-all duration-300 hover:bg-[#333333]">
                {user?.telegramId ? (
                  <div className="break-all text-center text-xs text-gray-300 transition-colors duration-300 group-hover:text-white">
                    https://t.me/invincibleminigame_bot?start=r{user.telegramId}
                  </div>
                ) : (
                  <div className="text-center text-xs text-red-400">
                    Telegram ID not found. Please login via Telegram.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Reward Structure Info with Slide Animation */}
          <div className="animate-slide-up-delayed relative z-10 mx-2 mt-4">
            <div className="overflow-hidden rounded-xl bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] p-4 text-white shadow-xl backdrop-blur-sm">
              <div className="mb-3 flex items-center justify-center gap-2 text-center">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4M12 8h.01" />
                </svg>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-300">
                  How You Earn
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="group relative overflow-hidden rounded-lg bg-[#2d2d2d] p-3 text-center transition-all duration-300 hover:bg-[#333333]">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                  <div className="relative z-10">
                    <div className="mb-2 flex justify-center">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-white to-gray-200 text-sm font-bold text-black shadow-md">
                        1
                      </div>
                    </div>
                    <div className="mb-1 text-2xl font-extrabold text-white">
                      {LEVEL_REWARDS.level1}
                    </div>
                    <div className="text-xs text-gray-400">
                      People you invite
                    </div>
                  </div>
                </div>

                <div className="group relative overflow-hidden rounded-lg bg-[#2d2d2d] p-3 text-center transition-all duration-300 hover:bg-[#333333]">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                  <div className="relative z-10">
                    <div className="mb-2 flex justify-center">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-gray-300 to-gray-400 text-sm font-bold text-black shadow-md">
                        2
                      </div>
                    </div>
                    <div className="mb-1 text-2xl font-extrabold text-white">
                      {LEVEL_REWARDS.level2}
                    </div>
                    <div className="text-xs text-gray-400">
                      Friends of friends
                    </div>
                  </div>
                </div>

                <div className="group relative overflow-hidden rounded-lg bg-[#2d2d2d] p-3 text-center transition-all duration-300 hover:bg-[#333333]">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                  <div className="relative z-10">
                    <div className="mb-2 flex justify-center">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-gray-500 to-gray-600 text-sm font-bold text-white shadow-md">
                        3
                      </div>
                    </div>
                    <div className="mb-1 text-2xl font-extrabold text-white">
                      {LEVEL_REWARDS.level3}
                    </div>
                    <div className="text-xs text-gray-400">
                      Extended network
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3 rounded-lg bg-[#222] p-2 text-center">
                <p className="text-xs text-gray-400">
                  Earn from 3 levels deep • The more you share, the more you
                  earn
                </p>
              </div>
            </div>
          </div>

          {/* Friends List */}
          <div className="animate-slide-up-delayed-more">
            <ReferredUsers referredUsers={friends} />
          </div>
        </div>
      </div>

      {/* Animated Bottom Banner */}
      <div className="animate-slide-up-from-bottom fixed bottom-20 left-0 right-0 z-40 mx-6">
        <div className="overflow-hidden rounded-xl bg-gradient-to-r from-[#222] via-[#2d2d2d] to-[#222] px-4 py-3 text-center shadow-lg backdrop-blur-sm">
          <div className="relative z-10 text-xs font-bold uppercase text-white">
            Grow Your Network → Maximize Your Earnings
          </div>
          <div className="animate-shimmer-slow absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes pulseSlow {
          0%,
          100% {
            opacity: 0.5;
          }
          50% {
            opacity: 0.3;
          }
        }

        .animate-fade-in-down {
          animation: fadeInDown 0.6s ease-out;
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out 0.2s both;
        }

        .animate-slide-up {
          animation: slideUp 0.7s ease-out 0.3s both;
        }

        .animate-slide-up-delayed {
          animation: slideUp 0.7s ease-out 0.5s both;
        }

        .animate-slide-up-delayed-more {
          animation: slideUp 0.7s ease-out 0.7s both;
        }

        .animate-slide-up-from-bottom {
          animation: slideUp 0.7s ease-out 0.9s both;
        }

        .animate-scale-in {
          animation: scaleIn 0.5s ease-out 0.4s both;
        }

        .animate-fade-in-stagger-1 {
          animation: slideUp 0.6s ease-out 0.5s both;
        }

        .animate-fade-in-stagger-2 {
          animation: slideUp 0.6s ease-out 0.6s both;
        }

        .animate-fade-in-stagger-3 {
          animation: slideUp 0.6s ease-out 0.7s both;
        }

        .animate-shimmer {
          animation: shimmer 3s infinite;
        }

        .animate-shimmer-fast {
          animation: shimmer 2s infinite;
        }

        .animate-shimmer-slow {
          animation: shimmer 4s infinite;
        }

        .animate-pulse-slow {
          animation: pulseSlow 4s ease-in-out infinite;
        }

        .hover\\:scale-102:hover {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
};

export default Invite;
