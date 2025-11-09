// ========== TASK.TSX ==========

import React, { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { FaInstagram, FaLinkedinIn } from "react-icons/fa";
import Header from "../components/header";
import { useNavigate } from "react-router-dom";

export default function Tasks() {
  const [taskStates, setTaskStates] = useState({});

  const navigate = useNavigate();

  // Load saved states from memory on mount
  useEffect(() => {
    const saved = {};
    tasks.forEach((task) => {
      const state = sessionStorage.getItem(`task_${task.id}`);
      if (state) {
        saved[task.id] = state;
      }
    });
    setTaskStates(saved);
  }, []);

  const tasks = [
    {
      id: 1,
      title: "Follow X",
      points: "1000 BFM Points",
      icon: null,
      bgColor: "bg-blue-100",
      url: "https://x.com/BFMAcademy",
    },
    {
      id: 2,
      title: "Telegram Community",
      points: "1000 BFM Points",
      icon: null,
      bgColor: "bg-blue-100",
      url: "https://t.me/bfm_academy",
    },
    {
      id: 3,
      title: "Instagram",
      points: "1000 BFM Points",
      icon: <FaInstagram className="h-10 w-10" />,
      bgColor: "bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500",
      url: "https://www.instagram.com/bfmacademia/",
    },
    {
      id: 4,
      title: "Linkedin",
      points: "1000 BFM Points",
      icon: <FaLinkedinIn className="h-8 w-8 text-white" />,
      bgColor: "bg-blue-600",
      url: "https://www.linkedin.com/company/bfm-academy/",
    },
  ];

  const handleTaskClick = (task, e) => {
    e.preventDefault();
    e.stopPropagation();

    const currentState = taskStates[task.id];
    console.log(
      "Clicked task:",
      task.title,
      "Current state:",
      currentState,
      "URL:",
      task.url,
    );

    if (!currentState || currentState === "start") {
      // Open the task URL - direct approach
      console.log("Opening URL:", task.url);
      window.open(task.url, "_blank");

      // Update state to 'check' immediately
      setTaskStates((prev) => ({ ...prev, [task.id]: "check" }));
      sessionStorage.setItem(`task_${task.id}`, "check");
    } else if (currentState === "check") {
      // Start verification (spinning for 5 seconds)
      setTaskStates((prev) => ({ ...prev, [task.id]: "verifying" }));
      sessionStorage.setItem(`task_${task.id}`, "verifying");

      setTimeout(() => {
        setTaskStates((prev) => ({ ...prev, [task.id]: "claim" }));
        sessionStorage.setItem(`task_${task.id}`, "claim");
      }, 5000);
    } else if (currentState === "claim") {
      // Claim the reward
      setTaskStates((prev) => ({ ...prev, [task.id]: "done" }));
      sessionStorage.setItem(`task_${task.id}`, "done");
    }
  };

  const getButtonContent = (taskId) => {
    const state = taskStates[taskId];

    switch (state) {
      case "check":
        return <>Check</>;
      case "verifying":
        return (
          <>
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          </>
        );
      case "claim":
        return "Claim";
      case "done":
        return (
          <>
            <Check className="h-5 w-5" />
          </>
        );
      default:
        return "Start";
    }
  };

  const getButtonStyles = (taskId) => {
    const state = taskStates[taskId];
    const baseStyles =
      "rounded-xl px-6 py-2.5 font-semibold text-white transition-colors flex items-center gap-2";

    if (state === "done") {
      return `rounded-full h-5 w-5 text-white flex items-center bg-black cursor-default p-1`;
    }
    if (state === "verifying") {
      return `${baseStyles} bg-gradient-to-r from-[#2930DC] to-[#080A94] cursor-wait`;
    }
    return `${baseStyles} bg-gradient-to-r from-[#2930DC] to-[#080A94] hover:opacity-90`;
  };

  const handleInviteClick = () => {
    navigate("/invite");
  };

  return (
    <div className="min-h-screen w-full bg-black pb-12 text-white">
      <div className="px-4 pt-4">
        <Header />
      </div>
      <div className="space-y-6 px-6 py-12">
        {/* Invite Section */}
        <div className="block cursor-pointer" onClick={handleInviteClick}>
          <div>
            <h2 className="mb-4 text-xl font-bold">
              Invite Friends & get more points
            </h2>
            <div className="flex items-center justify-between rounded-3xl bg-white p-5">
              <div>
                <h3 className="text-lg font-bold text-black">Refer & Earn</h3>
                <p className="text-sm text-gray-600">
                  Invite a friend and earn incentives
                </p>
              </div>
              <button className="rounded-xl bg-black px-6 py-2.5 font-semibold text-white transition-colors hover:bg-gray-800">
                Invite
              </button>
            </div>
          </div>
        </div>

        {/* Complete Tasks Section */}
        <div>
          <h2 className="mb-4 text-xl font-bold">Complete Tasks & Earn</h2>
          <div className="space-y-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between rounded-3xl bg-white p-4"
              >
                <div className="flex items-center gap-4">
                  {task.icon !== null ? (
                    <div
                      className={`${task.bgColor} flex h-14 w-14 items-center justify-center rounded-full`}
                    >
                      {task.icon}
                    </div>
                  ) : (
                    <img
                      src="/user.jpg"
                      className="flex h-14 w-14 items-center justify-center rounded-full object-cover"
                      alt=""
                    />
                  )}
                  <div>
                    <h3 className="text-base font-bold text-black">
                      {task.title}
                    </h3>
                    <p className="text-sm text-gray-600">{task.points}</p>
                  </div>
                </div>
                <button
                  className={getButtonStyles(task.id)}
                  onClick={(e) => handleTaskClick(task, e)}
                  disabled={
                    taskStates[task.id] === "verifying" ||
                    taskStates[task.id] === "done"
                  }
                >
                  {getButtonContent(task.id)}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
