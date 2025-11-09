import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/header";
import { Play, Trophy, Zap } from "lucide-react";

const Games = () => {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState({
    spin: false,
    quiz: false,
  });

  const games = [
    {
      id: "spin",
      title: "Spin Wheel",
      subtitle: "Earn Amazing Prizes",
      description: "Free courses, gadgets & exclusive rewards",
      image: "/spin-frame.png",
      route: "/spin",
      color: "#6C63FF",
      icon: Trophy,
    },
    {
      id: "quiz",
      title: "Play Quiz",
      subtitle: "Test Your Knowledge",
      description: "Educational quizzes with exciting points",
      image: "/quiz-frame.png",
      route: "/home",
      color: "#6C63FF",
      icon: Zap,
    },
  ];

  return (
    <div className="min-h-screen w-full overflow-y-auto bg-[#1a1a2e] pb-24">
      <div className="mx-auto w-full max-w-md">
        {/* Header Section */}
        <div className="px-4 pt-4">
          <Header />
        </div>

        {/* Hero Section */}
        <div className="px-6 py-8">
          <div className="mb-2">
            <h1 className="text-3xl font-bold text-white">Game Center</h1>
            <p className="text-sm text-gray-400">Choose your game and start earning</p>
          </div>

          {/* Games Grid */}
          <div className="mt-8 space-y-5">
            {games.map((game) => {
              const Icon = game.icon;
              return (
                <div
                  key={game.id}
                  className="group relative overflow-hidden rounded-3xl bg-[#2a2a3e] transition-all hover:scale-[1.02]"
                >
                  {/* Game Image with Skeleton */}
                  <div className="relative aspect-[16/9] w-full overflow-hidden rounded-t-3xl">
                    {/* Skeleton Loader */}
                    {!imageLoaded[game.id] && (
                      <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-[#2a2a3e] via-[#3a3a4e] to-[#2a2a3e]">
                        <div className="flex h-full items-center justify-center">
                          <div className="h-16 w-16 animate-spin rounded-full border-4 border-[#6C63FF] border-t-transparent"></div>
                        </div>
                      </div>
                    )}
                    
                    {/* Actual Image */}
                    <img
                      src={game.image}
                      alt={game.title}
                      onLoad={() =>
                        setImageLoaded((prev) => ({ ...prev, [game.id]: true }))
                      }
                      className={`h-full w-full object-cover transition-opacity duration-500 ${
                        imageLoaded[game.id] ? "opacity-100" : "opacity-0"
                      }`}
                    />
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#2a2a3e] via-transparent to-transparent opacity-60"></div>
                  </div>

                  {/* Game Info */}
                  <div className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <Icon size={20} className="text-[#6C63FF]" />
                          <h3 className="text-xl font-bold text-white">
                            {game.title}
                          </h3>
                        </div>
                        <p className="text-sm font-semibold text-gray-300">
                          {game.subtitle}
                        </p>
                        <p className="mt-2 text-xs text-gray-400">
                          {game.description}
                        </p>
                        
                        {/* Points Badge */}
                        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#6C63FF]/20 px-3 py-1">
                          <Zap size={12} className="text-[#6C63FF]" />
                          <span className="text-xs font-semibold text-[#6C63FF]">
                            In-App Points
                          </span>
                        </div>
                      </div>

                      {/* Play Button */}
                      <button
                        onClick={() => navigate(game.route)}
                        className="group/btn relative flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#6C63FF] transition-all hover:bg-[#5952d4] hover:scale-110"
                      >
                        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover/btn:translate-x-full"></div>
                        <Play size={20} className="relative text-white" fill="white" />
                      </button>
                    </div>
                  </div>

                  {/* Hover Glow Effect */}
                  <div className="absolute -inset-0.5 -z-10 rounded-3xl bg-gradient-to-r from-[#6C63FF] to-[#5952d4] opacity-0 blur-xl transition-opacity group-hover:opacity-20"></div>
                </div>
              );
            })}
          </div>

          {/* Stats Section */}
          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-[#2a2a3e] p-4 text-center">
              <div className="mb-1 text-2xl font-bold text-white">2</div>
              <div className="text-xs text-gray-400">Games Available</div>
            </div>
            <div className="rounded-2xl bg-[#2a2a3e] p-4 text-center">
              <div className="mb-1 text-2xl font-bold text-[#6C63FF]">∞</div>
              <div className="text-xs text-gray-400">Points to Earn</div>
            </div>
          </div>

          {/* Info Card */}
          <div className="mt-6 rounded-2xl border border-[#6C63FF]/20 bg-[#6C63FF]/10 p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 rounded-full bg-[#6C63FF]/20 p-2">
                <Zap size={16} className="text-[#6C63FF]" />
              </div>
              <div>
                <h4 className="mb-1 text-sm font-semibold text-white">
                  How to Earn Points?
                </h4>
                <p className="text-xs leading-relaxed text-gray-300">
                  Play games, complete quizzes, and spin the wheel to earn in-app points. 
                  Collect points to unlock exclusive rewards and prizes!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Games;