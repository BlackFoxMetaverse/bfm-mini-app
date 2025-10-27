import { useState, useEffect } from "react";
import { User } from "lucide-react";
import Header from "../components/header";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getUserProfile } from "../api/user";
import { SpinModal } from "../components/ui/spin-modal";
import dayjs from "dayjs";

export default function HomePage() {
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [showSpinModal, setShowSpinModal] = useState(false);

  // Check if user can spin
  const { data: profileData, isLoading: loadingProfile } = useQuery({
    queryKey: ["user-profile"],
    queryFn: getUserProfile,
    retry: false,
  });

  // Determine if user can spin
  const isLoggedIn = !!profileData?.data;
  const lastSpin = profileData?.data?.lastSpinAt
    ? dayjs(profileData.data.lastSpinAt)
    : null;
  const nextSpinTime = lastSpin?.add(24, "hour");
  const now = dayjs();
  const canSpin = isLoggedIn && (!lastSpin || now.isAfter(nextSpinTime));

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

  // Show spin modal only on first login and if user can spin
  useEffect(() => {
    const isFromAuth = sessionStorage.getItem("showSpinModalOnHome");
    if (isFromAuth && isLoggedIn && canSpin && !loadingProfile) {
      setShowSpinModal(true);
      // Remove the flag so it doesn't show again on subsequent visits
      sessionStorage.removeItem("showSpinModalOnHome");
    }
  }, [isLoggedIn, canSpin, loadingProfile]);

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
    <div className="relative h-screen overflow-hidden bg-brandblue">
      <section className="relative mx-auto flex h-full w-full max-w-md flex-col items-center justify-between bg-brandblue p-4 pb-20">
        {/* Header with logo and user info */}
        <Header />

        <a
          href="https://invincibleread.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-md group relative mt-10 inline-flex animate-pulse cursor-pointer items-center gap-2 overflow-hidden rounded-xl border border-white/20 bg-white/10 px-4 py-2 font-semibold text-white shadow-md backdrop-blur-md transition-all duration-1000 hover:scale-105 hover:bg-white/20 active:scale-95"
        >
          {/* Text */}
          <span className="relative z-10">Private Sale Is Live!!</span>

          {/* Shiny hover overlay */}
          <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-white/30 to-transparent opacity-0 transition-all duration-700 group-hover:translate-x-full group-hover:opacity-100"></span>
        </a>

        {/* Main Content Container */}
        <div className="flex w-full flex-1 flex-col items-center justify-center space-y-4">
          {/* Quiz Start Section */}
          <div className="text-center">
            <h2 className="text-2xl font-bold leading-tight text-background sm:text-3xl">
              WANNA
              <br />
              START YOUR
              <br />
              QUIZ?
            </h2>
          </div>

          {/* Interests Selection */}
          <div className="w-full px-4">
            <p className="mb-3 text-center text-xs font-medium text-background">
              SELECT YOUR INTERESTS
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {interests.map((interest) => (
                <button
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={`z-10 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    selectedInterests.includes(interest)
                      ? "border border-background bg-background text-brandblue"
                      : "border border-background bg-transparent text-background hover:bg-background/10"
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>

          {/* Start Quiz Section */}
          <div className="text-center">
            <h2 className="mb-4 text-xl font-bold text-background sm:text-2xl">
              START QUIZ
            </h2>

            {/* Attempts left indicator */}
            <p className="mb-2 text-center text-xs font-medium text-background">
              Attempts left today: {loadingProfile ? "-" : attemptsLeft}
            </p>

            {/* Quiz Button Wrapper */}
            <div className="relative mx-auto h-20 w-20 sm:h-24 sm:w-24">
              {/* Animated Pulsing Circles */}
              <div className="absolute inset-2 animate-pulse rounded-full bg-zinc-400 opacity-20"></div>
              <div className="absolute inset-1 animate-pulse rounded-full bg-zinc-300 opacity-30 delay-1000"></div>
              <div className="delay-2000 absolute inset-0 animate-pulse rounded-full bg-zinc-200 opacity-40"></div>

              {/* Actual Quiz Button */}
              {canStartQuiz ? (
                <Link to="/quiz">
                  <button
                    onClick={handleStartQuiz}
                    className="absolute inset-2 flex items-center justify-center rounded-full bg-background text-brandblue transition-all duration-200 hover:bg-background/90"
                  >
                    <span className="text-2xl font-extrabold sm:text-3xl">
                      →
                    </span>
                  </button>
                </Link>
              ) : (
                <button
                  disabled
                  className="absolute inset-2 flex items-center justify-center rounded-full bg-background/40 text-brandblue/50"
                  title="No attempts left today"
                >
                  <span className="text-2xl font-extrabold sm:text-3xl">→</span>
                </button>
              )}
            </div>
            {!canStartQuiz && (
              <p className="mt-2 text-center text-xs text-background/80">
                You have reached your 3 quiz attempts for today. Try again
                tomorrow.
              </p>
            )}
          </div>
        </div>

        {/* Background decoration elements */}
        <div className="absolute left-20 top-0 z-0 h-16 w-12 animate-pulse bg-white/40"></div>
        <div className="absolute left-0 top-20 z-0 h-12 w-12 animate-pulse bg-white/20"></div>
        <div className="absolute bottom-32 left-0 z-0 h-12 w-12 animate-pulse bg-white/20"></div>
        <div className="absolute bottom-40 left-16 z-0 h-12 w-12 animate-pulse bg-white/10"></div>
        <div className="absolute bottom-32 right-0 z-0 h-12 w-12 animate-pulse bg-white/30"></div>
        <div className="absolute bottom-40 right-16 z-0 h-12 w-12 animate-pulse bg-white/10"></div>
      </section>

      {/* Spin Modal */}
      <SpinModal
        isOpen={showSpinModal}
        onClose={() => setShowSpinModal(false)}
      />
    </div>
  );
}
