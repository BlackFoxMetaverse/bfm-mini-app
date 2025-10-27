import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, LayoutGroup } from "framer-motion";

const NavItem = ({ href, icon, label, isActive }) => {
  return (
    <li className="relative flex w-1/5 flex-col items-center">
      <Link
        to={href}
        className="relative flex w-full flex-col items-center px-1"
        aria-current={isActive ? "page" : undefined}
      >
        <div className="relative flex h-8 w-16 items-center justify-center">
          {/* Smooth moving pill */}
          {isActive && (
            <motion.div
              layoutId="activeBg"
              className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500/40 to-fuchsia-500/40"
              transition={{ type: "spring", stiffness: 500, damping: 34 }}
            />
          )}

          {/* Icon */}
          <div
            className={`relative z-10 h-6 w-6 ${isActive ? "text-white" : "text-[#919AA4]"}`}
          >
            {icon}
          </div>
        </div>
        <span
          className={`relative z-10 mt-1 text-xs ${
            isActive ? "font-medium text-white/60" : "text-white"
          }`}
        >
          {label}
        </span>
      </Link>
    </li>
  );
};

const LeaderboardIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 31 30"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M14.25 12.5H16.75C18.5175 12.5 19.4013 12.5 19.95 13.05C20.5 13.5987 20.5 14.4825 20.5 16.25V23.75C20.5 21.9825 20.5 21.0988 21.05 20.55C21.5975 20 22.4813 20 24.25 20C26.0187 20 26.9012 20 27.45 20.55C28 21.0988 28 21.9825 28 23.75V27.5H3C3 25.7325 3 24.8488 3.55 24.3C4.0975 23.75 4.98125 23.75 6.75 23.75C8.51875 23.75 9.40125 23.75 9.95 24.3C10.5 24.8475 10.5 25.7313 10.5 27.5V16.25C10.5 14.4825 10.5 13.5987 11.05 13.05C11.5975 12.5 12.4812 12.5 14.25 12.5ZM14.4325 3.77875C14.9075 2.925 15.145 2.5 15.5 2.5C15.855 2.5 16.0925 2.925 16.5675 3.77875L16.69 3.99875C16.825 4.24125 16.8925 4.36125 16.9975 4.44125C17.1038 4.52125 17.235 4.55125 17.4975 4.61L17.735 4.665C18.6575 4.87375 19.1187 4.9775 19.2288 5.33C19.3387 5.6825 19.0238 6.05125 18.395 6.78625L18.2325 6.97625C18.0538 7.185 17.9637 7.28875 17.9237 7.41875C17.8837 7.54875 17.8975 7.6875 17.9237 7.96625L17.9487 8.22C18.0437 9.20125 18.0912 9.6925 17.805 9.91C17.5175 10.1287 17.085 9.92875 16.2212 9.53125L15.9988 9.42875C15.7525 9.31625 15.63 9.25875 15.5 9.25875C15.37 9.25875 15.2475 9.31625 15.0012 9.42875L14.7788 9.53125C13.915 9.92875 13.4825 10.1287 13.195 9.91C12.9075 9.6925 12.9563 9.20125 13.0513 8.22L13.0763 7.96625C13.1025 7.6875 13.1163 7.54875 13.0763 7.41875C13.0363 7.28875 12.9462 7.185 12.7675 6.97625L12.605 6.78625C11.9762 6.05125 11.6613 5.68375 11.7712 5.33C11.8813 4.9775 12.3425 4.87375 13.265 4.665L13.5025 4.61C13.765 4.55125 13.8962 4.5225 14.0025 4.44125C14.1075 4.36125 14.175 4.24125 14.31 3.99875L14.4325 3.77875Z"
      fill="currentColor"
    />
  </svg>
);

const SpinIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 29 28"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g clipPath="url(#clip0_62_11648)">
      <path
        d="M14.4999 25.6668C20.9432 25.6668 26.1666 20.4435 26.1666 14.0002C26.1666 7.55684 20.9432 2.3335 14.4999 2.3335C8.0566 2.3335 2.83325 7.55684 2.83325 14.0002C2.83325 20.4435 8.0566 25.6668 14.4999 25.6668Z"
        stroke="currentColor"
        strokeWidth="2.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.4999 16.9168C16.1107 16.9168 17.4166 15.611 17.4166 14.0002C17.4166 12.3893 16.1107 11.0835 14.4999 11.0835C12.8891 11.0835 11.5833 12.3893 11.5833 14.0002C11.5833 15.611 12.8891 16.9168 14.4999 16.9168Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="2.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.4999 2.3335V11.0835M22.6666 5.8335L16.5649 11.9352M26.1666 14.0002H17.4166M22.6666 22.1668L16.5649 16.0652M14.4999 16.9168V25.6668M12.4349 16.0652L6.33325 22.1668M11.5833 14.0002H2.83325M12.4349 11.9352L6.33325 5.8335"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.1875 5.73535C14.7929 6.07705 14.2071 6.07705 13.8125 5.73535L9.89648 2.34375C9.16159 1.70731 9.6118 0.500001 10.584 0.500001L18.416 0.5C19.3882 0.5 19.8384 1.70731 19.1035 2.34375L15.1875 5.73535Z"
        fill="currentColor"
        stroke="white"
        strokeWidth="0.5"
      />
    </g>
    <defs>
      <clipPath id="clip0_62_11648">
        <rect width="28" height="28" fill="white" transform="translate(0.5)" />
      </clipPath>
    </defs>
  </svg>
);

const TasksIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 33 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M20.8637 4H12.1365V8.36361H20.8637V4Z" fill="currentColor" />
    <path
      d="M6.68188 6.18164H9.95459V10.5453H23.0454V6.18164H26.3181V27.9997H6.68188V6.18164ZM19.7727 17.0907V14.9089H13.2273V17.0907H19.7727ZM19.7727 21.4543V19.2725H13.2273V21.4543H19.7727Z"
      fill="currentColor"
    />
  </svg>
);

// Configuration for all navigation items
const navItemsConfig = [
  { id: "game", href: "/games", icon: <SpinIcon />, label: "Games" },
  { id: "tasks", href: "/tasks", icon: <TasksIcon />, label: "Tasks" },
  {
    id: "leaderboard",
    href: "/leaderboard",
    icon: <LeaderboardIcon />,
    label: "Leaderboard",
  },
];

export const BottomNavigation = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const isNavItemActive = (itemHref) => {
    if (itemHref === "/tasks" && currentPath === "/invite") return true;
    if (currentPath === itemHref) return true;
    if (currentPath.startsWith(itemHref) && itemHref !== "/") return true;
    return false;
  };

  return (
    <nav className="sticky bottom-0 left-0 right-0 z-50 w-full">
      <LayoutGroup id="bottom-nav">
        <ul className="mx-auto flex max-w-md justify-between border-t border-white/10 bg-[#141414] px-2 py-4 shadow-lg">
          {navItemsConfig.map((item) => (
            <motion.div
              key={item.id}
              layout
              className="flex w-1/5 justify-center"
            >
              <NavItem
                href={item.href}
                icon={item.icon}
                label={item.label}
                isActive={isNavItemActive(item.href)}
              />
            </motion.div>
          ))}
        </ul>
      </LayoutGroup>
    </nav>
  );
};
