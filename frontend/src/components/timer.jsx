import { useEffect, useState } from "react";
import { SlidingNumber } from "./ui/sliding-numbers";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { getUserProfile } from "../api/user";

export function Timer() {
  const {
    data: profile,
    isLoading,
    isFetched,
  } = useQuery({
    queryKey: ["user-profile"],
    queryFn: getUserProfile,
  });

  const [timeLeft, setTimeLeft] = useState(null); // null initially
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!isFetched) return; // wait for profile to load

    const lastSpinAt = profile?.data?.lastSpinAt;

    if (!lastSpinAt) {
      // First-time user or no spin yet
      setTimeLeft(0);
      setIsRunning(false);
      return;
    }

    const lastSpin = dayjs(lastSpinAt);
    const nextSpin = lastSpin.add(24, "hour");
    const now = dayjs();
    const diffSeconds = Math.max(nextSpin.diff(now, "second"), 0);

    setTimeLeft(diffSeconds);
    setIsRunning(diffSeconds > 0);
  }, [isFetched, profile]);

  useEffect(() => {
    let interval;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  if (isLoading || timeLeft === null) {
    return <div className="text-white">Loading timer...</div>;
  }

  // Show "You can spin now" only when confirmed
  if (!isRunning || timeLeft <= 0) {
    return (
      <div className="text-sm font-semibold uppercase tracking-wide text-white">
        You can spin now!
      </div>
    );
  }

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-0.5 font-mono">
        <SlidingNumber value={hours} padStart={true} />
        <span className="mt-2 text-zinc-500">
          H <span className="text-sm text-white">:</span>
        </span>
        <SlidingNumber value={minutes} padStart={true} />
        <span className="mt-2 text-zinc-500">
          M <span className="text-sm text-white">:</span>
        </span>
        <SlidingNumber value={seconds} padStart={true} />
        <span className="mt-2 text-zinc-500">S</span>
      </div>
    </div>
  );
}
