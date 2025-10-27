import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAccount, useChainId } from "wagmi";
import { walletAuth } from "@/lib/wallet";

// Hook to handle wallet-based authentication
// Exposes: address, isConnected, isAuthenticated, isLoading, error, connectWallet, user
export function useWalletAuth(telegramId = 0) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  const hasAttemptedRef = useRef(false);

  // reserved for future use if needed to reset local state

  const connectWallet = useCallback(async () => {
    if (!address || !isConnected || !chainId) {
      setError("Wallet not connected");
      return;
    }

    const token = localStorage.getItem("bfm-token");
    if (!token) {
      setError("Login with Telegram first");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      // For current backend, we only need to post address to connect wallet
      const result = await walletAuth.loginWithWallet(address);

      // Backend is cookie-based; we treat success as authenticated
      setIsAuthenticated(true);
      // Persist lightweight user context if provided; else minimal
      const nextUser = result?.data?.user || { wallet: address, telegramId };
      setUser(nextUser);
      return result;
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || err?.message || "Login failed");
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, [address, isConnected, chainId, telegramId]);

  // Auto-attempt login once per mount when connected
  useEffect(() => {
    if (isConnected && address && chainId && !hasAttemptedRef.current) {
      hasAttemptedRef.current = true;
      // do not auto-call here; the page coordinates when to call connectWallet
    }
  }, [isConnected, address, chainId]);

  // Memoized return values
  return useMemo(
    () => ({
      address,
      isConnected,
      isAuthenticated,
      isLoading,
      error,
      connectWallet,
      disconnectWallet: walletAuth.disconnectWallet,
      user,
    }),
    [
      address,
      isConnected,
      isAuthenticated,
      isLoading,
      error,
      connectWallet,
      user,
    ],
  );
}

export default useWalletAuth;
