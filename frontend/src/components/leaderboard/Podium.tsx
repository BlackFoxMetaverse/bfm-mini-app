import { useMemo } from "react";
import { motion } from "framer-motion";
import { Crown, Trophy } from "lucide-react";
import { fmt } from "../../pages/LeadNew";

interface PodiumProps {
  name: string;
  points: number;
  rank: number;
  avatar: string;
}

const Avatar = ({ name, src }: { name: string; src: string }) => {
  const initials = useMemo(
    () => (name || "?").slice(0, 2).toUpperCase(),
    [name],
  );

  return (
    <>
      {src ? (
        <img
          src={src}
          alt={name}
          className="h-full w-full rounded-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-purple-700/50 to-fuchsia-600/40 text-xs font-bold text-white/90">
          {initials}
        </div>
      )}
    </>
  );
};

const Podium = ({ name, points, rank, avatar }: PodiumProps) => {
  const height = rank === 1 ? 132 : rank === 2 ? 104 : 88;
  const medalColor =
    rank === 1
      ? "from-yellow-400 to-amber-500"
      : rank === 2
        ? "from-zinc-300 to-slate-200"
        : "from-amber-600 to-yellow-500";
  const ring =
    rank === 1
      ? "shadow-[0_0_28px_rgba(250,204,21,0.55)] border-yellow-300/70"
      : rank === 2
        ? "shadow-[0_0_24px_rgba(212,212,216,0.45)] border-zinc-200/70"
        : "shadow-[0_0_24px_rgba(245,158,11,0.45)] border-amber-300/70";
  const standClasses =
    rank === 1
      ? "bg-gradient-to-br from-yellow-200/90 to-yellow-500/90"
      : rank === 2
        ? "bg-[#EBEBEB]"
        : "bg-[#FFD1B8]";

  return (
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 120, damping: 16 }}
      className="relative flex w-28 flex-col items-center text-center"
    >
      {/* Crown for 1st place */}
      {rank === 1 && (
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          className="absolute -top-8 z-10"
        >
          <Crown className="h-7 w-7 fill-yellow-400 text-yellow-500" />
        </motion.div>
      )}

      {/* Avatar with rank badge */}
      <div
        className={`relative flex h-16 w-16 items-center justify-center rounded-full border-2 ${ring}`}
      >
        <Avatar name={name} src={avatar} />
        <div
          className={`absolute -bottom-1 -right-1 rounded-full bg-gradient-to-br ${medalColor} p-[3px] shadow-lg`}
        >
          <div className="flex h-4 w-4 items-center justify-center rounded-full bg-black/40 text-[10px] font-extrabold text-white">
            {rank}
          </div>
        </div>
      </div>

      {/* Name */}
      <div className="mt-2 w-[110%] truncate text-xs font-semibold leading-tight text-white/90">
        {name}
      </div>

      {/* Points */}
      <div className="mt-0.5 flex items-center gap-1 text-[13px] text-purple-300">
        <span className="text-yellow-400">⭐</span>
        <span>{fmt(points)} pts</span>
      </div>

      {/* Podium Stand */}
      <div
        className="relative mt-2 flex w-[95%] origin-bottom items-center justify-center rounded-xl"
        style={{ height }}
      >
        <div
          style={{
            boxShadow:
              rank === 1
                ? ""
                : rank === 2
                  ? "5px 5px #919191"
                  : "-5px 5px #D55F1D",
          }}
          className={`absolute inset-0 rounded-xl ${standClasses}`}
        />
        <div className="absolute -bottom-3 left-1/2 h-6 w-[80%] -translate-x-1/2 rounded-full bg-zinc-300/30 blur-xl" />

        {/* Trophy Icon */}
        <Trophy
          className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20 ${
            rank === 1
              ? "h-16 w-16 text-yellow-900"
              : rank === 2
                ? "h-14 w-14 text-gray-400"
                : "h-14 w-14 text-orange-600"
          }`}
        />

        {/* Rank Number */}
        <h1
          className={`relative z-10 text-2xl font-bold ${
            rank === 1
              ? "text-yellow-900"
              : rank === 2
                ? "text-[#8B8B8B]"
                : "text-[#D55F1D]"
          }`}
        >
          {rank}
        </h1>
      </div>
    </motion.div>
  );
};

export default Podium;
