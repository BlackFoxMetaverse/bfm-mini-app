import { useState, useEffect } from "react";
import { RotateCw, CheckCircle2, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
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
  // Shared loader to (re)generate questions
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
          text: "WHAT IS ONE OF THE KEY TECHNOLOGIES BEHIND BLOCKCHAIN?",
          options: [
            "DISTRIBUTED LEDGER",
            "FLOPPY DISKS",
            "VHS TAPES",
            "DIAL-UP INTERNET",
          ],
          correctAnswer: 0,
          explanation:
            "Distributed ledger technology is foundational to blockchain, allowing data to be stored across multiple nodes rather than in a single central location.",
          image:
            "https://images.unsplash.com/photo-1639322537228-f710d846310a?w=800&auto=format&fit=crop",
        },
        {
          id: 2,
          text: "WHICH OF THESE CRYPTOCURRENCY PROJECTS FOCUSES ON SMART CONTRACTS?",
          options: ["BITCOIN", "ETHEREUM", "DOGECOIN", "LITECOIN"],
          correctAnswer: 1,
          explanation:
            "Ethereum was the first blockchain platform to introduce robust smart contract functionality, enabling developers to build decentralized applications (dApps).",
          image:
            "https://images.unsplash.com/photo-1622630998477-20aa696ecb05?w=800&auto=format&fit=crop",
        },
        {
          id: 3,
          text: "WHAT DOES NFT STAND FOR?",
          options: [
            "NON-FUNGIBLE TOKEN",
            "NEW FILE TYPE",
            "NETWORK FILE TRANSFER",
            "NATIVE FUNCTION TOKEN",
          ],
          correctAnswer: 0,
          explanation:
            "NFT stands for Non-Fungible Token, representing unique digital assets. Unlike cryptocurrencies where each token is identical, NFTs have unique properties making them distinct from one another.",
          image:
            "https://images.unsplash.com/photo-1645937367476-bbeaa0184edb?w=800&auto=format&fit=crop",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load questions when component mounts
  useEffect(() => {
    if (quizComplete) return; // Do not auto-load while showing results screen
    if (!loadingProfile && attemptsLeft === 0) {
      setIsLoading(false);
      setQuestions([]);
      return; // Block loading quiz when no attempts left
    }
    if (!loadingProfile && attemptsLeft > 0) {
      loadQuizQuestions();
    }
  }, [loadingProfile, attemptsLeft, quizComplete]);

  const handleSelectAnswer = (answerIndex) => {
    if (showFeedback) return; // Prevent changing answer during feedback
    setSelectedAnswer(answerIndex);
    setShowFeedback(true);

    // Check if answer is correct and update score
    if (answerIndex === questions[currentQuestionIndex].correctAnswer) {
      setScore(score + 1);
    }
  };
  const { mutate } = useMutation({
    mutationFn: (token) => updateQuizResult(token.token),
    onSuccess: () => {
      playCash();
      // Refetch profile so header points and attempts update immediately
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
    onError: (error) => {
      console.error("❌ Error claiming reward:", error);
    },
  });
  const handleNextQuestion = () => {
    setShowFeedback(false);

    // Move to next question or end quiz
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
    } else {
      // Calculate points earned - 20 points per correct answer, clamped to [0,100]
      // This ensures quiz rewards are always between 0 and 100 points
      // const earnedPoints = score * 100 + Math.floor(Math.random() * 500);
      const earnedPoints = Math.min(Math.max(score * 20, 0), 100);
      setPointsEarned(earnedPoints);
      setQuizComplete(true);
      mutate({ token: earnedPoints });
    }
  };

  const handleTryAgain = async () => {
    // Refresh profile to get updated attempts after last completion
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
      // No attempts left
      setQuizComplete(false);
      setQuestions([]);
      return;
    }

    // Reset state and load new questions
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setQuizComplete(false);
    setShowFeedback(false);
    await loadQuizQuestions();
  };

  // If we're still loading questions (and attempts remain), show a loading screen
  if (!quizComplete && isLoading && attemptsLeft > 0) {
    return (
      <div className="relative min-h-screen bg-brandblue">
        <section className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center bg-brandblue p-4">
          <div className="animate-pulse text-2xl font-bold text-white">
            Generating your quiz...
          </div>
          <div className="mt-4 h-10 w-10 animate-spin rounded-full border-4 border-white border-t-transparent"></div>
        </section>
      </div>
    );
  }

  // Block when no attempts left
  if (!loadingProfile && attemptsLeft === 0) {
    return (
      <div className="relative min-h-screen bg-brandblue">
        <section className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center bg-brandblue p-4">
          <Header />
          <div className="mt-6 text-center text-2xl font-bold text-white">
            You have reached your 3 quiz attempts for today.
          </div>
          <p className="mt-2 text-center text-white/80">Try again tomorrow.</p>
          <Link to="/home" className="mt-6">
            <button className="rounded-md border border-background px-6 py-3 text-background">
              Back to Home
            </button>
          </Link>
        </section>
      </div>
    );
  }

  // Don't try to access questions if there are none
  if (questions.length === 0) {
    return (
      <div className="relative min-h-screen bg-brandblue">
        <section className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center bg-brandblue p-4">
          <div className="text-2xl font-bold text-white">
            Couldn't load quiz questions. Please try again.
          </div>
          <Link
            to="/home"
            className="mt-6 rounded-md bg-white px-6 py-3 text-brandblue"
          >
            Back to Home
          </Link>
        </section>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progressPercentage = (currentQuestionIndex / questions.length) * 100;
  const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

  return (
    <div className="relative h-screen overflow-hidden bg-brandblue">
      <section className="relative mx-auto flex h-full w-full max-w-md flex-col bg-brandblue p-4">
        <Header />

        {/* Quiz Content */}
        {!quizComplete ? (
          <div className="flex flex-1 flex-col overflow-y-auto px-0 pb-20">
            {/* Progress Bar */}
            <div className="mb-6 flex w-full items-center">
              <div className="h-1 w-full rounded-full bg-background/30">
                <div
                  className="h-1 rounded-full bg-background"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>

            {/* Question Number */}
            <div className="mb-4">
              <h3 className="inline-block border-b border-background pb-1 text-lg font-semibold text-background">
                QUESTION {currentQuestionIndex + 1} OF {questions.length}
              </h3>
            </div>

            {/* Question Text */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-background">
                {currentQuestion.text}
              </h2>
            </div>

            {/* Answer Options */}
            <div className="mt-4 space-y-3">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectAnswer(index)}
                  disabled={showFeedback}
                  className={`relative w-full rounded-md border px-4 py-3 text-left transition-colors ${
                    showFeedback && index === currentQuestion.correctAnswer
                      ? "border-green-400 bg-green-400/20 text-white"
                      : showFeedback &&
                          selectedAnswer === index &&
                          selectedAnswer !== currentQuestion.correctAnswer
                        ? "border-red-400 bg-red-400/20 text-white"
                        : selectedAnswer === index
                          ? "border-background bg-background text-brandblue"
                          : "border-background bg-transparent text-white hover:bg-background/10"
                  }`}
                >
                  {option}
                  {showFeedback && index === currentQuestion.correctAnswer && (
                    <CheckCircle2
                      size={18}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-green-400"
                    />
                  )}
                  {showFeedback &&
                    selectedAnswer === index &&
                    selectedAnswer !== currentQuestion.correctAnswer && (
                      <XCircle
                        size={18}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-red-400"
                      />
                    )}
                </button>
              ))}
            </div>

            {/* Explanation after answering */}
            {showFeedback && (
              <div
                className={`mt-6 rounded-md p-4 ${
                  isCorrect ? "bg-green-500/10" : "bg-red-500/10"
                }`}
              >
                <div className="mb-2 flex items-center">
                  {isCorrect ? (
                    <CheckCircle2 size={20} className="mr-2 text-green-400" />
                  ) : (
                    <XCircle size={20} className="mr-2 text-red-400" />
                  )}
                  <h3 className="font-bold text-background">
                    {isCorrect ? "Correct!" : "Incorrect!"}
                  </h3>
                </div>
                <p className="text-sm text-background">
                  {currentQuestion.explanation}
                </p>
              </div>
            )}

            {/* Next Button */}
            <div className="mt-8 flex justify-center">
              <button
                onClick={handleNextQuestion}
                disabled={selectedAnswer === null || !showFeedback}
                className={`flex h-14 w-14 items-center justify-center rounded-full ${
                  selectedAnswer !== null && showFeedback
                    ? "bg-background text-brandblue"
                    : "bg-background/50 text-brandblue/50"
                }`}
              >
                <span className="text-2xl font-bold">→</span>
              </button>
            </div>
          </div>
        ) : (
          /* Quiz Complete Screen */
          <div className="flex flex-1 flex-col justify-between">
            {/* Main Content */}
            <div className="flex flex-1 flex-col items-center justify-center space-y-4">
              {/* Owl Logo Large */}
              <div className="rounded-full bg-accent p-4">
                <img src="/logo-light.png" alt="Owl logo" className="h-8 w-8" />
              </div>

              {/* Score Text */}
              <h2 className="text-2xl font-bold text-background">YOU EARNED</h2>
              <p className="text-lg font-bold text-background">
                {pointsEarned} Read POINTS
              </p>

              {/* Score Circle */}
              <div className="relative h-32 w-32">
                <svg className="h-full w-full" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="10"
                    strokeOpacity="0.2"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="10"
                    strokeDasharray="283"
                    strokeDashoffset={283 - (score / questions.length) * 283}
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-background">
                  <span className="text-3xl font-bold">
                    {score}/{questions.length}
                  </span>
                  <span className="text-sm">CORRECT</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex w-full flex-col gap-3">
              <button
                onClick={handleTryAgain}
                className="flex w-full items-center justify-center rounded-md bg-background py-3 text-brandblue"
              >
                <RotateCw size={16} className="mr-2" />
                TRY AGAIN
              </button>
              <Link to="/home">
                <button className="flex w-full items-center justify-center rounded-md border border-background py-3 text-background">
                  BACK
                </button>
              </Link>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
