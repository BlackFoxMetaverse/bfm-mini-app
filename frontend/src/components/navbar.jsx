import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

// Clean, minimal icons
const LeaderboardIcon = ({ isActive }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 3v18h18" />
    <path d="M18 17V9" />
    <path d="M13 17V5" />
    <path d="M8 17v-3" />
  </svg>
);

const SpinIcon = ({ isActive }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

const TasksIcon = ({ isActive }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 11l3 3L22 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </svg>
);

const navItemsConfig = [
  { id: "game", href: "/games", icon: SpinIcon, label: "Games" },
  { id: "tasks", href: "/tasks", icon: TasksIcon, label: "Tasks" },
  {
    id: "leaderboard",
    href: "/leaderboard",
    icon: LeaderboardIcon,
    label: "Leaderboard",
  },
];

export const BottomNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const isNavItemActive = (itemHref) => {
    if (itemHref === "/tasks" && currentPath === "/invite") return true;
    if (currentPath === itemHref) return true;
    if (currentPath.startsWith(itemHref) && itemHref !== "/") return true;
    return false;
  };

  const handleNavigation = (href) => {
    navigate(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-zinc-800 bg-zinc-900">
      <div className="mx-auto max-w-md">
        <ul className="flex h-16 items-center justify-around">
          {navItemsConfig.map((item) => {
            const isActive = isNavItemActive(item.href);
            const Icon = item.icon;

            return (
              <li key={item.id} className="flex-1">
                <button
                  onClick={() => handleNavigation(item.href)}
                  className="flex h-16 w-full flex-col items-center justify-center gap-1 transition-colors"
                >
                  <div className={isActive ? "text-[#ffcf27]" : "text-gray-500"}>
                    <Icon isActive={isActive} />
                  </div>
                  <span
                    className={`text-xs font-medium transition-colors ${
                      isActive ? "text-[#ffcf27]" : "text-gray-500"
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};
