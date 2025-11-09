import { useState, useEffect } from "react";
import { RotateCw, CheckCircle2, XCircle, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/header";
import { generateQuiz } from "../lib/gemini";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { updateQuizResult } from "../api/token";
import { getUserProfile } from "../api/user";
import { playCash } from "../lib/sfx";

export default function QuizPage() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const queryClient = useQueryClient();

  const navigate = useNavigate();

  // Fetch profile to determine attempts left
  const { data: profileData, isLoading: loadingProfile } = useQuery({
    queryKey: ["user-profile"],
    queryFn: getUserProfile,
    retry: false,
  });

  const attemptsCount = profileData?.data?.quizAttemptsCount || 0;
  const attemptsDate = profileData?.data?.quizAttemptsDate
    ? new Date(profileData.data.quizAttemptsDate)
    : null;
  const now = new Date();
  const isSameDay =
    attemptsDate &&
    attemptsDate.getFullYear() === now.getFullYear() &&
    attemptsDate.getMonth() === now.getMonth() &&
    attemptsDate.getDate() === now.getDate();
  const effectiveCountToday = isSameDay ? attemptsCount : 0;
  const attemptsLeft = Math.max(0, 3 - effectiveCountToday);

  const loadQuizQuestions = async () => {
    setIsLoading(true);
    try {
      const topicsJson = sessionStorage.getItem("quizTopics");
      const topics = topicsJson ? JSON.parse(topicsJson) : ["RANDOM"];
      const quizQuestions = await generateQuiz(topics);
      const limitedQuestions = quizQuestions.slice(0, 10);
      setQuestions(limitedQuestions);
    } catch (error) {
      console.error("Failed to load quiz:", error);
      setQuestions([
        {
          id: 1,
          text: "What is one of the key technologies behind blockchain?",
          options: [
            "Distributed Ledger",
            "Floppy Disks",
            "VHS Tapes",
            "Dial-up Internet",
          ],
          correctAnswer: 0,
          explanation:
            "Distributed ledger technology is foundational to blockchain, allowing data to be stored across multiple nodes rather than in a single central location.",
        },
        {
          id: 2,
          text: "Which of these cryptocurrency projects focuses on smart contracts?",
          options: ["Bitcoin", "Ethereum", "Dogecoin", "Litecoin"],
          correctAnswer: 1,
          explanation:
            "Ethereum was the first blockchain platform to introduce robust smart contract functionality, enabling developers to build decentralized applications (dApps).",
        },
        {
          id: 3,
          text: "What does NFT stand for?",
          options: [
            "Non-Fungible Token",
            "New File Type",
            "Network File Transfer",
            "Native Function Token",
          ],
          correctAnswer: 0,
          explanation:
            "NFT stands for Non-Fungible Token, representing unique digital assets. Unlike cryptocurrencies where each token is identical, NFTs have unique properties making them distinct from one another.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (quizComplete) return;
    if (!loadingProfile && attemptsLeft === 0) {
      setIsLoading(false);
      setQuestions([]);
      return;
    }
    if (!loadingProfile && attemptsLeft > 0) {
      loadQuizQuestions();
    }
  }, [loadingProfile, attemptsLeft, quizComplete]);

  const handleSelectAnswer = (answerIndex) => {
    if (showFeedback) return;
    setSelectedAnswer(answerIndex);
    setShowFeedback(true);

    if (answerIndex === questions[currentQuestionIndex].correctAnswer) {
      setScore(score + 1);
    }
  };

  const { mutate } = useMutation({
    mutationFn: (token) => updateQuizResult(token.token),
    onSuccess: () => {
      playCash();
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
    onError: (error) => {
      console.error("❌ Error claiming reward:", error);
    },
  });

  const handleNextQuestion = () => {
    setShowFeedback(false);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
    } else {
      const earnedPoints = Math.min(Math.max(score * 20, 0), 100);
      setPointsEarned(earnedPoints);
      setQuizComplete(true);
      mutate({ token: earnedPoints });
    }
  };

  const handleTryAgain = async () => {
    await queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    const refreshed = await queryClient.refetchQueries({
      queryKey: ["user-profile"],
      type: "active",
    });
    const newProfile = refreshed?.[0]?.data;
    const newAttemptsCount = newProfile?.data?.quizAttemptsCount || 0;
    const newAttemptsDate = newProfile?.data?.quizAttemptsDate
      ? new Date(newProfile.data.quizAttemptsDate)
      : null;
    const now2 = new Date();
    const sameDay2 =
      newAttemptsDate &&
      newAttemptsDate.getFullYear() === now2.getFullYear() &&
      newAttemptsDate.getMonth() === now2.getMonth() &&
      newAttemptsDate.getDate() === now2.getDate();
    const left = Math.max(0, 3 - (sameDay2 ? newAttemptsCount : 0));

    if (left <= 0) {
      setQuizComplete(false);
      setQuestions([]);
      return;
    }

    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setQuizComplete(false);
    setShowFeedback(false);
    await loadQuizQuestions();
  };

  // Enhanced Loading Screen
  if (!quizComplete && isLoading && attemptsLeft > 0) {
    return (
      <div className="relative min-h-screen bg-[#1a1a2e]">
        <section className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center p-4">
          <div className="relative">
            {/* Outer rotating ring */}
            <div className="absolute -inset-4 animate-spin rounded-full border-4 border-[#6C63FF]/30"></div>
            {/* Middle pulsing ring */}
            <div className="absolute -inset-2 animate-pulse rounded-full border-4 border-[#6C63FF]/50"></div>
            {/* Inner spinning dots */}
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-[#6C63FF]/20">
              <div className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 animate-ping rounded-full bg-[#6C63FF]"></div>
            </div>
          </div>
          <div className="mt-8 animate-pulse text-2xl font-bold text-white">
            Generating your quiz...
          </div>
          <div className="mt-2 text-sm text-gray-400">This won't take long</div>
        </section>
      </div>
    );
  }

  // No attempts left
  if (!loadingProfile && attemptsLeft === 0) {
    return (
      <div className="relative min-h-screen bg-[#1a1a2e]">
        <section className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center p-4">
          <Header />
          <div className="mt-6 text-center text-2xl font-bold text-white">
            You've completed all 3 attempts for today
          </div>
          <p className="mt-2 text-center text-gray-400">
            Come back tomorrow for more quizzes!
          </p>
          <Link to="/home" className="mt-6">
            <button className="rounded-lg bg-[#6C63FF] px-8 py-3 font-semibold text-white transition-colors hover:bg-[#5952d4]">
              Back to Home
            </button>
          </Link>
        </section>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="relative min-h-screen bg-[#1a1a2e]">
        <section className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center p-4">
          <div className="text-center text-2xl font-bold text-white">
            Couldn't load quiz questions
          </div>
          <Link to="/home" className="mt-6">
            <button className="rounded-lg bg-[#6C63FF] px-8 py-3 font-semibold text-white">
              Back to Home
            </button>
          </Link>
        </section>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progressPercentage =
    ((currentQuestionIndex + 1) / questions.length) * 100;
  const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

  return (
    <div className="relative min-h-screen bg-[#1a1a2e]">
      <section className="relative mx-auto flex min-h-screen w-full max-w-md flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pb-4 pt-6">
          <button
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2a2a3e] text-white transition-colors hover:bg-[#3a3a4e]"
          >
            <X size={20} />
          </button>
          <div className="flex items-center gap-2 rounded-full bg-[#2a2a3e] px-4 py-2">
            <div className="h-2 w-2 rounded-full bg-[#6C63FF]"></div>
            <span className="text-sm font-semibold text-white">
              {currentQuestionIndex + 1} / {questions.length}
            </span>
          </div>
        </div>

        {/* Quiz Content */}
        {!quizComplete ? (
          <div className="flex flex-1 flex-col px-6 pb-8">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="h-2 w-full overflow-hidden rounded-full bg-[#2a2a3e]">
                <div
                  className="h-full rounded-full bg-[#6C63FF] transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>

            {/* Question Text */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold leading-tight text-white">
                {currentQuestion.text}
              </h2>
            </div>

            {/* Answer Options */}
            <div className="flex-1 space-y-3">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrectAnswer = index === currentQuestion.correctAnswer;
                const showCorrect = showFeedback && isCorrectAnswer;
                const showWrong =
                  showFeedback && isSelected && !isCorrectAnswer;

                return (
                  <button
                    key={index}
                    onClick={() => handleSelectAnswer(index)}
                    disabled={showFeedback}
                    className={`group relative w-full rounded-2xl px-6 py-4 text-left font-medium transition-all ${
                      showCorrect
                        ? "border-2 border-green-400 bg-green-500/20 text-white"
                        : showWrong
                          ? "border-2 border-red-400 bg-red-500/20 text-white"
                          : isSelected
                            ? "scale-[1.02] border-2 border-[#6C63FF] bg-[#6C63FF] text-white"
                            : "border-2 border-[#2a2a3e] bg-[#2a2a3e] text-white hover:border-[#4a4a5e] hover:bg-[#3a3a4e]"
                    }`}
                  >
                    <span className="block">{option}</span>
                    {showCorrect && (
                      <CheckCircle2
                        size={20}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-green-400"
                      />
                    )}
                    {showWrong && (
                      <XCircle
                        size={20}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-red-400"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation after answering */}
            {showFeedback && (
              <div
                className={`mt-6 rounded-2xl p-5 ${
                  isCorrect
                    ? "border border-green-400/30 bg-green-500/10"
                    : "border border-red-400/30 bg-red-500/10"
                }`}
              >
                <div className="mb-2 flex items-center">
                  {isCorrect ? (
                    <CheckCircle2 size={20} className="mr-2 text-green-400" />
                  ) : (
                    <XCircle size={20} className="mr-2 text-red-400" />
                  )}
                  <h3 className="font-bold text-white">
                    {isCorrect ? "Correct!" : "Incorrect!"}
                  </h3>
                </div>
                <p className="text-sm leading-relaxed text-white/80">
                  {currentQuestion.explanation}
                </p>
              </div>
            )}

            {/* Next Button */}
            <div className="mt-6">
              <button
                onClick={handleNextQuestion}
                disabled={!showFeedback}
                className={`w-full rounded-2xl py-4 text-lg font-bold transition-all ${
                  showFeedback
                    ? "bg-[#6C63FF] text-white hover:bg-[#5952d4]"
                    : "cursor-not-allowed bg-[#2a2a3e] text-gray-500"
                }`}
              >
                {currentQuestionIndex < questions.length - 1
                  ? "Next Question"
                  : "See Results"}{" "}
                🔒
              </button>
            </div>
          </div>
        ) : (
          /* Quiz Complete Screen */
          <div className="flex flex-1 flex-col justify-between px-6 pb-8">
            {/* Main Content */}
            <div className="flex flex-1 flex-col items-center justify-center space-y-6">
              {/* Score Circle */}
              <div className="relative h-40 w-40">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#2a2a3e"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#6C63FF"
                    strokeWidth="8"
                    strokeDasharray="283"
                    strokeDashoffset={283 - (score / questions.length) * 283}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                  <span className="text-4xl font-bold">
                    {score}/{questions.length}
                  </span>
                  <span className="text-sm text-gray-400">CORRECT</span>
                </div>
              </div>

              {/* Score Text */}
              <div className="text-center">
                <h2 className="mb-2 text-2xl font-bold text-white">
                  Quiz Complete!
                </h2>
                <p className="text-lg font-semibold text-gray-300">
                  You earned {pointsEarned} points
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex w-full flex-col gap-3">
              <button
                onClick={handleTryAgain}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#6C63FF] py-4 font-bold text-white transition-all hover:bg-[#5952d4]"
              >
                <RotateCw size={20} />
                Try Again
              </button>
              <Link to="/home" className="w-full">
                <button className="flex w-full items-center justify-center rounded-2xl border-2 border-[#2a2a3e] py-4 font-bold text-white transition-all hover:bg-[#2a2a3e]">
                  Back to Home
                </button>
              </Link>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
