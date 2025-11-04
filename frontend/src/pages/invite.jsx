import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Mock components - replace with your actual imports
const Header = () => <div className="mb-4"></div>;
const ReferredUsers = ({ referredUsers }) => (
  <div className="mt-6 space-y-3">
    {referredUsers.map((user, idx) => (
      <div
        key={idx}
        className="flex items-center justify-between rounded-lg bg-[#1a1a1a] p-3"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-700 font-bold text-white">
            {user.name?.[0] || "U"}
          </div>
          <div>
            <div className="font-medium text-white">{user.name || "User"}</div>
            <div className="text-xs text-gray-400">
              {user.status || "Invited"}
            </div>
          </div>
        </div>
        <div className="font-bold text-green-400">+{user.points || 0}</div>
      </div>
    ))}
  </div>
);

const Invite = () => {
  const [friends, setFriends] = useState([]);
  const [user, setUser] = useState({ telegramId: "123456" }); // Mock user
  const [copySuccess, setCopySuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [referralStats, setReferralStats] = useState({
    level1: { count: 200, points: 400000 },
    level2: { count: 150, points: 75000 },
    level3: { count: 300, points: 60000 },
  });
  const [promoCode] = useState("CBB21");

  const LEVEL_REWARDS = {
    level1: 2000,
    level2: 500,
    level3: 200,
  };

  const copyReferralLink = () => {
    if (!user?.telegramId) return;

    const link = `https://t.me/bfm_academy_bot?start=r${user.telegramId}`;

    const fallbackCopy = (text) => {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      document.body.appendChild(textArea);
      textArea.select();

      try {
        document.execCommand("copy");
        textArea.remove();
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
        return true;
      } catch (err) {
        textArea.remove();
        return false;
      }
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(link)
        .then(() => {
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2000);
        })
        .catch(() => fallbackCopy(link));
    } else {
      fallbackCopy(link);
    }
  };

  const copyPromoCode = () => {
    const fallbackCopy = (text) => {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      document.body.appendChild(textArea);
      textArea.select();

      try {
        document.execCommand("copy");
        textArea.remove();
        return true;
      } catch (err) {
        textArea.remove();
        return false;
      }
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(promoCode)
        .then(() => {})
        .catch(() => fallbackCopy(promoCode));
    } else {
      fallbackCopy(promoCode);
    }
  };

  const shareReferralLink = () => {
    if (!user?.telegramId) return;

    const referralLink = `https://t.me/bfm_academy_bot?start=r${user.telegramId}`;

    if (navigator.share) {
      navigator
        .share({
          title: "Join BFM Academy on Telegram!",
          text: "Earn tokens by joining through my invite link!",
          url: referralLink,
        })
        .catch(() => {});
    } else {
      copyReferralLink();
    }
  };

  const totalPoints =
    referralStats.level1.points +
    referralStats.level2.points +
    referralStats.level3.points;
  const totalReferrals =
    referralStats.level1.count +
    referralStats.level2.count +
    referralStats.level3.count;

  return (
    <div className="h-[100dvh] min-h-screen w-full overflow-y-auto bg-[#0a0a0a]">
      <div className="h-full overflow-y-auto pb-28">
        <div className="relative mx-auto w-full max-w-md bg-[#0a0a0a] p-4">
          {/* Back Button */}
          <button onClick={() => navigate(-1)} className="mb-4 text-white">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Stats Cards */}
          <div className="mb-6 grid grid-cols-2 gap-3">
            <div className="flex flex-col items-center justify-center rounded-xl border border-gray-800 bg-[#1a1a1a] p-4">
              <div className="mb-1 text-2xl font-bold text-[#DCF88E]">
                ${(totalPoints / 100).toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">Total Points</div>
            </div>
            <div className="flex flex-col items-center justify-center rounded-xl border border-gray-800 bg-[#1a1a1a] p-4">
              <div className="mb-1 text-2xl font-bold text-white">
                {totalReferrals}
              </div>
              <div className="text-sm text-gray-400">Total Referral</div>
            </div>
          </div>

          {/* Promo Code Section */}
          <div
            className="mb-6 flex flex-col items-center justify-center rounded-[2rem] px-5 py-7 text-black"
            style={{
              background:
                "linear-gradient(135deg, #B1F1D4, #DCF98C,#CCBEEB,#854BFE,#4E58ED)",
            }}
          >
            <div className="mb-4 text-lg font-medium">
              Invite a friend and get $BFM
            </div>
            <div className="mb-4 text-center">
              Give a friend promo code and you'll <br /> get $BFM points.
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={copyPromoCode}
                className="flex items-center gap-2 rounded-full border-2 border-dashed border-black px-5 py-3 backdrop-blur-sm"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                <span className="font-bold">{promoCode}</span>
              </button>
              <button
                onClick={shareReferralLink}
                className="flex-1 rounded-full border border-black bg-black px-5 py-3 font-bold text-white backdrop-blur-sm"
              >
                Invite Friends
              </button>
            </div>
          </div>

          {/* Level Earnings */}
          <div className="mb-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-lg font-bold text-white">Level Earnings</div>
              <button className="text-gray-400">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4M12 8h.01" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-gray-800 bg-[#1a1a1a] p-4 text-center">
                <div className="mb-1 text-3xl font-bold text-[#DCF88E]">
                  {referralStats.level1.count}
                </div>
                <div className="mb-2 text-xs text-gray-400">Level 1</div>
              </div>
              <div className="rounded-xl border border-gray-800 bg-[#1a1a1a] p-4 text-center">
                <div className="mb-1 text-3xl font-bold text-[#DCF88E]">
                  {referralStats.level2.count}
                </div>
                <div className="mb-2 text-xs text-gray-400">Level 2</div>
              </div>
              <div className="rounded-xl border border-gray-800 bg-[#1a1a1a] p-4 text-center">
                <div className="mb-1 text-3xl font-bold text-[#DCF88E]">
                  {referralStats.level3.count}
                </div>
                <div className="mb-2 text-xs text-gray-400">Level 3</div>
              </div>
            </div>
          </div>

          {/* Referral Activity List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-xl border border-gray-800 bg-[#1a1a1a] p-4">
              <div>
                <div className="mb-1 font-medium text-white">
                  <span className="text-xs text-gray-400">From:</span> Thomas
                  Woodrow Wilson
                </div>
                <div className="text-sm text-[#DCF88E]">
                  Reward for an invite
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <div className="py-.5 w-fit rounded-full bg-[#DCF88E] px-2 text-lg font-bold">
                  +$18
                </div>
                <div className="text-xs text-gray-500">01:52:22 15:43</div>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-gray-800 bg-[#1a1a1a] p-4">
              <div>
                <div className="mb-1 font-medium text-white">
                  Thomas Woodrow Wilson
                </div>
                <div className="text-sm text-gray-400">Invitation accepted</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">01:52:22 15:43</div>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-gray-800 bg-[#1a1a1a] p-4">
              <div>
                <div className="mb-1 font-medium text-white">Contact_1</div>
                <div className="text-sm text-gray-400">Invitation sent</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">01:52:22 15:43</div>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-gray-800 bg-[#1a1a1a] p-4">
              <div>
                <div className="mb-1 font-medium text-white">
                  Received referral credits
                </div>
                <div className="text-sm text-gray-400">Authorization code</div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <div className="py-.5 w-fit rounded-full bg-[#DCF88E] px-2 text-lg font-bold">
                  +$13
                </div>
                <div className="text-xs text-gray-500">01:52:22 15:43</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invite;
