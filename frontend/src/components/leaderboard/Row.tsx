import React from "react";
import { Avatar } from "./Avatar";
import { fmt } from "../../pages/LeadNew";

const Row = React.memo(function Row({
  rank,
  name,
  points,
  isMe,
  avatar,
}: {
  rank: number;
  name: string;
  points: number;
  isMe: boolean;
  avatar: string;
}) {
  return (
    <div
      className={`flex items-center justify-between rounded-xl px-3 py-2 transition ${isMe ? "bg-gradient-to-r from-purple-500/20 to-fuchsia-500/20" : "hover:bg-white/5"}`}
      role="listitem"
      aria-label={`${name} rank ${rank}`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`grid h-6 w-6 place-items-center rounded-lg text-[11px] font-bold ${isMe ? "bg-purple-500/30" : "bg-white/10"}`}
        >
          #{rank}
        </div>
        <Avatar name={name} src={avatar} />
        <div>
          <div className="max-w-[180px] truncate text-[13px] font-semibold text-white/90">
            {name}
          </div>
          {isMe && <div className="text-[11px] text-purple-300">You</div>}
        </div>
      </div>
      <div className="text-[12px] font-semibold text-purple-300">
        {fmt(points)} pts
      </div>
    </div>
  );
});

export default Row;
