import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/utils/axios";
import { getUserDetails, updateUserDetails, agreeToTerms } from "../api/user";
import { useAppKit } from "@reown/appkit/react";
import { useTelegramUser } from "@/hooks/useTelegramUser";
import { useWalletAuth } from "../hooks/useWalletAuth";
import { toast } from "react-hot-toast";
import { Wallet, Check, X } from "lucide-react";

const UserDetails = () => {
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(true);
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

  const isFormComplete =
    userData.name.trim() !== "" &&
    userData.email.trim() !== "" &&
    userData.mobile.trim() !== "" &&
    userData.xUsername.trim() !== "" &&
    userData.walletConnected;

  const { user: telegramUser, isLoaded } = useTelegramUser();
  const { address, isConnected, isAuthenticated, connectWallet } =
    useWalletAuth(telegramUser?.id || 0);

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

        const hasAllDetails =
          details.fullName &&
          details.email &&
          details.mobileNumber &&
          details.xUsername;
        if (hasAllDetails) {
          setIsEditing(false);
        }

        if (details.agreedToTerms === true) {
          setAgreedToTerms(true);
          setIsConfirmed(true);
        }
      }

      setIsLoadingUser(false);
    } catch (error) {
      console.error("Error fetching user data:", error);
      setIsLoadingUser(false);

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

      if (
        response?.success ||
        response?.data?.success ||
        response?.status === "success"
      ) {
        setSaveSuccess(true);
        toast.success("Profile saved successfully!");

        setTimeout(() => {
          setSaveSuccess(false);
          setIsEditing(false);
        }, 1500);
      } else {
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

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to save user details. Please try again.";
      toast.error(errorMessage);

      setIsSaving(false);

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
      toast.error("Failed to connect wallet. Please try again.");
    }
  };

  const handleDisconnectWallet = async () => {
    try {
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
    } catch (err) {
      console.error("Error disconnecting wallet:", err);
    }
  };

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

      if (error.message === "No auth token found") {
        navigate("/");
      }
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#1a1a2e]">
      <div className="h-full overflow-y-auto pb-28">
        <div className="relative mx-auto w-full max-w-md bg-[#1a1a2e] p-6">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2a2a3e] text-white transition-all hover:bg-[#3a3a4e]"
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
            <h1 className="text-xl font-bold text-white">Profile Settings</h1>
            <div className="w-10"></div>
          </div>

          {/* Main Profile Card */}
          <div className="mb-4 rounded-2xl bg-[#2a2a3e] p-6">
            {isLoadingUser ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-14 w-full animate-pulse rounded-xl bg-[#3a3a4e]"
                  ></div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {[
                  { key: "name", label: "Full Name", type: "text", placeholder: "Enter your full name" },
                  { key: "email", label: "Email", type: "email", placeholder: "your.email@example.com" },
                  { key: "mobile", label: "Mobile", type: "text", placeholder: "+1 (555) 000-0000" },
                  { key: "xUsername", label: "X Username", type: "text", placeholder: "@username" },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="mb-2 block text-xs font-semibold uppercase text-gray-400">
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      name={field.key}
                      value={userData[field.key]}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder={field.placeholder}
                      className="w-full rounded-xl bg-[#1a1a2e] px-4 py-3 text-sm text-white placeholder-gray-500 outline-none ring-2 ring-transparent transition-all focus:ring-[#6C63FF]/50 disabled:opacity-60"
                    />
                  </div>
                ))}

                {/* Action Button */}
                {isEditing ? (
                  <button
                    onClick={handleSave}
                    disabled={isSaving || !isFormComplete}
                    className={`mt-2 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold uppercase transition-all ${
                      isFormComplete
                        ? saveSuccess
                          ? "bg-green-500 text-white"
                          : "bg-[#6C63FF] text-white hover:bg-[#5952d4]"
                        : "cursor-not-allowed bg-[#3a3a4e] text-gray-500 opacity-60"
                    }`}
                  >
                    {isSaving ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        Saving...
                      </>
                    ) : saveSuccess ? (
                      <>
                        <Check size={16} />
                        Saved!
                      </>
                    ) : (
                      "Save Profile"
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleEdit}
                    className="mt-2 w-full rounded-xl bg-[#6C63FF] py-3.5 text-sm font-bold uppercase text-white transition-all hover:bg-[#5952d4]"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Wallet Card */}
          <div className="mb-4 rounded-2xl bg-[#2a2a3e] p-6">
            <div className="mb-4 flex items-center gap-2">
              <Wallet size={20} className="text-[#6C63FF]" />
              <span className="text-sm font-bold uppercase text-white">
                Wallet Connection
              </span>
            </div>

            {userData.walletConnected ? (
              <div className="space-y-3">
                <div className="rounded-xl bg-[#1a1a2e] p-4">
                  <div className="mb-2 text-xs font-semibold uppercase text-gray-400">
                    Connected Address
                  </div>
                  <div className="break-all text-sm text-white">
                    {userData.walletAddress}
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
                    <span className="text-xs font-semibold text-green-400">
                      Active
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleDisconnectWallet}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-500/20 px-4 py-3 text-sm font-bold uppercase text-red-400 ring-2 ring-red-500/30 transition-all hover:bg-red-500/30"
                >
                  <X size={16} />
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnectWallet}
                className="w-full rounded-xl bg-[#6C63FF] px-4 py-3 text-sm font-bold uppercase text-white transition-all hover:bg-[#5952d4]"
              >
                Connect Wallet
              </button>
            )}
          </div>

          {/* Terms & Agreement Card */}
          <div className="rounded-2xl bg-[#2a2a3e] p-6">
            <div className="mb-4 text-sm font-bold uppercase text-white">
              Terms & Agreement
            </div>

            {/* Checkbox */}
            <label className="mb-4 flex cursor-pointer items-start gap-3">
              <div
                onClick={() => !isConfirmed && setAgreedToTerms(!agreedToTerms)}
                className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 transition-all ${
                  agreedToTerms
                    ? "border-[#6C63FF] bg-[#6C63FF]"
                    : "border-gray-500 bg-[#1a1a2e]"
                } ${isConfirmed ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
              >
                {agreedToTerms && <Check size={14} className="text-white" />}
              </div>
              <span
                className={`text-sm text-gray-300 ${isConfirmed ? "opacity-60" : ""}`}
              >
                I agree to the terms and conditions
              </span>
            </label>

            {/* Confirm Button */}
            <button
              onClick={handleConfirmProceed}
              disabled={!agreedToTerms || isConfirmed || isConfirming}
              className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold uppercase transition-all ${
                isConfirmed
                  ? "bg-green-500 text-white"
                  : agreedToTerms
                    ? "bg-[#6C63FF] text-white hover:bg-[#5952d4]"
                    : "cursor-not-allowed bg-[#3a3a4e] text-gray-500 opacity-60"
              }`}
            >
              {isConfirming ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Confirming...
                </>
              ) : isConfirmed ? (
                <>
                  <Check size={16} />
                  Confirmed
                </>
              ) : (
                <>
                  <Check size={16} />
                  Confirm & Proceed
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;