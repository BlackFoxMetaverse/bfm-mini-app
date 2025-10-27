import axiosInstance from "@/utils/axios";
import { wagmiAdapter } from "./walletProvider";

// Export the wagmi config as client for compatibility
export const client = wagmiAdapter.wagmiConfig;

// API base URL - expects full base (can include /api/v1), e.g. http://localhost:8181/api/v1
const API_BASE_URL =
  import.meta.env.VITE_BASE_URL || import.meta.env.VITE_API_BASE_URL || "";

export const walletAuth = {
  // Get nonce for wallet authentication
  async getNonce(address) {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}/user/auth/nonce/${address}`,
      );
      // Support either { data: { nonce } } or { nonce }
      return response?.data?.data?.nonce ?? response?.data?.nonce ?? null;
    } catch (error) {
      console.error("Failed to get nonce:", error);
      throw error;
    }
  },
  // Connect wallet to current Telegram-authenticated user (cookie-based)
  async loginWithWallet(address) {
    try {
      const response = await axiosInstance.post(
        `${API_BASE_URL}/user/connect-wallet`,
        {
          address,
        },
        {
          withCredentials: true,
          headers: (() => {
            const token = localStorage.getItem("bfm-token");
            return token ? { Authorization: `Bearer ${token}` } : {};
          })(),
        },
      );

      return response.data;
    } catch (error) {
      console.error("Wallet login failed:", error);
      throw error;
    }
  }, // Check if user is authenticated by checking if we have a valid cookie
  isAuthenticated() {
    // Since we're using httpOnly cookies, we can't directly check the cookie from JS
    // We'll rely on the authentication state in the hook
    return true; // Will be properly managed by the useWalletAuth hook
  },

  async disconnectWallet() {
    try {
      const response = await axiosInstance.post(
        `${API_BASE_URL}/user/disconnect-wallet`,
        {},
        { withCredentials: true },
      );
      return response.data;
    } catch (error) {
      console.error("Wallet disconnect failed:", error);
      throw error;
    }
  },

  // Get current user info - since no /me endpoint, we'll need to handle this differently
  async getCurrentUser() {
    // For cookie-based auth without a /me endpoint, we'll return a simple success
    // The actual user data will be managed by the hook after login
    return { message: "User authenticated via cookie" };
  },

  // No token accessible since we're using httpOnly cookies
  getToken() {
    return "Using httpOnly cookie authentication";
  },
};

// EIP-712 domain and types for signing
export const getEIP712Data = (address, nonce, chainId) => {
  const domain = {
    name: "BFM App",
    version: "1",
    chainId: chainId,
    verifyingContract: "0x0000000000000000000000000000000000000000",
  };

  const types = {
    Login: [
      { name: "wallet", type: "address" },
      { name: "nonce", type: "string" },
    ],
  };

  const message = {
    wallet: address,
    nonce: nonce,
  };

  return { domain, types, message };
};
