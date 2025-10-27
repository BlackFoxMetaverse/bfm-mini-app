import axiosInstance from "../utils/axios";

// Platform detection helpers
const isIOS = () => /iPhone|iPad|iPod/i.test(navigator.userAgent);
const isTelegramWebApp = () =>
  typeof window !== "undefined" && window.Telegram && window.Telegram.WebApp;
const getPlatform = () =>
  isTelegramWebApp() ? "telegram-webapp" : isIOS() ? "ios" : "web";

/**
 * Twitter API service for handling Twitter OAuth and follow verification
 * Connects to backend running on port 8181
 */

/**
 * Start Twitter task - records start and returns Mini App URL
 * POST to /api/v1/integration/twitter/start
 * @returns {Promise<Object>} Response data containing OAuth URL
 */
export const startTwitterTask = async () => {
  const token = localStorage.getItem("bfm-token");

  if (!token) {
    throw new Error("No auth token found");
  }

  const response = await axiosInstance.post(
    "/integration/twitter/start",
    { platform: getPlatform() },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
};

/**
 * Verify Twitter follow status and claim reward (enforces 5-minute wait)
 * POST to /api/v1/integration/twitter/verify
 * @returns {Promise<Object>} Response data containing verification result and reward info
 */
export const verifyTwitterFollow = async () => {
  const token = localStorage.getItem("bfm-token");

  if (!token) {
    throw new Error("No auth token found");
  }

  const response = await axiosInstance.post(
    "/integration/twitter/verify",
    { platform: getPlatform() },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
};

/**
 * Get Twitter task status
 * GET to /api/v1/integration/twitter/status
 * @returns {Promise<Object>} Response data containing current Twitter task status
 */
export const getTwitterStatus = async () => {
  const token = localStorage.getItem("bfm-token");

  if (!token) {
    throw new Error("No auth token found");
  }

  const response = await axiosInstance.get(`/integration/twitter/status`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: { platform: getPlatform() },
  });

  return response.data;
};
