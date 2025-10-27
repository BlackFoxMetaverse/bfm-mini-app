const gradients = [
    "bg-gradient-to-b from-red-400 to-red-500",
    "bg-gradient-to-b from-blue-400 to-blue-500",
    "bg-gradient-to-b from-green-400 to-green-500",
    "bg-gradient-to-b from-yellow-400 to-yellow-500",
    "bg-gradient-to-b from-purple-400 to-purple-500",
    "bg-gradient-to-b from-pink-400 to-pink-500",
    "bg-gradient-to-b from-indigo-400 to-indigo-500",
    "bg-gradient-to-b from-teal-400 to-teal-500",
];

const getRandomGradient = (name = "") => {
    if (!name) return "bg-gradient-to-b from-gray-400 to-gray-500";
    const index = name.charCodeAt(0) % gradients.length; // stable pick
    return gradients[index];
};

export default function Avatar({ name = "", photoUrl, size = "h-10 w-10", text = "text-sm" }) {
    if (photoUrl) {
        return (
            <img
                src={photoUrl}
                alt={name}
                className={`${size} rounded-full object-cover`}
            />
        );
    }

    // Split name into first + last
    const parts = name.trim().split(" ");
    const initials =
        (parts[0]?.[0] || "").toUpperCase() +
        (parts.length > 1 ? parts[1][0].toUpperCase() : "");

    return (
        <div
            className={`${size} ${text} flex items-center justify-center rounded-full text-white font-bold ${getRandomGradient(
                name
            )}`}
        >
            {initials || "?"}
        </div>
    );
}
