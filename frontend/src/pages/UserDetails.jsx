import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/utils/axios";
import { getUserDetails, updateUserDetails, agreeToTerms } from "../api/user";
import { useAppKit } from "@reown/appkit/react";
import { useTelegramUser } from "@/hooks/useTelegramUser";
import { useWalletAuth } from "../hooks/useWalletAuth";
import { toast } from "react-hot-toast";

const UserDetails = () => {
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(true); // Start with editing mode
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    mobile: "",
    xUsername: "",
    walletAddress: "",
    walletConnected: false,
  });

  const { open } = useAppKit();
  const navigate = useNavigate();

  // Derived state: check if all fields are filled
  const isFormComplete =
    userData.name.trim() !== "" &&
    userData.email.trim() !== "" &&
    userData.mobile.trim() !== "" &&
    userData.xUsername.trim() !== "" &&
    userData.walletConnected;

  const { user: telegramUser, isLoaded } = useTelegramUser();
  const { address, isConnected, isAuthenticated, connectWallet } =
    useWalletAuth(telegramUser?.id || 0);

  // Fetch user details from backend
  const fetchUserData = async () => {
    try {
      setIsLoadingUser(true);

      const response = await getUserDetails();

      if (response?.data) {
        const details = response.data;
        setUserData({
          name: details.fullName || "",
          email: details.email || "",
          mobile: details.mobileNumber || "",
          xUsername: details.xUsername || "",
          walletAddress: details.walletAddress || "",
          walletConnected: !!details.walletAddress,
        });

        // If user has already filled all details, switch to view mode
        const hasAllDetails =
          details.fullName &&
          details.email &&
          details.mobileNumber &&
          details.xUsername;
        if (hasAllDetails) {
          setIsEditing(false);
        }

        // Check if user has already agreed to terms
        if (details.agreedToTerms === true) {
          setAgreedToTerms(true);
          setIsConfirmed(true);
        }
      }

      setIsLoadingUser(false);
    } catch (error) {
      console.error("Error fetching user data:", error);
      setIsLoadingUser(false);

      // If no token or unauthorized
      if (error.message === "No auth token found") {
        navigate("/");
      }
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (
      isLoaded &&
      telegramUser &&
      isConnected &&
      address &&
      !isAuthenticated &&
      !userData.walletConnected
    ) {
      connectWallet();
    }
  }, [
    isLoaded,
    telegramUser,
    isConnected,
    address,
    connectWallet,
    isAuthenticated,
    userData.walletConnected,
  ]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Save user details to backend
  const handleSave = async () => {
    if (!isFormComplete) {
      toast.error(
        "Please fill in all fields and connect your wallet before saving.",
      );
      return;
    }

    try {
      setIsSaving(true);

      const response = await updateUserDetails({
        fullName: userData.name,
        email: userData.email,
        mobileNumber: userData.mobile,
        xUsername: userData.xUsername,
        walletAddress: userData.walletAddress,
      });

      console.log("Update response:", response); // Debug log

      // Check various possible response structures
      if (
        response?.success ||
        response?.data?.success ||
        response?.status === "success"
      ) {
        setSaveSuccess(true);
        toast.success("Profile saved successfully!");

        setTimeout(() => {
          setSaveSuccess(false);
          setIsEditing(false); // Switch to view mode after successful save
        }, 1500);
      } else {
        // If we get here, save might have succeeded but response structure is different
        toast.success("Profile saved successfully!");
        setSaveSuccess(true);

        setTimeout(() => {
          setSaveSuccess(false);
          setIsEditing(false);
        }, 1500);
      }

      setIsSaving(false);
    } catch (error) {
      console.error("Error saving user data:", error);

      // Show specific error message from backend
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to save user details. Please try again.";
      toast.error(errorMessage);

      setIsSaving(false);

      // Handle authentication errors
      if (error.message === "No auth token found") {
        navigate("/");
      }
    }
  };

  const handleEdit = () => setIsEditing(true);

  const handleConnectWallet = async () => {
    try {
      if (!isConnected) {
        open();

        await new Promise((resolve) => {
          const checkConnection = setInterval(() => {
            if (window.ethereum?.selectedAddress) {
              clearInterval(checkConnection);
              resolve(true);
            }
          }, 500);
        });
      }

      if (!isAuthenticated || !userData.walletConnected) {
        const result = await connectWallet();

        if (result?.data?.user) {
          setUserData((prev) => ({
            ...prev,
            walletConnected: true,
            walletAddress: result.data.user.walletAddress,
          }));
        }
      }
    } catch (err) {
      console.error("Error connecting wallet:", err);
      alert("Failed to connect wallet. Please try again.");
    }
  };

  const handleDisconnectWallet = async () => {
    try {
      console.log("Disconnecting wallet...");

      if (window.ethereum && typeof window.ethereum.request === "function") {
        try {
          await window.ethereum.request({
            method: "wallet_revokePermissions",
            params: [{ eth_accounts: {} }],
          });

          await axiosInstance.post("/user/disconnect-wallet", {});
        } catch (revokeErr) {
          console.warn(
            "wallet_revokePermissions failed or not supported:",
            revokeErr,
          );
        }
      }

      setUserData((prev) => ({
        ...prev,
        walletConnected: false,
        walletAddress: "",
      }));

      localStorage.removeItem("walletConnected");
      localStorage.removeItem("walletAddress");
      localStorage.removeItem("authToken");

      if (
        window.ethereum &&
        typeof window.ethereum.removeListener === "function"
      ) {
        try {
          if (typeof window.ethereum.removeAllListeners === "function") {
            window.ethereum.removeAllListeners();
          }
        } catch (e) {
          console.warn("Error removing ethereum listeners:", e);
        }
      }

      console.log("Disconnect flow finished.");
    } catch (err) {
      console.error("Error disconnecting wallet:", err);
    }
  };

  const handleFAQClick = () =>
    window.open("https://invincibleread.com/", "_blank");
  const handleAgreementClick = () =>
    window.open(encodeURI("/BFM Read User Agreement.pdf"), "_blank");

  const handleConfirmProceed = async () => {
    if (!agreedToTerms || isConfirmed || isConfirming) return;

    try {
      setIsConfirming(true);

      const response = await agreeToTerms();

      if (
        response?.success ||
        response?.data?.success ||
        response?.status === "success"
      ) {
        setIsConfirmed(true);
        toast.success("Terms accepted successfully!");
      } else {
        // Assume success if no error thrown
        setIsConfirmed(true);
        toast.success("Terms accepted successfully!");
      }

      setIsConfirming(false);
    } catch (error) {
      console.error("Error accepting terms:", error);

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to accept terms. Please try again.";
      toast.error(errorMessage);

      setIsConfirming(false);

      // Handle authentication errors
      if (error.message === "No auth token found") {
        navigate("/");
      }
    }
  };

  return (
    <div className="h-dvh w-full bg-black">
      <div className="h-full overflow-y-auto pb-28">
        <div className="relative mx-auto w-full max-w-md bg-black p-4">
          {/* Header */}
          <div className="mb-4 flex items-center justify-between">
            <button
              onClick={() => navigate("/home")}
              className="rounded-lg bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
          </div>

          {/* Title */}
          <div className="text-center text-white">
            <div className="text-4xl font-bold uppercase">Profile Settings</div>
            <div className="text-sm uppercase opacity-80">
              Manage Your Account Details
            </div>
          </div>

          {/* Main Card */}
          <div className="mt-6">
            <div className="rounded-2xl bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] p-5 text-white shadow-2xl">
              {isLoadingUser ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-14 w-full animate-pulse rounded-xl bg-gray-700"
                    ></div>
                  ))}
                </div>
              ) : (
                <div>
                  <div className="mb-4 grid grid-cols-2 gap-4">
                    {["name", "email", "mobile", "xUsername"].map((field) => (
                      <div key={field}>
                        <label className="mb-2 block text-xs font-bold uppercase text-gray-400">
                          {field === "xUsername"
                            ? "  X Username"
                            : field.charAt(0).toUpperCase() + field.slice(1)}
                        </label>
                        <input
                          type={field === "email" ? "email" : "text"}
                          name={field}
                          value={userData[field]}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          placeholder={
                            field === "xUsername"
                              ? "@username"
                              : field === "email"
                                ? "your.email@example.com"
                                : field === "mobile"
                                  ? "+1 (555) 000-0000"
                                  : "Enter your full name"
                          }
                          className="w-full rounded-xl bg-[#2d2d2d] px-4 py-3 text-[11px] text-white placeholder-gray-500 outline-none ring-2 ring-transparent focus:ring-white/30 disabled:opacity-60"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Save/Edit Button */}
                  {isEditing ? (
                    <button
                      onClick={handleSave}
                      disabled={isSaving || !isFormComplete}
                      title={
                        !isFormComplete
                          ? "Please fill all details and connect your wallet"
                          : ""
                      }
                      className={`group relative mt-6 w-full rounded-xl px-4 py-3.5 text-sm font-bold uppercase shadow-lg transition-all duration-300 ${isFormComplete ? "hover:scale-105 hover:shadow-xl" : "cursor-not-allowed opacity-40"} ${saveSuccess ? "bg-green-500 text-white" : "bg-white text-black"}`}
                    >
                      <span className="flex items-center justify-center gap-2">
                        {isSaving ? (
                          <>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent"></div>
                            SAVING...
                          </>
                        ) : saveSuccess ? (
                          <>
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                            >
                              <path d="M20 6L9 17l-5-5" />
                            </svg>
                            SAVED!
                          </>
                        ) : (
                          "SAVE PROFILE"
                        )}
                      </span>
                    </button>
                  ) : (
                    <button
                      onClick={handleEdit}
                      className="mt-6 w-full rounded-xl bg-white px-4 py-3.5 text-sm font-bold uppercase text-black shadow-lg transition-all hover:scale-105 hover:shadow-xl"
                    >
                      EDIT PROFILE
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Wallet Card */}
          <div className="mt-4 rounded-2xl bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] p-5 text-white shadow-2xl">
            <div className="mb-4 flex items-center gap-2">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
              <span className="text-sm font-bold uppercase">
                Wallet Connection
              </span>
            </div>

            {userData.walletConnected ? (
              <>
                <div className="mb-3 rounded-xl bg-[#2d2d2d] p-4">
                  <div className="mb-1 text-xs font-bold uppercase text-gray-400">
                    Connected Wallet
                  </div>
                  <div className="break-all text-sm">
                    {userData.walletAddress}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
                    <span className="text-xs text-green-400">Connected</span>
                  </div>
                </div>
                <button
                  onClick={handleDisconnectWallet}
                  className="w-full rounded-xl bg-red-500/20 px-4 py-3 text-sm font-bold uppercase text-red-400 ring-2 ring-red-500/30 transition-all hover:bg-red-500/30"
                >
                  Disconnect Wallet
                </button>
              </>
            ) : (
              <button
                onClick={handleConnectWallet}
                className="w-full rounded-xl bg-white px-4 py-3 text-sm font-bold uppercase text-black shadow-lg transition-all hover:scale-105"
              >
                Connect Wallet
              </button>
            )}
          </div>

          {/* FAQ and Agreement Section */}
          <div className="animate-slide-up-delayed relative z-10 mx-2 mt-4">
            <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] p-5 text-white shadow-2xl backdrop-blur-sm">
              <div className="mb-4 text-sm font-bold uppercase tracking-wide">
                Terms & Resources
              </div>

              {/* Checkbox */}
              <div className="mb-4">
                <label className="group flex cursor-pointer items-start gap-3">
                  <div
                    className="relative mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 transition-all"
                    style={{
                      borderColor: agreedToTerms ? "white" : "#6b7280",
                      backgroundColor: agreedToTerms ? "white" : "#2d2d2d",
                      cursor: isConfirmed ? "not-allowed" : "pointer",
                      opacity: isConfirmed ? 0.6 : 1,
                    }}
                    onClick={() =>
                      !isConfirmed && setAgreedToTerms(!agreedToTerms)
                    }
                  >
                    {agreedToTerms && (
                      <svg
                        className="h-4 w-4 text-black"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                      >
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    )}
                  </div>
                  <span
                    className="text-sm text-gray-300 transition-colors group-hover:text-white"
                    style={{ opacity: isConfirmed ? 0.6 : 1 }}
                  >
                    I agree to the terms and conditions
                  </span>
                </label>
              </div>

              {/* Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleFAQClick}
                  className="group relative w-full overflow-hidden rounded-xl bg-[#2d2d2d] px-4 py-3 text-sm font-bold uppercase text-white ring-2 ring-white/20 transition-all duration-300 hover:scale-105 hover:bg-[#3d3d3d] hover:ring-white/40 active:scale-95"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    FAQ
                  </span>
                </button>

                <button
                  onClick={handleAgreementClick}
                  className="group relative w-full overflow-hidden rounded-xl bg-[#2d2d2d] px-4 py-3 text-sm font-bold uppercase text-white ring-2 ring-white/20 transition-all duration-300 hover:scale-105 hover:bg-[#3d3d3d] hover:ring-white/40 active:scale-95"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                    AGREEMENT
                  </span>
                </button>

                <button
                  onClick={handleConfirmProceed}
                  disabled={!agreedToTerms || isConfirmed || isConfirming}
                  className={`group relative w-full overflow-hidden rounded-xl px-4 py-3.5 text-sm font-bold uppercase shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 ${
                    isConfirmed
                      ? "bg-green-500 text-white"
                      : "bg-white text-black"
                  }`}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isConfirming ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent"></div>
                        CONFIRMING...
                      </>
                    ) : isConfirmed ? (
                      <>
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                        >
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                        CONFIRMED
                      </>
                    ) : (
                      <>
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                        CONFIRM & PROCEED
                      </>
                    )}
                  </span>
                  {agreedToTerms && !isConfirmed && !isConfirming && (
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-gray-200 to-transparent transition-transform duration-500 group-hover:translate-x-full"></div>
                  )}
                </button>
              </div>
            </div>
          </div>

          <style>{`
            @keyframes fadeInDown {
              from {
                opacity: 0;
                transform: translateY(-20px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }

            @keyframes fadeInUp {
              from {
                opacity: 0;
                transform: translateY(20px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }

            @keyframes slideUp {
              from {
                opacity: 0;
                transform: translateY(30px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }

            @keyframes shimmer {
              0% {
                transform: translateX(-100%);
              }
              100% {
                transform: translateX(100%);
              }
            }

            @keyframes pulseSlow {
              0%, 100% {
                opacity: 0.5;
              }
              50% {
                opacity: 0.3;
              }
            }

            .animate-fade-in-down {
              animation: fadeInDown 0.6s ease-out;
            }

            .animate-fade-in-up {
              animation: fadeInUp 0.6s ease-out 0.2s both;
            }

            .animate-slide-up {
              animation: slideUp 0.7s ease-out 0.3s both;
            }

            .animate-slide-up-delayed {
              animation: slideUp 0.7s ease-out 0.5s both;
            }

            .animate-fade-in-stagger-1 {
              animation: slideUp 0.6s ease-out 0.4s both;
            }

            .animate-fade-in-stagger-2 {
              animation: slideUp 0.6s ease-out 0.5s both;
            }

            .animate-fade-in-stagger-3 {
              animation: slideUp 0.6s ease-out 0.6s both;
            }

            .animate-fade-in-stagger-4 {
              animation: slideUp 0.6s ease-out 0.7s both;
            }

            .animate-shimmer {
              animation: shimmer 3s infinite;
            }

            .animate-pulse-slow {
              animation: pulseSlow 4s ease-in-out infinite;
            }
          `}</style>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
