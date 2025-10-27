import axiosInstance from "../utils/axios";

// GET leaderboard data
export const getLeaderboard = async () => {
  try {
    const response = await axiosInstance.get("/user/leaderboard");
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching leaderboard:", error);
    throw error;
  }
};

// GET user profile
export const getUserProfile = async () => {
  try {
    const token = localStorage.getItem("bfm-token");

    if (!token) {
      throw new Error("No auth token found");
    }

    const response = await axiosInstance.get("/user/profile", {
      headers: {
        Authorization: `Bearer ${token}`, // 👈 attach token here
      },
    });

    return response.data;
  } catch (error) {
    console.error("❌ Error fetching user profile:", error);
    throw error;
  }
};

// POST Telegram login or register
export const loginOrRegisterWithTelegram = async (telegramData) => {
  try {
    // Pick up referral code from URL and pass to server on login
    const params = new URLSearchParams(window.location.search);
    const referralUserId = params.get("referralUserId");
    const body = referralUserId
      ? { ...telegramData, referralCode: referralUserId }
      : telegramData;

    const response = await axiosInstance.post(
      "/user/auth/login-telegram",
      body,
    );

    const data = response.data;

    // Save token to localStorage
    if (data.token) {
      localStorage.setItem("bfm-token", data.token);
    }

    // Referral rewards are handled server-side atomically. No client-side reward calls.
    return data;
  } catch (error) {
    console.error("❌ Error logging in with Telegram:", error);
    throw error;
  }
};

// GET user details
export const getUserDetails = async () => {
  try {
    const token = localStorage.getItem("bfm-token");

    if (!token) {
      throw new Error("No auth token found");
    }

    const response = await axiosInstance.get("/user/details", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("❌ Error fetching user details:", error);
    throw error;
  }
};

// PUT/UPDATE user details
export const updateUserDetails = async (userData) => {
  try {
    const token = localStorage.getItem("bfm-token");

    if (!token) {
      throw new Error("No auth token found");
    }

    const response = await axiosInstance.put(
      "/user/details",
      {
        fullName: userData.fullName,
        email: userData.email,
        mobileNumber: userData.mobileNumber,
        xUsername: userData.xUsername,
        walletAddress: userData.walletAddress,
        walletConnected: userData.walletConnected,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error("❌ Error updating user details:", error);
    throw error;
  }
};

// POST agree to terms and conditions
export const agreeToTerms = async () => {
  try {
    const token = localStorage.getItem("bfm-token");

    if (!token) {
      throw new Error("No auth token found");
    }

    const response = await axiosInstance.post(
      "/user/agreement",
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error("❌ Error agreeing to terms:", error);
    throw error;
  }
};
