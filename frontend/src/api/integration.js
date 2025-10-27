import axiosInstance from "../utils/axios";

// POST: Claim Telegram follow reward (+500 tokens once)
// POST: Claim Telegram follow reward (+1000 tokens once)
export const claimTelegramFollowReward = async () => {
  const token = localStorage.getItem("bfm-token");
  if (!token) throw new Error("No auth token found");

  const response = await axiosInstance.post(
    "/integration/telegram/reward",
    {}, // ✅ send empty object, not null
    { headers: { Authorization: `Bearer ${token}` } },
  );

  return response.data; // wrapper from backend
};

// GET: Check Telegram channel membership (no reward)
export const checkTelegramMembership = async () => {
  try {
    const token = localStorage.getItem("bfm-token");

    if (!token) {
      throw new Error("No auth token found");
    }

    const response = await axiosInstance.get("/integration/telegram/check", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data; // Will contain { member: boolean }
  } catch (error) {
    console.error("❌ Error checking Telegram membership:", error);
    throw error;
  }
};

// Check if user is following on Twitter/X
export const checkTwitterFollow = async () => {
  try {
    const response = await fetch("/api/integration/twitter/check-follow", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to check Twitter follow status");
    }

    return response.json();
  } catch (error) {
    console.error("Error checking Twitter follow:", error);
    throw error;
  }
};

// Claim Twitter follow reward
export const claimTwitterFollowReward = async () => {
  try {
    const response = await fetch("/api/integration/twitter/claim-reward", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to claim Twitter reward");
    }

    return response.json();
  } catch (error) {
    console.error("Error claiming Twitter reward:", error);
    throw error;
  }
};

// ---- Instagram & LinkedIn (moved here from separate files) ----

const isIOS = () => /iPhone|iPad|iPod/i.test(navigator.userAgent);
const isTelegramWebApp = () =>
  typeof window !== "undefined" && window.Telegram && window.Telegram.WebApp;
const getPlatform = () =>
  isTelegramWebApp() ? "telegram-webapp" : isIOS() ? "ios" : "web";

// Instagram
export const startInstagramTask = async () => {
  const token = localStorage.getItem("bfm-token");
  if (!token) throw new Error("No auth token found");

  const response = await axiosInstance.post(
    "/integration/instagram/start",
    { platform: getPlatform() },
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return response.data;
};

export const verifyInstagramFollow = async () => {
  const token = localStorage.getItem("bfm-token");
  if (!token) throw new Error("No auth token found");

  const response = await axiosInstance.post(
    "/integration/instagram/verify",
    { platform: getPlatform() },
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return response.data;
};

export const getInstagramStatus = async () => {
  const token = localStorage.getItem("bfm-token");
  if (!token) throw new Error("No auth token found");

  const response = await axiosInstance.get("/integration/instagram/status", {
    headers: { Authorization: `Bearer ${token}` },
    params: { platform: getPlatform() },
  });
  return response.data;
};

// LinkedIn
export const startLinkedInTask = async () => {
  const token = localStorage.getItem("bfm-token");
  if (!token) throw new Error("No auth token found");

  const response = await axiosInstance.post(
    "/integration/linkedin/start",
    { platform: getPlatform() },
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return response.data;
};

export const verifyLinkedInFollow = async () => {
  const token = localStorage.getItem("bfm-token");
  if (!token) throw new Error("No auth token found");

  const response = await axiosInstance.post(
    "/integration/linkedin/verify",
    { platform: getPlatform() },
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return response.data;
};

export const getLinkedInStatus = async () => {
  const token = localStorage.getItem("bfm-token");
  if (!token) throw new Error("No auth token found");

  const response = await axiosInstance.get("/integration/linkedin/status", {
    headers: { Authorization: `Bearer ${token}` },
    params: { platform: getPlatform() },
  });
  return response.data;
};

// Medium
export const startMediumTask = async () => {
  const token = localStorage.getItem("bfm-token");
  if (!token) throw new Error("No auth token found");
  const response = await axiosInstance.post(
    "/integration/medium/start",
    { platform: getPlatform() },
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return response.data;
};

export const verifyMediumFollow = async () => {
  const token = localStorage.getItem("bfm-token");
  if (!token) throw new Error("No auth token found");
  const response = await axiosInstance.post(
    "/integration/medium/verify",
    { platform: getPlatform() },
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return response.data;
};

export const getMediumStatus = async () => {
  const token = localStorage.getItem("bfm-token");
  if (!token) throw new Error("No auth token found");
  const response = await axiosInstance.get("/integration/medium/status", {
    headers: { Authorization: `Bearer ${token}` },
    params: { platform: getPlatform() },
  });
  return response.data;
};

// Discord
export const startDiscordTask = async () => {
  const token = localStorage.getItem("bfm-token");
  if (!token) throw new Error("No auth token found");
  const response = await axiosInstance.post(
    "/integration/discord/start",
    { platform: getPlatform() },
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return response.data;
};

export const verifyDiscordFollow = async () => {
  const token = localStorage.getItem("bfm-token");
  if (!token) throw new Error("No auth token found");
  const response = await axiosInstance.post(
    "/integration/discord/verify",
    { platform: getPlatform() },
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return response.data;
};

export const getDiscordStatus = async () => {
  const token = localStorage.getItem("bfm-token");
  if (!token) throw new Error("No auth token found");
  const response = await axiosInstance.get("/integration/discord/status", {
    headers: { Authorization: `Bearer ${token}` },
    params: { platform: getPlatform() },
  });
  return response.data;
};
