import { useQuery } from "@tanstack/react-query";
import { useState, useMemo, useCallback, memo } from "react";
import { Button } from "../components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";
import { FaTelegramPlane, FaInstagram, FaLinkedin, FaDiscord } from "react-icons/fa";
import { FaMedium, FaXTwitter } from "react-icons/fa6";
import { getUserProfile } from "../api/user";
import { startTwitterTask } from "../api/twitter";
import {
  startInstagramTask,
  startLinkedInTask,
  startMediumTask,
  startDiscordTask,
} from "../api/integration";


// Constants
const TASK_TYPES = {
  TELEGRAM: "telegram",
  TWITTER: "twitter",
  INSTAGRAM: "instagram",
  LINKEDIN: "linkedin",
  MEDIUM: "medium",
  DISCORD: "discord",
};

const ICON_MAP = {
  [TASK_TYPES.TELEGRAM]: FaTelegramPlane,
  [TASK_TYPES.TWITTER]: FaXTwitter,
  [TASK_TYPES.INSTAGRAM]: FaInstagram,
  [TASK_TYPES.LINKEDIN]: FaLinkedin,
  [TASK_TYPES.MEDIUM]: FaMedium,
  [TASK_TYPES.DISCORD]: FaDiscord,
};

const TASK_STYLES = {
  [TASK_TYPES.TWITTER]: "bg-gradient-to-br from-black to-black",
  [TASK_TYPES.INSTAGRAM]: "bg-gradient-to-tr from-[#FDC145] via-[#F0586F] to-[#923DAA]",
  [TASK_TYPES.LINKEDIN]: "bg-gradient-to-br from-sky-700 to-blue-800",
  [TASK_TYPES.MEDIUM]: "bg-gradient-to-br from-gray-700 to-gray-800",
  [TASK_TYPES.DISCORD]: "bg-gradient-to-br from-indigo-700 to-indigo-800",
  default: "bg-gradient-to-br from-blue-600 to-blue-700",
};

const BUTTON_STYLES = {
  [TASK_TYPES.TWITTER]: "from-gray-700 to-black/70 hover:from-gray-600 hover:to-black/100",
  [TASK_TYPES.INSTAGRAM]: "from-[#FDC145] via-[#F0586F] to-[#923DAA] hover:from-[#FDBA5A] hover:via-[#F15B75] hover:to-[#A25DAF]",
  [TASK_TYPES.LINKEDIN]: "from-sky-700 to-blue-800 hover:from-sky-600 hover:to-blue-700",
  [TASK_TYPES.MEDIUM]: "from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700",
  [TASK_TYPES.DISCORD]: "from-indigo-700 to-indigo-800 hover:from-indigo-600 hover:to-indigo-700",
  default: "from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600",
};

// Utility Functions
const openUrlInBrowser = (url) => {
  const isTelegram = typeof window !== "undefined" && window.Telegram?.WebApp;

  if (isTelegram) {
    window.Telegram.WebApp.openLink(url);
  } else {
    window.open(url, "_blank", "noopener,noreferrer");
  }
};

const getErrorMessage = (error) => {
  if (error.response?.status === 401) return "🔐 Please log in again to continue.";
  if (error.response?.status === 403) return "🚫 Access denied. Please check your permissions.";
  if (error.code === "NETWORK_ERROR" || !navigator.onLine) {
    return "🌐 Connection failed, please check your internet and try again.";
  }
  if (error.response?.data?.message) return `❌ ${error.response.data.message}`;
  return null;
};

const extractUrlFromResponse = (response, urlKeys) => {
  const data = response?.data || response;
  const payload = data?.data || data;

  for (const key of urlKeys) {
    if (payload?.[key]) return payload[key];
  }
  return null;
};

// Task Starter Functions
const taskStarters = {
  [TASK_TYPES.TWITTER]: {
    apiCall: startTwitterTask,
    urlKeys: ["twitterUrl", "actionUrl"],
    errorPrefix: "Twitter",
  },
  [TASK_TYPES.INSTAGRAM]: {
    apiCall: startInstagramTask,
    urlKeys: ["instagramUrl", "actionUrl"],
    errorPrefix: "Instagram",
  },
  [TASK_TYPES.LINKEDIN]: {
    apiCall: startLinkedInTask,
    urlKeys: ["linkedinUrl", "actionUrl"],
    errorPrefix: "LinkedIn",
  },
  [TASK_TYPES.MEDIUM]: {
    apiCall: startMediumTask,
    urlKeys: ["mediumUrl", "actionUrl"],
    errorPrefix: "Medium",
  },
  [TASK_TYPES.DISCORD]: {
    apiCall: startDiscordTask,
    urlKeys: ["discordUrl", "actionUrl"],
    errorPrefix: "Discord",
  },
};

// Custom Hook for Task Status
const useTaskStatus = (profile, task) => {
  return useMemo(() => {
    const socialTasks = profile?.data?.socialTasks || [];

    const getClaimedStatus = (platform) =>
      !!socialTasks.find((t) => t.platform === platform && t.rewarded);

    const isTaskType = (type) => task.type === type || task.iconName === type;

    return {
      telegramClaimed: profile?.data?.telegramRewardClaimed,
      twitterClaimed: getClaimedStatus(TASK_TYPES.TWITTER),
      instagramClaimed: getClaimedStatus(TASK_TYPES.INSTAGRAM),
      linkedinClaimed: getClaimedStatus(TASK_TYPES.LINKEDIN),
      mediumClaimed: getClaimedStatus(TASK_TYPES.MEDIUM),
      discordClaimed: getClaimedStatus(TASK_TYPES.DISCORD),
      isTwitter: isTaskType(TASK_TYPES.TWITTER),
      isInstagram: isTaskType(TASK_TYPES.INSTAGRAM),
      isLinkedIn: isTaskType(TASK_TYPES.LINKEDIN),
      isMedium: isTaskType(TASK_TYPES.MEDIUM),
      isDiscord: isTaskType(TASK_TYPES.DISCORD),
    };
  }, [profile, task.type, task.iconName]);
};

// Main Component
const TaskCard = ({
  task,
  isCompleted,
  verifyTelegram,
  verifyTwitter,
  verifyInstagram,
  verifyLinkedIn,
  verifyMedium,
  verifyDiscord,
  isVerifying,
  isLoading,
  twitterStatus,
  instagramStatus,
  linkedinStatus,
  mediumStatus,
  discordStatus,
  sectionType,
}) => {
  const [isStartingTask, setIsStartingTask] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["user-profile"],
    queryFn: getUserProfile,
  });

  const taskStatus = useTaskStatus(profile, task);
  const [isInCooldown,setisInCooldown] = useState(false);
  // Check if task is in cooldown
  const cooldownInfo = useMemo(() => {
    const checkCooldown = (status, isType) =>
      isType && status && !status.canVerify && status.remainingMinutes > 0;

    return {
      isTwitterInCooldown: checkCooldown(twitterStatus, taskStatus.isTwitter),
      isInstagramInCooldown: checkCooldown(instagramStatus, taskStatus.isInstagram),
      isLinkedInInCooldown: checkCooldown(linkedinStatus, taskStatus.isLinkedIn),
      isMediumInCooldown: checkCooldown(mediumStatus, taskStatus.isMedium),
      isDiscordInCooldown: checkCooldown(discordStatus, taskStatus.isDiscord),
    };
  }, [twitterStatus, instagramStatus, linkedinStatus, mediumStatus, discordStatus, taskStatus]);


  const remainingMinutes = useMemo(() => {
    return taskStatus.isTwitter
      ? twitterStatus?.remainingMinutes || 0
      : taskStatus.isInstagram
        ? instagramStatus?.remainingMinutes || 0
        : taskStatus.isLinkedIn
          ? linkedinStatus?.remainingMinutes || 0
          : taskStatus.isMedium
            ? mediumStatus?.remainingMinutes || 0
            : taskStatus.isDiscord
              ? discordStatus?.remainingMinutes || 0
              : 0;
  }, [twitterStatus, instagramStatus, linkedinStatus, mediumStatus, discordStatus, taskStatus]);

  // Determine if task is already claimed
  const alreadyClaimed = useMemo(() => {
    const claimMap = {
      [TASK_TYPES.TELEGRAM]: taskStatus.telegramClaimed,
      [TASK_TYPES.TWITTER]: taskStatus.twitterClaimed,
      [TASK_TYPES.INSTAGRAM]: taskStatus.instagramClaimed,
      [TASK_TYPES.LINKEDIN]: taskStatus.linkedinClaimed,
      [TASK_TYPES.MEDIUM]: taskStatus.mediumClaimed,
      [TASK_TYPES.DISCORD]: taskStatus.discordClaimed,
    };
    return claimMap[task.type] || false;
  }, [task.type, taskStatus]);

  const taskCompleted = (isCompleted || alreadyClaimed) && !isInCooldown;

  // Handle task start with improved error handling
  const handleStartTask = useCallback(async (taskType, starter) => {
    setIsStartingTask(true);
    try {
      const response = await starter.apiCall();
      const url = extractUrlFromResponse(response, starter.urlKeys);

      if (!url) {
        alert(`❌ Failed to get ${starter.errorPrefix} URL. Please try again.`);
        return;
      }

      try {
        new URL(url);
        openUrlInBrowser(url);

        setisInCooldown(Object.values(cooldownInfo).some(Boolean));
      } catch {
        alert(`❌ Invalid ${starter.errorPrefix} URL. Please try again.`);
      }
    } catch (error) {
      const errorMsg = getErrorMessage(error) ||
        `❌ Failed to start ${starter.errorPrefix} task. Please try again.`;
      alert(errorMsg);
    } finally {
      setIsStartingTask(false);
    }
  }, []);

  const handleStart = useCallback(async () => {
    if (taskCompleted) return;

    const starter = taskStarters[task.type];
    if (starter) {
      await handleStartTask(task.type, starter);
    } else if (task?.url) {
      window.open(task.url, "_blank", "noopener,noreferrer");
    }
  }, [task, taskCompleted, handleStartTask]);

  // Verify handler using useCallback
  const verifyHandler = useCallback(() => {
    const verifyMap = {
      [TASK_TYPES.TWITTER]: verifyTwitter,
      [TASK_TYPES.INSTAGRAM]: verifyInstagram,
      [TASK_TYPES.LINKEDIN]: verifyLinkedIn,
      [TASK_TYPES.MEDIUM]: verifyMedium,
      [TASK_TYPES.DISCORD]: verifyDiscord,
    };
    const handler = verifyMap[task.type] || verifyTelegram;
    handler();
  }, [task.type, verifyTwitter, verifyInstagram, verifyLinkedIn, verifyMedium, verifyDiscord, verifyTelegram]);

  // Get icon component
  const IconComponent = ICON_MAP[task.iconName] || task.icon || FaTelegramPlane;

  // Get styles
  const iconBgStyle = taskCompleted
    ? "bg-green-700/30 ring-2 ring-green-600/50"
    : `${TASK_STYLES[task.iconName] || TASK_STYLES.default} shadow-md`;

  const buttonStyle = `bg-gradient-to-r ${BUTTON_STYLES[task.iconName] || BUTTON_STYLES.default} rounded-xl`;

  // // Render reward message
  // const renderRewardMessage = () => {
  //   const baseClass = `rounded-full py-0.5 text-[10px] font-medium sm:py-1 sm:text-xs ${taskCompleted ? "text-green-300" : ""
  //     }`;

  //   // if (sectionType === "compulsory") {
  //   //   return (
  //   //     <span className={baseClass}>
  //   //       Complete both compulsory tasks to earn 2,000 points
  //   //     </span>
  //   //   );
  //   // }

  //   // if (sectionType === "optional") {
  //   //   return (
  //   //     <span className={`${baseClass} ${taskCompleted ? "bg-green-700/30 px-2" : ""}`}>
  //   //       Complete any two optional tasks to earn 2,000 points
  //   //     </span>
  //   //   );
  //   // }

  //   return (
  //     <span className={baseClass}>
  //       Earn {task.reward.toLocaleString()} tokens
  //     </span>
  //   );
  // };

  return (
    <div
      className={`relative overflow-hidden rounded-xl p-3 transition-all duration-300 sm:p-4 ${taskCompleted
          ? "border border-green-700/50 bg-gradient-to-r from-green-900/20 to-green-800/20"
          : "border border-[#444444] bg-gradient-to-r from-[#222222] to-[#2a2a2a] hover:border-[#555555]"
        } shadow-lg hover:shadow-xl`}
    >
      {/* Status Overlay */}
      <div className="absolute right-2 top-2">
        {taskCompleted ? (
          <div className="flex items-center gap-1 rounded-full bg-green-600/20 px-2 py-1">
            <CheckCircle className="h-3 w-3 text-green-400 sm:h-4 sm:w-4" />
          </div>
        ) : isInCooldown ? (
          <div className="flex items-center gap-1 rounded-full bg-orange-600/20 px-2 py-1">
            <div className="h-2 w-2 rounded-full bg-orange-400 sm:h-3 sm:w-3"></div>
            <span className="text-xs font-medium text-orange-400 sm:text-sm">
              {remainingMinutes}m
            </span>
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
        {/* Icon Section */}
        <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl sm:h-14 sm:w-14 ${iconBgStyle}`}>
          <IconComponent className={`h-6 w-6 sm:h-7 sm:w-7 ${taskCompleted ? "text-green-400" : "text-white"}`} />
        </div>

        {/* Content Section */}
        <div className="min-w-0 flex-1">
          <h3 className={`mb-1 text-xs font-bold uppercase tracking-wide sm:text-sm ${taskCompleted ? "text-green-300" : "text-white"}`}>
            {task.title}
          </h3>
          {/* <div className="flex flex-wrap items-center gap-2">
            {renderRewardMessage()}
          </div> */}

          
        {/* Action Section */}
        <div className="flex w-full flex-shrink-0 flex-col gap-2 sm:w-auto">
          {taskCompleted ? (
            <div className="flex items-center justify-center gap-1 rounded-lg border border-green-600/50 bg-green-700/30 px-2 py-1.5 text-xs sm:px-3 sm:py-2 sm:text-sm">
              <CheckCircle className="h-3.5 w-3.5 text-green-400 sm:h-4 sm:w-4" />
              <span className="font-medium text-green-300">Task Completed ✓</span>
            </div>
          ) : (
            <div className="grid grid-cols-12 gap-3">
              {/* Start Task Button */}
              <Button
                onClick={handleStart}
                disabled={isStartingTask || isVerifying}
                className={`${buttonStyle}  col-span-5`}
              >
                {isStartingTask || isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {isStartingTask ? "Opening..." : "Loading..."}
                  </span>
                ) : (
                  "Start Task"
                )}
              </Button>

              {/* Verify Button */}
              <Button
                onClick={verifyHandler}
                disabled={isVerifying || isInCooldown}
                className={`min-w-0 rounded-xl border border-gray-400 bg-transparent text-gray-300 hover:border-gray-500 hover:bg-transparent whitespace-normal break-words text-center px-4 py-2 col-span-7 ${isInCooldown ? "cursor-not-allowed opacity-50" : ""
                  }`}
              >
                {isVerifying ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Verifying...
                  </span>
                ) : isInCooldown ? (
                  <span className="block whitespace-normal break-words text-center">
                    Verify & Claim 
                  </span>
                ) : (
                  "Verify & Claim"
                )}
              </Button>
            </div>
          )}
          </div>
        </div>

      </div>
    </div>
  );
};

// Export memoized component
export default memo(TaskCard);