const colors = [
    "bg-red-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-teal-500",
];

export const getRandomColor = (name) => {
    if (!name) return "bg-gray-400";
    const index = name.charCodeAt(0) % colors.length; // deterministic pick
    return colors[index];
};

export const truncateText = (text, maxLength = 20) => {
    if (!text) return "";
    return text.length > maxLength ? text.slice(0, maxLength) + "…" : text;
};