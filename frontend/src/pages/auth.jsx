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
    <div className="h-screen w-full bg-red-600">
      <section className="relative mx-auto h-screen w-full">
        <div className="relative flex h-screen w-full flex-col overflow-hidden bg-black">
          {/* Logo */}
          <div className="absolute left-6 top-8 z-20 w-full">
            <div className="flex w-full items-center justify-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-white">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M2 2h7v7H2V2zm0 9h7v7H2v-7zm9-9h7v7h-7V2z"
                    fill="black"
                  />
                  <path
                    d="M14 15v2m0 0v2m0-2h-2m2 0h2"
                    stroke="black"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <span className="text-xl font-semibold text-white">academy</span>
            </div>
          </div>

          {/* Blue Blob - Bottom Left */}
          <div className="absolute -left-4 top-[20%] rotate-6">
            <svg
              width="211"
              height="228"
              viewBox="0 0 211 228"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M154.5 0C185.704 0 211 25.5198 211 57C211 88.4802 185.704 114 154.5 114C154.499 114 154.497 113.999 154.496 113.999C154.496 114.178 154.496 114.357 154.494 114.536C125.064 114.258 100.679 136.731 97.7578 165.699C97.9174 167.445 98 169.213 98 171C98 202.48 72.7041 228 41.5 228C10.2959 228 -15 202.48 -15 171C-15 139.521 10.2943 114.002 41.4971 114C41.4971 113.821 41.4983 113.643 41.5 113.464C70.9395 113.743 95.3302 91.256 98.2393 62.2754C98.0812 60.5383 98 58.7787 98 57C98 25.5198 123.296 0 154.5 0Z"
                fill="#242AD1"
              />
            </svg>
          </div>

          {/* Light Green Blob - Top Right */}
          <div className="absolute -right-8 top-[10%]">
            <svg
              width="172"
              height="230"
              viewBox="0 0 172 230"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <mask id="path-1-inside-1_1_25" fill="white">
                <path d="M224.053 174.978C223.244 206.172 197.077 230.798 165.607 229.982C134.137 229.166 109.282 203.217 110.091 172.023C110.092 171.96 110.096 171.897 110.098 171.834C110.07 171.833 110.042 171.833 110.015 171.832C111.101 141.129 87.4671 115.239 56.8187 113C56.392 112.999 55.9642 112.993 55.5355 112.982C24.0659 112.166 -0.789645 86.2168 0.0191961 55.0232C0.828037 23.8296 26.9949 -0.796292 58.4646 0.019707C89.9323 0.835655 114.787 26.7814 113.981 57.9724C114.003 57.9731 114.025 57.9743 114.047 57.9751C112.933 89.4158 137.745 115.811 169.464 116.929C169.462 116.97 169.461 117.011 169.46 117.051C200.49 118.345 224.853 144.09 224.053 174.978Z" />
              </mask>
              <path
                d="M224.053 174.978C223.244 206.172 197.077 230.798 165.607 229.982C134.137 229.166 109.282 203.217 110.091 172.023C110.092 171.96 110.096 171.897 110.098 171.834C110.07 171.833 110.042 171.833 110.015 171.832C111.101 141.129 87.4671 115.239 56.8187 113C56.392 112.999 55.9642 112.993 55.5355 112.982C24.0659 112.166 -0.789645 86.2168 0.0191961 55.0232C0.828037 23.8296 26.9949 -0.796292 58.4646 0.019707C89.9323 0.835655 114.787 26.7814 113.981 57.9724C114.003 57.9731 114.025 57.9743 114.047 57.9751C112.933 89.4158 137.745 115.811 169.464 116.929C169.462 116.97 169.461 117.011 169.46 117.051C200.49 118.345 224.853 144.09 224.053 174.978Z"
                fill="url(#paint0_linear_1_25)"
              />
              <path
                d="M224.053 174.978L225.052 175.004L224.053 174.978ZM165.607 229.982L165.581 230.981L165.607 229.982ZM110.091 172.023L109.091 171.997L110.091 172.023ZM110.098 171.834L111.097 171.863L111.126 170.868L110.132 170.834L110.098 171.834ZM110.015 171.832L109.015 171.796L108.98 172.796L109.979 172.831L110.015 171.832ZM56.8187 113L56.8915 112.003L56.8571 112.001L56.8227 112L56.8187 113ZM0.0191961 55.0232L-0.980468 54.9973L0.0191961 55.0232ZM113.981 57.9724L112.981 57.9465L112.956 58.938L113.947 58.9718L113.981 57.9724ZM114.047 57.9751L115.047 58.0105L115.082 57.0109L114.083 56.9757L114.047 57.9751ZM169.464 116.929L170.463 116.965L170.498 115.965L169.499 115.93L169.464 116.929ZM169.46 117.051L168.46 117.014L168.423 118.009L169.418 118.05L169.46 117.051ZM224.053 174.978L223.053 174.952C222.259 205.585 196.559 229.784 165.633 228.982L165.607 229.982L165.581 230.981C197.595 231.811 224.229 206.758 225.052 175.004L224.053 174.978ZM165.607 229.982L165.633 228.982C134.707 228.18 110.296 202.682 111.09 172.049L110.091 172.023L109.091 171.997C108.268 203.751 133.568 230.151 165.581 230.981L165.607 229.982ZM110.091 172.023L111.09 172.049C111.093 171.937 111.093 172.01 111.097 171.863L110.098 171.834L109.098 171.805C109.097 171.829 109.096 171.855 109.095 171.888C109.094 171.919 109.092 171.957 109.091 171.997L110.091 172.023ZM110.098 171.834L110.132 170.834C110.11 170.834 110.09 170.833 110.078 170.833C110.063 170.833 110.056 170.832 110.05 170.832L110.015 171.832L109.979 172.831C110.001 172.832 110.022 172.832 110.035 172.832C110.05 172.833 110.057 172.833 110.064 172.833L110.098 171.834ZM110.015 171.832L111.014 171.867C112.12 140.617 88.0663 114.28 56.8915 112.003L56.8187 113L56.7458 113.998C86.8679 116.198 110.082 141.641 109.015 171.796L110.015 171.832ZM56.8187 113L56.8227 112C56.4023 111.999 55.9819 111.993 55.5614 111.982L55.5355 112.982L55.5096 113.981C55.9465 113.993 56.3816 113.999 56.8146 114L56.8187 113ZM55.5355 112.982L55.5614 111.982C24.6356 111.18 0.224549 85.6824 1.01886 55.0491L0.0191961 55.0232L-0.980468 54.9973C-1.80384 86.7513 23.4962 113.151 55.5096 113.981L55.5355 112.982ZM0.0191961 55.0232L1.01886 55.0491C1.81317 24.4159 27.5128 0.217472 58.4387 1.01937L58.4646 0.019707L58.4905 -0.979957C26.4771 -1.81006 -0.157096 23.2433 -0.980468 54.9973L0.0191961 55.0232ZM58.4646 0.019707L58.4387 1.01937C89.3626 1.82122 113.772 27.3159 112.981 57.9465L113.981 57.9724L114.981 57.9982C115.801 26.2468 90.5019 -0.14991 58.4905 -0.979957L58.4646 0.019707ZM113.981 57.9724L113.947 58.9718C113.953 58.972 113.959 58.9722 113.971 58.9728C113.981 58.9732 113.996 58.9739 114.012 58.9744L114.047 57.9751L114.083 56.9757C114.077 56.9755 114.07 56.9752 114.058 56.9747C114.047 56.9742 114.032 56.9735 114.015 56.9729L113.981 57.9724ZM114.047 57.9751L113.048 57.9397C111.914 89.9407 137.166 116.791 169.428 117.929L169.464 116.929L169.499 115.93C138.323 114.83 113.953 88.891 115.047 58.0105L114.047 57.9751ZM169.464 116.929L168.464 116.894C168.462 116.948 168.462 116.97 168.46 117.014L169.46 117.051L170.459 117.089C170.46 117.052 170.462 116.992 170.463 116.965L169.464 116.929ZM169.46 117.051L169.418 118.05C199.912 119.322 223.839 144.619 223.053 174.952L224.053 174.978L225.052 175.004C225.867 143.561 201.069 117.369 169.501 116.052L169.46 117.051Z"
                fill="black"
                mask="url(#path-1-inside-1_1_25)"
              />
              <defs>
                <linearGradient
                  id="paint0_linear_1_25"
                  x1="114.979"
                  y1="1.48512"
                  x2="111.625"
                  y2="231.542"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#EEFFF0" />
                  <stop offset="1" stopColor="#4F9956" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Center Light Gray Blob */}
          <div className="absolute left-[55%] top-1/2 -mt-8 -translate-x-1/2 -translate-y-1/2 rotate-6 transform">
            <svg
              width="226"
              height="228"
              viewBox="0 0 226 228"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M169.5 0C200.704 0 226 25.5198 226 57C226 88.4802 200.704 114 169.5 114C169.499 114 169.497 113.999 169.496 113.999C169.496 114.178 169.496 114.357 169.494 114.536C140.064 114.258 115.679 136.731 112.758 165.699C112.917 167.445 113 169.213 113 171C113 202.48 87.7041 228 56.5 228C25.2959 228 0 202.48 0 171C0 139.521 25.2943 114.002 56.4971 114C56.4971 113.821 56.4983 113.643 56.5 113.464C85.9395 113.743 110.33 91.256 113.239 62.2754C113.081 60.5383 113 58.7787 113 57C113 25.5198 138.296 0 169.5 0Z"
                fill="#454948"
                fillOpacity="0.28"
              />
            </svg>
          </div>

          {/* Profile Images Container */}
          <div className="absolute left-[55%] top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 transform">
            {/* Top Profile */}
            <div className="relative">
              <div className="absolute -top-5 right-5 h-20 w-20 overflow-hidden rounded-full border-4 border-gray-800 bg-gray-700">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop"
                  alt="Student 1"
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Graduation Cap Icon */}
              <div className="absolute -left-3 -top-12 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-lg">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="black"
                  strokeWidth="2"
                >
                  <path d="M12 3L2 7.5L12 12L22 7.5L12 3Z" />
                  <path d="M2 7.5V14.5L12 19L22 14.5V7.5" />
                  <path d="M12 12V19" />
                </svg>
              </div>

              {/* Bottom Profile */}
              <div className="absolute -top-[7.6rem] left-6 h-20 w-20 overflow-hidden rounded-full border-4 border-gray-800 bg-gray-700">
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop"
                  alt="Student 2"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Text Content */}
          <div className="absolute bottom-32 left-6 right-6 z-20">
            <h1 className="mb-2 text-3xl font-bold leading-tight text-white">
              For the
              <br />
              Phenomenal{" "}
              <span className="inline-block rounded-lg bg-white px-3 py-1 text-black">
                Future
              </span>
            </h1>
            <p className="mt-2 text-base text-gray-400">
              Simplifying Web3 learning
            </p>
          </div>

          {/* Get Started Button */}
          <div className="absolute bottom-8 left-6 right-6 z-20">
            <button
              onClick={handleGetStarted}
              className="w-full rounded-2xl bg-blue-600 py-4 text-lg font-semibold text-white shadow-lg transition-colors hover:bg-blue-700"
            >
              Get Started
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
