import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/header";

const Games = () => {
  const navigate = useNavigate();

  return (
    <div className="h-[100dvh] min-h-screen w-full overflow-y-auto bg-black pb-20 text-white">
      <div className="mx-auto w-full max-w-md">
        {/* Header Section */}
        <div className="px-4 pt-4">
          <Header />
        </div>

        <div className="px-6 py-12">
          <h1 className="mb-2 text-2xl">Game Center</h1>
          {/* Games Section */}
          <div>
            <img
              src="/spin-frame.png"
              alt=""
              className="h-full w-full object-contain"
            />

            <div className="mt-2 flex items-center justify-between">
              <div>
                <h3 className="text-lg">Spin Wheel - Earn Prizes</h3>
                <p className="text-sm text-gray-400">
                  Reward : Free Course, Gadgets & more
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <button
                  onClick={() => navigate("/spin")}
                  className="rounded-full bg-gray-800 px-4 py-1 text-sm text-[#2283EE]"
                >
                  Play
                </button>
                <p className="text-xs text-gray-400">In-App Points</p>
              </div>
            </div>
          </div>
          {/* Quiz Section */}
          <div className="mt-5">
            <img
              src="/quiz-frame.png"
              alt=""
              className="h-full w-full object-contain"
            />

            <div className="mt-2 flex items-center justify-between">
              <div>
                <h3 className="text-lg">Play Quiz</h3>
                <p className="text-sm text-gray-400">
                  Education: Play & Earn Points
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <button
                  onClick={() => navigate("/home")}
                  className="rounded-full bg-gray-800 px-4 py-1 text-sm text-[#2283EE]"
                >
                  Play
                </button>
                <p className="text-xs text-gray-400">In-App Points</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Games;
