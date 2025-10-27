import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/header";

const Games = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen w-full overflow-y-auto bg-black text-white">
      <div className="mx-auto w-full max-w-md">
        {/* Header Section */}
        <div className="px-4 pt-4">
          <Header />
        </div>

        {/* Games Section */}
        <div className="px-6 py-12">
          <h1 className="mb-2 text-center text-3xl font-bold">Play Games</h1>
          <p className="mb-12 text-center text-gray-400">
            Choose your challenge
          </p>

          <div className="space-y-6">
            {/* Spin Wheel Button */}
            <button
              onClick={() => navigate("/spin")}
              className="w-full transform rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-6 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-purple-700 hover:to-pink-700 hover:shadow-purple-500/50"
            >
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <div className="mb-1 text-xl">🎡 Spin Wheel</div>
                  <div className="text-sm text-purple-100 opacity-90">
                    Test your luck
                  </div>
                </div>
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </button>

            {/* Quiz Button */}
            <button
              onClick={() => navigate("/home")}
              className="w-full transform rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-6 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-blue-700 hover:to-cyan-700 hover:shadow-blue-500/50"
            >
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <div className="mb-1 text-xl">🧠 Start Quiz</div>
                  <div className="text-sm text-blue-100 opacity-90">
                    Challenge yourself
                  </div>
                </div>
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Games;
