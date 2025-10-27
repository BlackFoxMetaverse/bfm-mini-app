import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getLeaderboard, getUserProfile } from "../api/user";
import Segmented from "../components/leaderboard/Segmented";
import Podium from "../components/leaderboard/Podium";
import Row from "../components/leaderboard/Row";

/** -------------------- THEME -------------------- */
const cls = {
  page: "min-h-screen relative h-[100dvh] w-full bg-gradient-to-b from-zinc-900 to-black text-white font-sans",
  container:
    "mx-auto w-full max-w-[480px] px-4 pb-[calc(env(safe-area-inset-bottom)+88px)]",
  card: "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_8px_30px_rgb(0_0_0/0.25)]",
  pill: "rounded-full border border-white/10 bg-white/10 backdrop-blur text-xs font-semibold",
  subtleText: "text-[13px] text-white/70",
  divider: "border-t border-white/10",
};

/** Utility: number with separators */
export const fmt = (n) => n.toLocaleString() || "0";

/** -------------------- MAIN COMPONENT -------------------- */
export default function LeadNew() {
  const [scope, setScope] = useState("weekly");

  // Fetch leaderboard data from API
  const {
    data: leaderboardResponse,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: getLeaderboard,
  });
  // Fetch current user profile
  const { data: profileData } = useQuery({
    queryKey: ["user-profile"],
    queryFn: getUserProfile,
    retry: 1,
  });

  // Extract data from API response

  const currentUserData = leaderboardResponse?.data?.currentUser;

  // Get current user rank based on scope
  const currentUserRank =
    scope === "weekly"
      ? leaderboardResponse?.data?.weekly?.currentUserRank
      : leaderboardResponse?.data?.allTime?.currentUserRank;

  // Transform API data to match component format
  const transformedAllTimeData = useMemo(() => {
    const allTimeData = leaderboardResponse?.data?.allTime?.leaderboard || [];
    return allTimeData.map((user) => ({
      id: user._id || user.id,
      name: user.telegramFirstName || user.username || "Anonymous",
      avatar: user.telegramPhotoUrl || "",
      points: user.token || 0,
      position: user.position,
    }));
  }, [leaderboardResponse]);

  const transformedWeeklyData = useMemo(() => {
    const weeklyData = leaderboardResponse?.data?.weekly?.leaderboard || [];
    return weeklyData.map((user) => ({
      id: user._id || user.id,
      name: user.telegramFirstName || user.username || "Anonymous",
      avatar: user.telegramPhotoUrl || "",
      points: user.weeklyTokensEarned || user.weeklyTokens || 0,
      position: user.position,
    }));
  }, [leaderboardResponse]);

  // Use correct data based on scope
  const data =
    scope === "weekly" ? transformedWeeklyData : transformedAllTimeData;

  // Data is already sorted from backend
  const sorted = data;

  // Get current user info
  const currentUserId = profileData?.data?._id || profileData?.data?.id;
  const currentUserName =
    profileData?.data?.telegramFirstName ||
    currentUserData?.telegramFirstName ||
    "You";

  // Find current user's entry in the list
  const myRow = useMemo(() => {
    if (!currentUserId) return null;
    const found = sorted.find((u) => u.id === currentUserId);
    if (found) return found;
    // If not in top 100, create entry from currentUserData
    if (currentUserData && currentUserRank) {
      return {
        id: currentUserId,
        name: currentUserName,
        avatar: currentUserData.telegramPhotoUrl || "",
        points:
          scope === "weekly"
            ? currentUserData.weeklyTokensEarned || 0
            : currentUserData.token || 0,
      };
    }
    return null;
  }, [
    sorted,
    currentUserId,
    currentUserData,
    currentUserRank,
    scope,
    currentUserName,
  ]);

  // Top 3 + list remainder
  const top = sorted.slice(0, 3);
  const rest = sorted.slice(3, 100);

  // Loading state
  if (isLoading) {
    return (
      <div className={cls.page}>
        <div className="flex h-full items-center justify-center">
          <div className="text-lg text-white/70">Loading leaderboard...</div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className={cls.page}>
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <div className="text-lg text-red-400">
              Error loading leaderboard
            </div>
            <div className="mt-2 text-sm text-white/60">{error?.message}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cls.page}>
      <div className="h-full overflow-y-auto pb-3">
        <div className={cls.container}>
          {/* Header */}
          <header className="pt-6 text-center">
            <h1 className="text-[28px] font-extrabold tracking-tight">
              Leaderboard
            </h1>
            <p className={`${cls.subtleText} mt-1`}>
              Track your position and climb the ranks
            </p>
          </header>

          {/* Tabs */}
          <Segmented value={scope} onChange={setScope} cls={cls} />

          {/* Podium */}
          <section className="mb-10 mt-14">
            <div className="mx-auto flex max-w-[360px] items-end justify-center gap-4">
              {top.length >= 2 && (
                <Podium
                  name={top[1].name}
                  points={top[1].points}
                  rank={2}
                  avatar={top[1].avatar}
                />
              )}
              {top.length >= 1 && (
                <Podium
                  name={top[0].name}
                  points={top[0].points}
                  rank={1}
                  avatar={top[0].avatar}
                />
              )}
              {top.length >= 3 && (
                <Podium
                  name={top[2].name}
                  points={top[2].points}
                  rank={3}
                  avatar={top[2].avatar}
                />
              )}
            </div>
          </section>

          {/* My rank card */}
          <section className={`${cls.card} mt-6 p-4 text-center`}>
            {currentUserRank && myRow ? (
              <>
                <div className={cls.subtleText}>Your current rank</div>
                <div className="mt-1 text-2xl font-extrabold text-purple-300">
                  #{currentUserRank}
                </div>
                <div className="mt-1 text-xs text-white/70">
                  {fmt(myRow.points)} pts •{" "}
                  {scope === "weekly" ? "This week" : "All time"}
                </div>
                {currentUserRank > 100 && (
                  <div className="mt-2 text-xs text-amber-400">
                    Outside top 100 - Keep earning to climb!
                  </div>
                )}
              </>
            ) : (
              <div className="text-sm text-white/80">
                {scope === "weekly"
                  ? "Earn tokens this week to appear on the leaderboard."
                  : "Start completing tasks to appear on the board."}
              </div>
            )}
          </section>

          {/* Top 100 list */}
          <section className={`${cls.card} mt-6 p-4`}>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-[15px] font-semibold">Top 100</h2>
              <span className={`${cls.pill} px-2 py-1 text-white/80`}>
                {scope === "weekly" ? "Weekly" : "All Time"}
              </span>
            </div>
            <div
              className="max-h-[52vh] overflow-y-auto"
              role="list"
              aria-label="Top 100 users"
            >
              {rest.length > 0 ? (
                rest.map((u) => (
                  <Row
                    key={`${scope}-${u.id}`}
                    rank={u.position}
                    name={u.name}
                    points={u.points}
                    isMe={currentUserId && u.id === currentUserId}
                    avatar={u.avatar}
                  />
                ))
              ) : (
                <div className="py-8 text-center text-sm text-white/60">
                  No data available yet
                </div>
              )}
            </div>
          </section>

          {/* Sticky My Rank footer */}
          {myRow && (
            <footer className="z-20 px-4 pt-2">
              <div
                className={`${cls.card} flex items-center justify-between px-4 py-3`}
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-7 w-7 place-items-center rounded-md bg-purple-500/30 text-xs font-bold">
                    {currentUserRank ? `#${currentUserRank}` : "—"}
                  </div>
                  <div>
                    <div className="text-[12px] font-semibold text-white/90">
                      {myRow.name}
                    </div>
                    <div className="text-[11px] text-white/60">
                      {fmt(myRow.points)} pts
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-white/70">
                  <span className={`${cls.pill} px-2 py-1`}>
                    {scope === "weekly" ? "Weekly" : "All Time"}
                  </span>
                </div>
              </div>
            </footer>
          )}
        </div>
      </div>
    </div>
  );
}
