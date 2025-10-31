import Header from "../components/header";
import { useState, useEffect, useMemo, useCallback } from "react";
import TaskCard from "./taskCard";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getUserProfile } from "../api/user";
import {
  checkTelegramMembership,
  claimTelegramFollowReward,
  verifyInstagramFollow,
  getInstagramStatus,
  verifyLinkedInFollow,
  getLinkedInStatus,
  verifyMediumFollow,
  getMediumStatus,
  verifyDiscordFollow,
  getDiscordStatus,
} from "../api/integration";
import { verifyTwitterFollow, getTwitterStatus } from "../api/twitter";
import toast, { Toaster } from "react-hot-toast";

import { playCash } from "../lib/sfx";
import { Users } from "../components/ui/UserIconSvg";
import { SpinModal } from "../components/ui/spin-modal";

export default function Tasks() {
  const queryClient = useQueryClient();
  const location = useLocation();
  const navigate = useNavigate();
  // const [selectedInterests, setSelectedInterests] = useState([]);
  const [isVerifyingTwitter, setIsVerifyingTwitter] = useState(false);
  const [isVerifyingInstagram, setIsVerifyingInstagram] = useState(false);
  const [isVerifyingLinkedIn, setIsVerifyingLinkedIn] = useState(false);
  const [showSpinModal, setShowSpinModal] = useState(false);

  // Get user profile to track completion status
  const { data: profile, isLoading: loadingProfile } = useQuery({
    queryKey: ["user-profile"],
    queryFn: getUserProfile,
  });

  // Twitter task status management
  const [isLoading, setIsLoading] = useState(false);
  const [twitterStatus, setTwitterStatus] = useState(null);
  const [instagramStatus, setInstagramStatus] = useState(null);
  const [linkedinStatus, setLinkedInStatus] = useState(null);
  const [mediumStatus, setMediumStatus] = useState(null);
  const [discordStatus, setDiscordStatus] = useState(null);
  const isLoggedIn = !!profile?.data;
  const lastSpin = profile?.data?.lastSpinAt
    ? dayjs(profile.data.lastSpinAt)
    : null;
  const canSpin = isLoggedIn && (!lastSpin || now.isAfter(nextSpinTime));

  const nextSpinTime = lastSpin?.add(24, "hour");

  // Determine if user can spin

  // const interests = ["Limited", "In-game", "Partners"];

  // Function to fetch and update Twitter status
  const fetchTwitterStatus = useCallback(async (showErrorFlag = false) => {
    setIsLoading(true);
    try {
      const statusResponse = await getTwitterStatus();
      const statusData = statusResponse.data || statusResponse;
      setTwitterStatus(statusData);

      return statusData;
    } catch (error) {
      if (showErrorFlag) {
        if (error.response?.status === 401) {
          toast.error("Please log in again to continue.");
        } else if (error.code === "NETWORK_ERROR" || !navigator.onLine) {
          toast.error(
            "Connection failed, please check your internet and try again.",
          );
        } else {
          toast.error("Failed to load Twitter status. Please try again.");
        }
      }

      setTwitterStatus(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Function to fetch and update Instagram status
  const fetchInstagramStatus = useCallback(async (showErrorFlag = false) => {
    try {
      const statusResponse = await getInstagramStatus();
      const statusData = statusResponse.data || statusResponse;
      setInstagramStatus(statusData);
      return statusData;
    } catch {
      if (showErrorFlag) {
        toast.error("Failed to load Instagram status. Please try again.");
      }
      setInstagramStatus(null);
      return null;
    }
  }, []);

  // Function to fetch and update LinkedIn status
  const fetchLinkedInStatus = useCallback(async (showErrorFlag = false) => {
    try {
      const statusResponse = await getLinkedInStatus();
      const statusData = statusResponse.data || statusResponse;
      setLinkedInStatus(statusData);
      return statusData;
    } catch {
      if (showErrorFlag) {
        toast.error("Failed to load LinkedIn status. Please try again.");
      }
      setLinkedInStatus(null);
      return null;
    }
  }, []);

  useEffect(() => {
    const isFromAuth = sessionStorage.getItem("showSpinModalOnHome");
    if (isFromAuth && isLoggedIn && canSpin && !loadingProfile) {
      setShowSpinModal(true);
      // Remove the flag so it doesn't show again on subsequent visits
      sessionStorage.removeItem("showSpinModalOnHome");
    }
  }, [isLoggedIn, canSpin, loadingProfile]);

  const fetchMediumStatus = useCallback(async (showErrorFlag = false) => {
    try {
      const statusResponse = await getMediumStatus();
      const statusData = statusResponse.data || statusResponse;
      setMediumStatus(statusData);
      return statusData;
    } catch {
      if (showErrorFlag) {
        toast.error("Failed to load Medium status. Please try again.");
      }
      setMediumStatus(null);
      return null;
    }
  }, []);

  const fetchDiscordStatus = useCallback(async (showErrorFlag = false) => {
    try {
      const statusResponse = await getDiscordStatus();
      const statusData = statusResponse.data || statusResponse;
      setDiscordStatus(statusData);
      return statusData;
    } catch {
      if (showErrorFlag) {
        toast.error("Failed to load Discord status. Please try again.");
      }
      setDiscordStatus(null);
      return null;
    }
  }, []);

  // Handle Twitter OAuth return
  useEffect(() => {
    const handleTwitterOAuthReturn = async () => {
      const urlParams = new URLSearchParams(location.search);
      const twitterAuth = urlParams.get("twitter_auth");

      if (twitterAuth) {
        // Clean up URL parameters
        const cleanUrl = location.pathname;
        navigate(cleanUrl, { replace: true });

        try {
          if (twitterAuth === "success") {
            const statusData = await fetchTwitterStatus();

            if (statusData?.connected) {
              toast.success(
                "Twitter Connected! Authorization successful! Please follow us and then verify to claim your reward.",
              );
            } else {
              toast.success(
                "Authorization Complete! Twitter authorization completed! Please try again if you need to connect.",
              );
            }
          } else if (twitterAuth === "error") {
            toast.error("Twitter authorization failed. Please try again.");
          } else if (twitterAuth === "cancelled") {
            toast.error(
              "Twitter authorization was cancelled. You can try again anytime.",
            );
          }
        } catch (error) {
          if (error.response?.status === 401) {
            toast.error("Please log in again to continue.");
          } else if (error.code === "NETWORK_ERROR" || !navigator.onLine) {
            toast.error(
              "Connection failed, please check your internet and try again.",
            );
          } else {
            toast.error(
              "Something went wrong while checking your Twitter status. Please try again.",
            );
          }
        }
      }
    };

    handleTwitterOAuthReturn();
  }, [location.search, location.pathname, navigate, fetchTwitterStatus]);

  // Fetch social statuses on component mount
  useEffect(() => {
    fetchTwitterStatus();
    fetchInstagramStatus();
    fetchLinkedInStatus();
    fetchMediumStatus();
    fetchDiscordStatus();
  }, [
    fetchTwitterStatus,
    fetchInstagramStatus,
    fetchLinkedInStatus,
    fetchMediumStatus,
    fetchDiscordStatus,
  ]);

  // const toggleInterest = useCallback((interest) => {
  //   setSelectedInterests((prev) =>
  //     prev.includes(interest)
  //       ? prev.filter((item) => item !== interest)
  //       : [...prev, interest],
  //   );
  // }, []);

  // Memoize tasks array
  const tasks = useMemo(
    () => [
      {
        id: 1,
        title: "Join our Telegram Community",
        reward: 1000,
        url: "https://t.me/bfmacademyy",
        iconName: "telegram",
        type: "telegram",
      },
      {
        id: 2,
        title: "Follow us on Twitter(X)",
        reward: 2000,
        url: "#",
        iconName: "twitter",
        type: "twitter",
      },
      {
        id: 3,
        title: "Follow us on Instagram",
        reward: 2000,
        url: "#",
        iconName: "instagram",
        type: "instagram",
      },
      {
        id: 4,
        title: "Follow us on LinkedIn",
        reward: 2000,
        url: "#",
        iconName: "linkedin",
        type: "linkedin",
      },
      {
        id: 5,
        title: "Follow us on Medium",
        reward: 2000,
        url: "#",
        iconName: "medium",
        type: "medium",
      },
      {
        id: 6,
        title: "Join our Discord",
        reward: 2000,
        url: "#",
        iconName: "discord",
        type: "discord",
      },
    ],
    [],
  );

  const compulsoryTasks = useMemo(
    () => tasks.filter((t) => t.id === 1 || t.id === 2),
    [tasks],
  );
  const optionalTasks = useMemo(
    () => tasks.filter((t) => t.id >= 3 && t.id <= 6),
    [tasks],
  );

  // Calculate completion using profile socialTasks (preferred) and live status as fallback
  const socialTasks = profile?.data?.socialTasks || [];
  const isPlatformRewarded = useCallback(
    (platform) =>
      !!socialTasks.find((t) => t.platform === platform && t.rewarded),
    [socialTasks],
  );

  const telegramCompleted = profile?.data?.telegramRewardClaimed || false;
  const twitterCompleted =
    isPlatformRewarded("twitter") || !!twitterStatus?.followRewarded || false;
  const instagramCompleted =
    isPlatformRewarded("instagram") ||
    !!instagramStatus?.followRewarded ||
    false;
  const linkedinCompleted =
    isPlatformRewarded("linkedin") || !!linkedinStatus?.followRewarded || false;
  const mediumCompleted =
    isPlatformRewarded("medium") || !!mediumStatus?.followRewarded || false;
  const discordCompleted =
    isPlatformRewarded("discord") || !!discordStatus?.followRewarded || false;

  const compulsoryCompleted =
    (telegramCompleted ? 1 : 0) + (twitterCompleted ? 1 : 0);
  const optionalCompleted =
    (instagramCompleted ? 1 : 0) +
    (linkedinCompleted ? 1 : 0) +
    (mediumCompleted ? 1 : 0) +
    (discordCompleted ? 1 : 0);

  // React Query: fetch membership on-demand then claim
  const membershipQuery = useQuery({
    queryKey: ["telegram-membership"],
    queryFn: checkTelegramMembership,
    enabled: false,
  });

  const claimTelegramMutation = useMutation({
    mutationFn: claimTelegramFollowReward,
  });

  const verifyAndClaimTelegram = useCallback(async () => {
    try {
      const mem = await membershipQuery.refetch();
      const isMember = !!mem?.data?.data?.member;

      if (!isMember) {
        toast.error(
          "Please join the Telegram channel first, then tap Verify & Claim.",
        );
        return;
      }

      const result = await claimTelegramMutation.mutateAsync();
      const data = result?.data || result;

      const rewarded = data?.rewarded;
      const bundleAwarded = data?.bundleAwarded;
      const alreadyClaimed = data?.alreadyClaimed;
      const rewardAmount = data?.rewardAmount || 0;
      const totalTokens = data?.totalTokens;

      // Check if already claimed
      if (alreadyClaimed) {
        if (bundleAwarded) {
          playCash();
          toast.success(
            `🎉 You earned 2,000 tokens for completing all compulsory tasks!${totalTokens ? `\n💰 New balance: ${totalTokens.toLocaleString()}` : ""}`,
          );
        } else {
          toast.success(
            "Telegram task is done. Complete Twitter task to earn 2,000 tokens.",
          );
        }
        queryClient.invalidateQueries({ queryKey: ["user-profile"] });
        return;
      }

      // New reward granted
      if (rewarded || bundleAwarded) {
        playCash();
        if (bundleAwarded && rewardAmount >= 2000) {
          toast.success(
            `🎉 You earned 2,000 tokens for completing all compulsory tasks!${totalTokens ? `\n💰 New balance: ${totalTokens.toLocaleString()}` : ""}`,
          );
        } else {
          toast.success(
            `✅ Telegram task verified! Complete Twitter task to earn 2,000 tokens.${totalTokens ? `\n💰 Current balance: ${totalTokens.toLocaleString()}` : ""}`,
          );
        }
        queryClient.invalidateQueries({ queryKey: ["user-profile"] });
        return;
      }

      toast.success(
        "Telegram task recorded. Complete other tasks to earn rewards.",
      );
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    } catch (error) {
      console.error("Telegram verification error:", error);
      toast.error("Something went wrong while verifying. Please try again.");
    }
  }, [membershipQuery, claimTelegramMutation, queryClient]);

  const verifyAndClaimTwitter = useCallback(async () => {
    setIsVerifyingTwitter(true);
    try {
      const result = await verifyTwitterFollow();
      const data = result.data || result;

      // Check if it's a cooldown error FIRST
      if (data.canVerify === false && data.remainingMinutes) {
        toast.error(
          `Please wait ${data.remainingMinutes} minute(s) before trying again.`,
        );
        return;
      }

      const rewarded = data.rewarded;
      const bundleAwarded = data.bundleAwarded;
      const alreadyClaimed = data.alreadyClaimed;
      const rewardAmount = data.rewardAmount || 0;
      const totalTokens = data.totalTokens;

      // Check if already claimed
      if (alreadyClaimed) {
        if (bundleAwarded) {
          playCash();
          toast.success(
            `🎉 You earned 2,000 tokens for completing all compulsory tasks!${totalTokens ? `\n💰 New balance: ${totalTokens.toLocaleString()}` : ""}`,
          );
        } else {
          toast.success(
            "Twitter task is done. Complete Telegram task to earn 2,000 tokens.",
          );
        }
        await fetchTwitterStatus();
        queryClient.invalidateQueries({ queryKey: ["user-profile"] });
        return;
      }

      // New reward granted
      if (rewarded !== undefined) {
        if (bundleAwarded && rewardAmount >= 2000) {
          playCash();
          toast.success(
            `🎉 You earned 2,000 tokens for completing all compulsory tasks!${totalTokens ? `\n💰 New balance: ${totalTokens.toLocaleString()}` : ""}`,
          );
        } else if (rewarded) {
          toast.success(
            `✅ Twitter task verified! Complete Telegram task to earn 2,000 tokens.${totalTokens ? `\n💰 Current balance: ${totalTokens.toLocaleString()}` : ""}`,
          );
        } else {
          toast.success(
            "Twitter task recorded. Complete other tasks to earn rewards.",
          );
        }
        await fetchTwitterStatus();
        queryClient.invalidateQueries({ queryKey: ["user-profile"] });
        return;
      }

      toast.error(
        "The verification completed, but we received an unexpected response. Please refresh the page.",
      );
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error("Please log in again to continue.");
      } else if (err.response?.status === 403) {
        toast.error("Access denied. Please check your permissions.");
      } else if (err.code === "NETWORK_ERROR" || !navigator.onLine) {
        toast.error(
          "Connection failed, please check your internet and try again.",
        );
      } else if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else if (err.message) {
        toast.error(err.message);
      } else {
        toast.error(
          "Something went wrong while verifying Twitter. Please try again.",
        );
      }
    } finally {
      setIsVerifyingTwitter(false);
    }
  }, [fetchTwitterStatus, queryClient]);

  const verifyAndClaimInstagram = useCallback(async () => {
    setIsVerifyingInstagram(true);
    try {
      const result = await verifyInstagramFollow();
      const data = result.data || result;

      if (data.canVerify === false && data.remainingMinutes) {
        toast.error(
          `Please wait ${data.remainingMinutes} minute(s) before trying again.`,
        );
        return;
      }

      const rewarded = data.rewarded;
      const bundleAwarded = data.bundleAwarded;
      const alreadyClaimed = data.alreadyClaimed;
      const rewardAmount = data.rewardAmount || 0;
      const totalTokens = data.totalTokens;

      if (alreadyClaimed) {
        if (bundleAwarded) {
          playCash();
          toast.success(
            `🎉 You earned 2,000 tokens for completing optional tasks!${totalTokens ? `\n💰 New balance: ${totalTokens.toLocaleString()}` : ""}`,
          );
        } else {
          toast.success(
            "Instagram task is done. Complete one more optional task to earn 2,000 tokens.",
          );
        }
        await fetchInstagramStatus();
        queryClient.invalidateQueries({ queryKey: ["user-profile"] });
        return;
      }

      if (rewarded !== undefined) {
        if (bundleAwarded && rewardAmount >= 2000) {
          playCash();
          toast.success(
            `🎉 You earned 2,000 tokens for completing optional tasks!${totalTokens ? `\n💰 New balance: ${totalTokens.toLocaleString()}` : ""}`,
          );
        } else if (rewarded) {
          toast.success(
            `✅ Instagram task verified! Complete one more optional task to earn 2,000 tokens.${totalTokens ? `\n💰 Current balance: ${totalTokens.toLocaleString()}` : ""}`,
          );
        } else {
          toast.success(
            "Instagram task recorded. Complete more tasks to earn rewards.",
          );
        }
        await fetchInstagramStatus();
        queryClient.invalidateQueries({ queryKey: ["user-profile"] });
        return;
      }

      toast.success(
        "Instagram task recorded. Please refresh if status doesn't update.",
      );
      await fetchInstagramStatus();
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    } catch (err) {
      console.error("Instagram verification error:", err);
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to verify Instagram.",
      );
    } finally {
      setIsVerifyingInstagram(false);
    }
  }, [fetchInstagramStatus, queryClient]);

  const verifyAndClaimLinkedIn = useCallback(async () => {
    setIsVerifyingLinkedIn(true);
    try {
      const result = await verifyLinkedInFollow();
      const data = result.data || result;

      if (data.canVerify === false && data.remainingMinutes) {
        toast.error(
          `Please wait ${data.remainingMinutes} minute(s) before trying again.`,
        );
        return;
      }

      const rewarded = data.rewarded;
      const bundleAwarded = data.bundleAwarded;
      const alreadyClaimed = data.alreadyClaimed;
      const rewardAmount = data.rewardAmount || 0;
      const totalTokens = data.totalTokens;

      if (alreadyClaimed) {
        if (bundleAwarded) {
          playCash();
          toast.success(
            `🎉 You earned 2,000 tokens for completing optional tasks!${totalTokens ? `\n💰 New balance: ${totalTokens.toLocaleString()}` : ""}`,
          );
        } else {
          toast.success(
            "LinkedIn task is done. Complete one more optional task to earn 2,000 tokens.",
          );
        }
        await fetchLinkedInStatus();
        queryClient.invalidateQueries({ queryKey: ["user-profile"] });
        return;
      }

      if (rewarded !== undefined) {
        if (bundleAwarded && rewardAmount >= 2000) {
          playCash();
          toast.success(
            `🎉 You earned 2,000 tokens for completing optional tasks!${totalTokens ? `\n💰 New balance: ${totalTokens.toLocaleString()}` : ""}`,
          );
        } else if (rewarded) {
          toast.success(
            `✅ LinkedIn task verified! Complete one more optional task to earn 2,000 tokens.${totalTokens ? `\n💰 Current balance: ${totalTokens.toLocaleString()}` : ""}`,
          );
        } else {
          toast.success(
            "LinkedIn task recorded. Complete more tasks to earn rewards.",
          );
        }
        await fetchLinkedInStatus();
        queryClient.invalidateQueries({ queryKey: ["user-profile"] });
        return;
      }

      toast.success(
        "LinkedIn task recorded. Please refresh if status doesn't update.",
      );
      await fetchLinkedInStatus();
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    } catch (err) {
      console.error("LinkedIn verification error:", err);
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to verify LinkedIn.",
      );
    } finally {
      setIsVerifyingLinkedIn(false);
    }
  }, [fetchLinkedInStatus, queryClient]);

  const verifyAndClaimMedium = useCallback(async () => {
    try {
      const result = await verifyMediumFollow();
      const data = result.data || result;

      if (data.canVerify === false && data.remainingMinutes) {
        toast.error(
          `Please wait ${data.remainingMinutes} minute(s) before trying again.`,
        );
        return;
      }

      const rewarded = data.rewarded;
      const bundleAwarded = data.bundleAwarded;
      const alreadyClaimed = data.alreadyClaimed;
      const rewardAmount = data.rewardAmount || 0;
      const totalTokens = data.totalTokens;

      if (alreadyClaimed) {
        if (bundleAwarded) {
          playCash();
          toast.success(
            `🎉 You earned 2,000 tokens for completing optional tasks!${totalTokens ? `\n💰 New balance: ${totalTokens.toLocaleString()}` : ""}`,
          );
        } else {
          toast.success(
            "Medium task is done. Complete one more optional task to earn 2,000 tokens.",
          );
        }
        await fetchMediumStatus();
        queryClient.invalidateQueries({ queryKey: ["user-profile"] });
        return;
      }

      if (rewarded !== undefined) {
        if (bundleAwarded && rewardAmount >= 2000) {
          playCash();
          toast.success(
            `🎉 You earned 2,000 tokens for completing optional tasks!${totalTokens ? `\n💰 New balance: ${totalTokens.toLocaleString()}` : ""}`,
          );
        } else if (rewarded) {
          toast.success(
            `✅ Medium task verified! Complete one more optional task to earn 2,000 tokens.${totalTokens ? `\n💰 Current balance: ${totalTokens.toLocaleString()}` : ""}`,
          );
        } else {
          toast.success(
            "Medium task recorded. Complete more tasks to earn rewards.",
          );
        }
        await fetchMediumStatus();
        queryClient.invalidateQueries({ queryKey: ["user-profile"] });
        return;
      }

      toast.success(
        "Medium task recorded. Please refresh if status doesn't update.",
      );
      await fetchMediumStatus();
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    } catch (err) {
      console.error("Medium verification error:", err);
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to verify Medium.",
      );
    }
  }, [fetchMediumStatus, queryClient]);

  const verifyAndClaimDiscord = useCallback(async () => {
    try {
      const result = await verifyDiscordFollow();
      const data = result.data || result;

      if (data.canVerify === false && data.remainingMinutes) {
        toast.error(
          `Please wait ${data.remainingMinutes} minute(s) before trying again.`,
        );
        return;
      }

      const rewarded = data.rewarded;
      const bundleAwarded = data.bundleAwarded;
      const alreadyClaimed = data.alreadyClaimed;
      const rewardAmount = data.rewardAmount || 0;
      const totalTokens = data.totalTokens;

      if (alreadyClaimed) {
        if (bundleAwarded) {
          playCash();
          toast.success(
            `🎉 You earned 2,000 tokens for completing optional tasks!${totalTokens ? `\n💰 New balance: ${totalTokens.toLocaleString()}` : ""}`,
          );
        } else {
          toast.success(
            "Discord task is done. Complete one more optional task to earn 2,000 tokens.",
          );
        }
        await fetchDiscordStatus();
        queryClient.invalidateQueries({ queryKey: ["user-profile"] });
        return;
      }

      if (rewarded !== undefined) {
        if (bundleAwarded && rewardAmount >= 2000) {
          playCash();
          toast.success(
            `🎉 You earned 2,000 tokens for completing optional tasks!${totalTokens ? `\n💰 New balance: ${totalTokens.toLocaleString()}` : ""}`,
          );
        } else if (rewarded) {
          toast.success(
            `✅ Discord task verified! Complete one more optional task to earn 2,000 tokens.${totalTokens ? `\n💰 Current balance: ${totalTokens.toLocaleString()}` : ""}`,
          );
        } else {
          toast.success(
            "Discord task recorded. Complete more tasks to earn rewards.",
          );
        }
        await fetchDiscordStatus();
        queryClient.invalidateQueries({ queryKey: ["user-profile"] });
        return;
      }

      toast.success(
        "Discord task recorded. Please refresh if status doesn't update.",
      );
      await fetchDiscordStatus();
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    } catch (err) {
      console.error("Discord verification error:", err);
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to verify Discord.",
      );
    }
  }, [fetchDiscordStatus, queryClient]);

  const isVerifyingTelegram =
    membershipQuery.isFetching || claimTelegramMutation.isPending;

  return (
    <div className="h-screen w-full overflow-y-auto bg-black text-white">
      <Toaster />

      {/* Spin Modal */}
      <SpinModal
        isOpen={showSpinModal}
        onClose={() => setShowSpinModal(false)}
      />

      <div className="mx-auto w-full max-w-md">
        {/* Header Section */}
        <div className="px-4 pt-4">
          <Header />
        </div>
        {/* Title Section */}
        <div className="mt-5 px-4 py-4">
          <div className="space-y-6 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold uppercase tracking-wide">
                Do your task
              </h1>
              <p className="text-sm uppercase tracking-wider text-gray-400">
                GET Rewards for Completing Quests
              </p>
            </div>

            <div className="relative px-4 py-2">
              {/* Outer glow rings */}
              <div
                className="absolute inset-0 -z-20 animate-ping rounded-3xl bg-white/10 opacity-75"
                style={{ animationDuration: "3s" }}
              ></div>
              <div className="absolute inset-0 -z-20 animate-pulse rounded-3xl bg-gradient-to-r from-white/20 via-gray-300/30 to-white/20 blur-2xl"></div>

              {/* Rotating gradient border effect */}
              <div
                className="absolute inset-0 -z-10 animate-spin rounded-3xl bg-gradient-to-r from-white via-gray-400 to-white p-[2px] opacity-50"
                style={{ animationDuration: "4s" }}
              >
                <div className="h-full w-full rounded-3xl bg-black"></div>
              </div>

              <Link to="/invite" className="block">
                <button className="group relative w-full overflow-hidden rounded-3xl border-2 border-white/30 bg-gradient-to-br from-zinc-700 via-neutral-800 to-zinc-900 px-8 py-5 font-extrabold uppercase tracking-wider text-white shadow-[0_0_50px_rgba(255,255,255,0.15),inset_0_1px_0_rgba(255,255,255,0.2)] transition-all duration-500">
                  {/* Top highlight */}
                  <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>

                  {/* Button content */}
                  <span className="relative z-10 flex items-center justify-center gap-4">
                    {/* Icon with glow */}
                    <span className="relative">
                      <Users className="h-6 w-6 transition-all duration-500" />
                      <span className="absolute inset-0 h-6 w-6 animate-ping opacity-0 transition-opacity duration-500 group-hover:opacity-75">
                        <Users className="h-6 w-6" />
                      </span>
                    </span>

                    {/* Main text with gradient */}
                    <span className="bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-xl transition-all duration-500">
                      Refer & Earn
                    </span>
                  </span>

                  {/* Corner shine effects */}
                  <div className="absolute left-3 top-3 h-4 w-4 border-l-2 border-t-2 border-white/40 transition-all duration-500 group-hover:h-6 group-hover:w-6 group-hover:border-white/60"></div>
                  <div className="absolute bottom-3 right-3 h-4 w-4 border-b-2 border-r-2 border-white/40 transition-all duration-500 group-hover:h-6 group-hover:w-6 group-hover:border-white/60"></div>

                  {/* Additional decorative corners */}
                  <div className="absolute right-3 top-3 h-4 w-4 border-r-2 border-t-2 border-white/20 transition-all duration-500 group-hover:border-white/40"></div>
                  <div className="absolute bottom-3 left-3 h-4 w-4 border-b-2 border-l-2 border-white/20 transition-all duration-500 group-hover:border-white/40"></div>
                </button>
              </Link>

              {/* Floating animated particles */}
              <div className="pointer-events-none absolute inset-0">
                <div
                  className="absolute left-[15%] top-0 h-2 w-2 animate-bounce rounded-full bg-white/60 blur-sm"
                  style={{ animationDelay: "0s", animationDuration: "2s" }}
                ></div>
                <div
                  className="absolute right-[20%] top-2 h-3 w-3 animate-bounce rounded-full bg-white/40 blur-sm"
                  style={{ animationDelay: "0.5s", animationDuration: "2.5s" }}
                ></div>
                <div
                  className="absolute bottom-2 left-[25%] h-2 w-2 animate-bounce rounded-full bg-white/50 blur-sm"
                  style={{ animationDelay: "1s", animationDuration: "2.2s" }}
                ></div>
                <div
                  className="absolute bottom-0 right-[30%] h-2.5 w-2.5 animate-bounce rounded-full bg-white/45 blur-sm"
                  style={{ animationDelay: "1.5s", animationDuration: "2.8s" }}
                ></div>
                <div
                  className="absolute left-[40%] top-1 h-1.5 w-1.5 animate-bounce rounded-full bg-white/35 blur-sm"
                  style={{ animationDelay: "0.8s", animationDuration: "2.3s" }}
                ></div>
              </div>

              {/* Side sparkle effects */}
              <div
                className="absolute -left-2 top-1/2 h-1 w-1 -translate-y-1/2 animate-ping rounded-full bg-white/10"
                style={{ animationDuration: "2s" }}
              ></div>
              <div
                className="absolute -right-2 top-1/2 h-1 w-1 -translate-y-1/2 animate-ping rounded-full bg-white/10"
                style={{ animationDuration: "2s", animationDelay: "1s" }}
              ></div>
            </div>
          </div>
        </div>

        {/* Filter Buttons */}
        {/* <div className="mb-6 px-4">
          <div className="flex flex-wrap justify-center gap-3">
            {interests.map((interest) => (
              <button
                key={interest}
                onClick={() => toggleInterest(interest)}
                className={`rounded-xl border border-gray-600 px-4 py-2 text-sm font-medium transition-all duration-300 ${selectedInterests.includes(interest)
                    ? "scale-105 bg-white text-black shadow-lg"
                    : "bg-transparent text-white hover:border-gray-400 hover:bg-gray-800"
                  } `}
              >
                {interest}
              </button>
            ))}
          </div>
        </div> */}

        {/* Tasks Section */}
        <div className="mb-24 space-y-6 px-4">
          {/* Compulsory Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-200">
                  Compulsory (2 tasks)
                </h2>
                <p className="text-xs text-gray-400">
                  Complete both to earn 2,000 points
                </p>
              </div>
              <div className="rounded-full bg-gray-800 px-3 py-1 text-xs text-gray-300">
                {compulsoryCompleted}/2
              </div>
            </div>
            <div className="space-y-4">
              {compulsoryTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  sectionType="compulsory"
                  isCompleted={
                    (task.type === "telegram" && telegramCompleted) ||
                    (task.type === "twitter" && twitterCompleted)
                  }
                  verifyTelegram={verifyAndClaimTelegram}
                  verifyTwitter={verifyAndClaimTwitter}
                  verifyInstagram={verifyAndClaimInstagram}
                  verifyLinkedIn={verifyAndClaimLinkedIn}
                  verifyMedium={verifyAndClaimMedium}
                  verifyDiscord={verifyAndClaimDiscord}
                  isVerifying={
                    task.type === "twitter"
                      ? isVerifyingTwitter
                      : isVerifyingTelegram
                  }
                  // Twitter-specific props
                  twitterStatus={twitterStatus}
                  instagramStatus={instagramStatus}
                  linkedinStatus={linkedinStatus}
                  mediumStatus={mediumStatus}
                  discordStatus={discordStatus}
                  isLoading={isLoading}
                  fetchTwitterStatus={fetchTwitterStatus}
                  fetchInstagramStatus={fetchInstagramStatus}
                  fetchLinkedInStatus={fetchLinkedInStatus}
                  fetchMediumStatus={fetchMediumStatus}
                  fetchDiscordStatus={fetchDiscordStatus}
                />
              ))}
            </div>
          </div>

          {/* Optional Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-200">
                  Optional (4 tasks)
                </h2>
                <p className="text-xs text-gray-400">
                  Complete any two to earn 2,000 points
                </p>
              </div>
              <div className="rounded-full bg-gray-800 px-3 py-1 text-xs text-gray-300">
                {Math.min(optionalCompleted, 2)}/2
              </div>
            </div>
            <div className="space-y-4">
              {optionalTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  sectionType="optional"
                  isCompleted={
                    (task.type === "instagram" && instagramCompleted) ||
                    (task.type === "linkedin" && linkedinCompleted) ||
                    (task.type === "medium" && mediumCompleted) ||
                    (task.type === "discord" && discordCompleted)
                  }
                  verifyTelegram={verifyAndClaimTelegram}
                  verifyTwitter={verifyAndClaimTwitter}
                  verifyInstagram={verifyAndClaimInstagram}
                  verifyLinkedIn={verifyAndClaimLinkedIn}
                  verifyMedium={verifyAndClaimMedium}
                  verifyDiscord={verifyAndClaimDiscord}
                  isVerifying={
                    task.type === "twitter"
                      ? isVerifyingTwitter
                      : task.type === "instagram"
                        ? isVerifyingInstagram
                        : task.type === "linkedin"
                          ? isVerifyingLinkedIn
                          : false
                  }
                  // statuses
                  twitterStatus={twitterStatus}
                  instagramStatus={instagramStatus}
                  linkedinStatus={linkedinStatus}
                  mediumStatus={mediumStatus}
                  discordStatus={discordStatus}
                  isLoading={isLoading}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
