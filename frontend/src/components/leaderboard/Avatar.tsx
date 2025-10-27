"use client";

import { useMemo } from "react";

/** Avatar with fallback initials */
export function Avatar({ name, src }: { name: string; src: string }) {
  const initials = useMemo(
    () => (name || "?").slice(0, 2).toUpperCase(),
    [name],
  );
  return (
    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-purple-400/30 bg-purple-900/40">
      {src ? (
        <img alt={name} src={src} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-700/50 to-fuchsia-600/40 text-xs font-bold text-white/90">
          {initials}
        </div>
      )}
    </div>
  );
}
