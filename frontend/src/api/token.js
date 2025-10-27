// import { exit } from "process";
import axiosInstance from "../utils/axios";

// POST spin result
export const updateSpinResult = async (token) => {
  try {
    const invincibleToken = localStorage.getItem("bfm-token");

    const response = await axiosInstance.post(
      "/update-result/spin",
      { token },
      {
        headers: {
          Authorization: `Bearer ${invincibleToken}`, // 👈 attach token here
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("❌ Error updating spin result:", error);
    throw error;
  }
};

export const updateQuizResult = async (token) => {
  try {
    const invincibleToken = localStorage.getItem("bfm-token");

    const response = await axiosInstance.post(
      "/update-result/quiz",
      {
        token,
      },
      {
        headers: {
          Authorization: `Bearer ${invincibleToken}`, // 👈 attach token here
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("❌ Error updating quiz result:", error);
    throw error;
  }
};

export const updateBookReadingResult = async () => {
  try {
    const invincibleToken = localStorage.getItem("bfm-token");

    const response = await axiosInstance.post(
      "/update-result/book-reading",
      {}, // Empty body - backend calculates the reward
      {
        headers: {
          Authorization: `Bearer ${invincibleToken}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("❌ Error updating book reading result:", error);
    throw error;
  }
};

// Create a short-lived reading session token (10m TTL)
export const createReadingSession = async (bookId) => {
  const invincibleToken = localStorage.getItem("bfm-token");
  if (!invincibleToken) throw new Error("No auth token found");

  const res = await axiosInstance.post(
    "/book/reading-session",
    { bookId },
    { headers: { Authorization: `Bearer ${invincibleToken}` } },
  );
  return res.data; // { readingToken, nonce }
};

// Reward call that includes the reading session token
export const updateBookReadingWithSession = async (readingToken, bookId) => {
  const invincibleToken = localStorage.getItem("bfm-token");
  if (!invincibleToken) throw new Error("No auth token found");

  const res = await axiosInstance.post(
    "/update-result/book-reading",
    {},
    {
      headers: {
        Authorization: `Bearer ${invincibleToken}`,
        "x-reading-token": readingToken,
        "x-book-id": bookId,
      },
    },
  );
  return res.data;
};
