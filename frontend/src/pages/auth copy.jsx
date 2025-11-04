import { useEffect, useRef, useState } from "react";
import { Button } from "../components/ui/button";
import { InteractiveGridPattern } from "../components/magicui/interactive-grid-pattern";
import { ArrowRightIcon, Wallet2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAppKit } from "@reown/appkit/react";
import { useWalletClient } from "wagmi";
import { useMutation } from "@tanstack/react-query";
import { loginOrRegisterWithTelegram, getUserProfile } from "@/api/user";
import { useTelegramUser } from "@/hooks/useTelegramUser";
import { useWalletAuth } from "../hooks/useWalletAuth";

export default function Auth() {
  const navigate = useNavigate();
  const { open } = useAppKit();
  const hasTriggeredLogin = useRef(false);
  const { user: telegramUser, isLoaded } = useTelegramUser();
  const [data, setData] = useState();
  const {
    address,
    isConnected,
    isAuthenticated,
    isLoading,
    error,
    connectWallet,
    user,
  } = useWalletAuth(telegramUser?.id || 0); // pass telegramId

  //  Login user with Telegram when loaded
  const telegramLoginMutation = useMutation({
    mutationFn: loginOrRegisterWithTelegram,
    onSuccess: (data) => {
      localStorage.setItem("bfm-token", data.data.token);

      // Store initial points without animation
      if (data.data.user?.token !== undefined) {
        localStorage.setItem("bfm-points", data.data.user.token.toString());
      }

      setData(data);
    },
    onError: (error) => {},
  });

  useEffect(() => {
    if (isLoaded && telegramUser && !telegramLoginMutation.isPending) {
      telegramLoginMutation.mutate({
        telegramId: telegramUser.id ?? 0,
        telegramFirstName: telegramUser.first_name,
        telegramLastName: telegramUser.last_name || "",
        telegramUsername: telegramUser.username || "",
        telegramPhotoUrl: telegramUser.photo_url || "",
      });
    }
  }, [isLoaded, telegramUser]);

  // ✅ Wallet connection effect
  useEffect(() => {
    if (
      isLoaded &&
      telegramUser &&
      isConnected &&
      address &&
      !isAuthenticated &&
      !hasTriggeredLogin.current
    ) {
      hasTriggeredLogin.current = true;
      connectWallet(); // simplified login
    }
  }, [
    isLoaded,
    telegramUser,
    isAuthenticated,
    connectWallet,
    isConnected,
    address,
  ]);

  const handleConnectWallet = async () => {
    if (!isConnected) {
      open();
    } else if (!isAuthenticated) {
      const result = await connectWallet();
      if (result?.data?.user) {
        setData((prev) => ({
          ...(prev || {}),
          data: {
            ...(prev?.data || {}),
            user: {
              ...(prev?.data?.user || {}),
              ...result.data.user,
              walletConnected: true,
            },
          },
        }));
      }
    }
  };

  const handleGetStarted = () => {
    // Set flag to show spin modal on home page
    sessionStorage.setItem("showSpinModalOnHome", "true");
    navigate("/tasks");
  };

  return (
    <div className="h-screen w-full bg-brandblue">
      <section className="relative mx-auto flex h-screen w-full max-w-md flex-col items-center justify-between gap-4 space-y-6 bg-white p-8">
        <InteractiveGridPattern
          width={40}
          height={40}
          squares={[80, 80]}
          squaresClassName="hover:fill-brandblue"
          className="[mask-image:radial-gradient(400px_circle_at_center,white,transparent)]"
        />

        <Link to="/" className="relative z-10 flex flex-row items-center gap-2">
          <img src="/logo-l.png" alt="Logo" className="h-12" />
        </Link>
        {/* {data?.data?.user?.walletConnected} */}
        <h2 className="relative z-10 text-center text-7xl font-bold uppercase text-brandblue">
          Read To Earn
        </h2>

        <div className="relative z-10 flex w-full flex-col gap-4 p-6">
          {!data?.data?.user ? (
            // 🔄 Loading Spinner
            <div className="flex min-h-[60px] w-full items-center justify-center rounded-md border-2 border-gray-300 bg-white">
              <svg
                className="h-6 w-6 animate-spin text-brandblue"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
            </div>
          ) : data.data.user.walletConnected === true ? (
            <Button
              disabled
              className="flex min-h-[60px] w-full flex-row items-center gap-4 border-2 border-green-600 bg-green-600 p-6 uppercase text-white opacity-80"
            >
              <span>Wallet Connected</span>
              <Wallet2 size={24} />
            </Button>
          ) : (
            <Button
              onClick={handleConnectWallet}
              disabled={isLoading}
              className="flex min-h-[60px] w-full flex-row items-center gap-4 border-2 border-brandblue bg-brandblue p-6 uppercase text-white transition-all hover:bg-brandblue/80 disabled:opacity-50"
            >
              <span>{isLoading ? "Connecting..." : "Connect Wallet"}</span>
              <Wallet2 size={24} />
            </Button>
          )}

          {/* {error && (
            <div className="p-2 text-center text-sm text-red-500">
              ⚠️ {error}
            </div>
          )} */}

          {/* {address && (
            <div className="text-center text-sm text-gray-600">
              ✅ Connected: {address.slice(0, 6)}...{address.slice(-4)}
            </div>
          )} */}

          <Button
            onClick={handleGetStarted}
            className="flex w-full flex-row items-center gap-4 border-2 border-brandblue bg-transparent p-6 uppercase text-brandblue transition-all hover:border-black hover:bg-transparent hover:text-black"
          >
            <span>Get Started</span>
            <ArrowRightIcon size={24} />
          </Button>
        </div>
      </section>
    </div>
  );
}
