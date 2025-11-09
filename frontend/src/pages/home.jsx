import { useState } from "react";
import Header from "../components/header";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getUserProfile } from "../api/user";
import dayjs from "dayjs";

export default function HomePage() {
  const [selectedInterests, setSelectedInterests] = useState([]);

  // Check if user can spin
  const { data: profileData, isLoading: loadingProfile } = useQuery({
    queryKey: ["user-profile"],
    queryFn: getUserProfile,
    retry: false,
  });

  // Determine if user can spin
  const isLoggedIn = !!profileData?.data;

  const now = dayjs();

  // Quiz attempts left today
  const attemptsCount = profileData?.data?.quizAttemptsCount || 0;
  const attemptsDate = profileData?.data?.quizAttemptsDate
    ? dayjs(profileData.data.quizAttemptsDate)
    : null;
  const isSameCalendarDay = attemptsDate
    ? attemptsDate.isSame(now, "day")
    : false;
  const effectiveCountToday = isSameCalendarDay ? attemptsCount : 0;
  const attemptsLeft = Math.max(0, 3 - effectiveCountToday);
  const canStartQuiz = isLoggedIn && attemptsLeft > 0;

  const interests = [
    "AI",
    "BLOCKCHAIN",
    "NFT",
    "WEB3",
    "CRYPTO",
    "QUANTUM",
    "METAVERSE",
    "AR",
    "VR",
    "XR",
  ];

  const toggleInterest = (interest) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((item) => item !== interest)
        : [...prev, interest],
    );
  };

  const handleStartQuiz = () => {
    // Save selected interests to session storage for the quiz page
    sessionStorage.setItem("quizTopics", JSON.stringify(selectedInterests));
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#1a1a2e]">
      <section className="relative mx-auto flex min-h-screen w-full max-w-md flex-col bg-[#1a1a2e] p-6 pb-24">
        {/* Header with logo and user info */}
        <Header />

        {/* Main Content Container */}
        <div className="flex w-full pt-10 flex-1 flex-col items-center justify-center space-y-8">
          {/* Quiz Start Section */}
          <div className="space-y-2 text-center">
            <h1 className="text-4xl font-bold leading-tight text-white">
              Ready to Test
              <br />
              Your Knowledge?
            </h1>
            <p className="text-sm text-gray-400">
              Choose your interests and start the quiz
            </p>
          </div>

          {/* Interests Selection */}
          <div className="w-full">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold text-white">Select Topics</p>
              <span className="text-xs text-gray-400">
                {selectedInterests.length} selected
              </span>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {interests.map((interest) => (
                <button
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    selectedInterests.includes(interest)
                      ? "scale-105 bg-[#6C63FF] text-white"
                      : "bg-[#2a2a3e] text-gray-300 hover:bg-[#3a3a4e]"
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>

          {/* Quiz Stats Card */}
          <div className="w-full space-y-4 rounded-2xl bg-[#2a2a3e] p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Attempts Today</p>
                <p className="text-2xl font-bold text-white">
                  {loadingProfile ? "-" : effectiveCountToday}/3
                </p>
              </div>
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 w-8 rounded-full ${
                      i < effectiveCountToday ? "bg-[#6C63FF]" : "bg-[#3a3a4e]"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-[#3a3a4e] pt-2">
              <div>
                <p className="text-sm text-gray-400">Attempts Left</p>
                <p className="text-xl font-bold text-[#6C63FF]">
                  {loadingProfile ? "-" : attemptsLeft}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">Points per Quiz</p>
                <p className="text-xl font-bold text-white">Up to 100</p>
              </div>
            </div>
          </div>

          {/* Start Quiz Button */}
          {canStartQuiz ? (
            <Link to="/quiz" className="w-full">
              <button
                onClick={handleStartQuiz}
                className="group relative w-full overflow-hidden rounded-2xl bg-[#6C63FF] p-6 transition-all hover:scale-[1.02] hover:bg-[#5952d4]"
              >
                {/* Animated background effect */}
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full"></div>

                <div className="relative flex items-center justify-between">
                  <div className="text-left">
                    <p className="text-sm font-medium text-white/80">Ready?</p>
                    <p className="text-2xl font-bold text-white">Start Quiz</p>
                  </div>
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="transition-transform group-hover:translate-x-1"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>
            </Link>
          ) : (
            <div className="w-full">
              <button
                disabled
                className="w-full cursor-not-allowed rounded-2xl bg-[#2a2a3e] p-6 opacity-60"
              >
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-400">
                      No attempts left
                    </p>
                    <p className="text-2xl font-bold text-gray-500">
                      Come back tomorrow
                    </p>
                  </div>
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/5">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-gray-500"
                    >
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                </div>
              </button>
              <p className="mt-3 text-center text-sm text-gray-400">
                You've completed all 3 attempts today. New attempts reset at
                midnight.
              </p>
            </div>
          )}

          {/* Tips Section */}
          <div className="w-full space-y-2">
            <p className="text-xs font-semibold uppercase text-gray-400">
              Quick Tips
            </p>
            <div className="space-y-2">
              <div className="flex items-start gap-3 rounded-xl bg-[#2a2a3e] p-3">
                <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#6C63FF]/20">
                  <div className="h-2 w-2 rounded-full bg-[#6C63FF]"></div>
                </div>
                <p className="text-sm text-gray-300">
                  Select topics you're interested in for personalized questions
                </p>
              </div>
              <div className="flex items-start gap-3 rounded-xl bg-[#2a2a3e] p-3">
                <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#6C63FF]/20">
                  <div className="h-2 w-2 rounded-full bg-[#6C63FF]"></div>
                </div>
                <p className="text-sm text-gray-300">
                  Each quiz has 10 questions worth up to 100 points
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute left-4 top-20 h-32 w-32 rounded-full bg-[#6C63FF]/5 blur-3xl"></div>
        <div className="absolute bottom-40 right-4 h-32 w-32 rounded-full bg-[#6C63FF]/5 blur-3xl"></div>
      </section>
    </div>
  );
}
