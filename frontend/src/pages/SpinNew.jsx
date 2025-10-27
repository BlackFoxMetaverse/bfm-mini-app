import React, { useState, useRef } from "react";

const SpinNew = () => {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const wheelRef = useRef(null);

  const segments = [
    { color: "#62D099", text: "₹100 OFF", angle: 0, isWin: true },
    { color: "#fff", text: "30 Points", angle: 60, isWin: true },
    { color: "#62D099", text: "₹100 OFF", angle: 120, isWin: true },
    { color: "#fff", text: "Try Again", angle: 180, isWin: false },
    { color: "#62D099", text: "100 Points", angle: 240, isWin: true },
    { color: "#fff", text: "20% OFF", angle: 300, isWin: true },
  ];

  const confetti = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 2 + Math.random() * 2,
    emoji: ["⭐", "🎊", "🎉", "💫", "✨", "🎁", "💰"][
      Math.floor(Math.random() * 7)
    ],
  }));

  const handleSpin = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    setShowCelebration(false);

    const spins = 5 + Math.random() * 3;
    const segmentAngle = 60; // 360 / 6 segments
    const randomSegment = Math.floor(Math.random() * 6);
    const targetAngle = randomSegment * segmentAngle + segmentAngle / 2;
    const totalRotation = spins * 360 + (360 - targetAngle);

    setRotation(rotation + totalRotation);

    setTimeout(() => {
      setIsSpinning(false);
      if (segments[randomSegment].isWin) {
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 5000);
      }
    }, 4000);
  };

  return (
    <div className="relative h-[100dvh] min-h-screen w-full bg-gradient-to-b from-zinc-900 via-slate-900 to-black font-sans text-white">
      <style>{`
        @keyframes fall {
          from {
            transform: translateY(-50px) rotate(0deg);
            opacity: 1;
          }
          to {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0.6;
          }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-25px) rotate(15deg); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>

      {/* Celebration Elements */}
      {showCelebration && (
        <>
          {confetti.map((conf) => (
            <div
              key={conf.id}
              className="pointer-events-none absolute z-50 text-3xl"
              style={{
                left: `${conf.left}%`,
                top: "-50px",
                animation: `fall ${conf.duration}s ease-in`,
                animationDelay: `${conf.delay}s`,
              }}
            >
              {conf.emoji}
            </div>
          ))}
        </>
      )}

      <div className="mx-auto flex h-full min-h-screen w-full max-w-md flex-col items-center justify-between overflow-y-auto px-6 py-6 pb-48">
        {/* Header */}
        <div className="mb-5 mt-6 text-center">
          <h1 className="mb-4 text-7xl font-black leading-[0.85] tracking-tight">
            <span
              className="block"
              style={{
                color: "#42b077",
                textShadow:
                  "0 4px 0px #2d7a54, 0 6px 15px rgba(66, 176, 119, 0.4)",
              }}
            >
              SPIN
            </span>
            <span
              className="my-1 block"
              style={{
                color: "#fff",
                textShadow:
                  "0 4px 0px #666, 0 6px 15px rgba(255, 255, 255, 0.3)",
                transform: "rotate(-3deg)",
                display: "inline-block",
              }}
            >
              TO
            </span>
            <span
              className="block"
              style={{
                color: "#8463ED",
                textShadow:
                  "0 4px 0px #5a3fb3, 0 6px 15px rgba(132, 99, 237, 0.4)",
              }}
            >
              WIN!
            </span>
          </h1>
          <p className="mb-1 text-sm text-gray-400">Your next spin could win</p>
          <p className="text-xl font-bold text-white">20% off on next order</p>
        </div>

        {/* Wheel Section */}
        <div className="flex w-full flex-1 flex-col items-center justify-center">
          <div className="relative">
            {/* Outer Glow Effect */}
            <div className="absolute inset-0 scale-110 rounded-full bg-gradient-to-br from-purple-500/20 via-green-500/20 to-yellow-500/20 blur-2xl"></div>

            {/* Wheel Border Container */}
            <div className="relative rounded-full border-[16px] border-slate-700 bg-slate-700 shadow-2xl">
              {/* Pointer */}
              <div className="absolute left-1/2 top-0 z-30 -translate-x-1/2 -translate-y-5">
                <div className="relative">
                  <div
                    className="h-7 w-7 rounded-full border-4 border-slate-900 bg-yellow-400 shadow-xl"
                    style={{
                      animation: isSpinning
                        ? "pulse 0.5s ease-in-out infinite"
                        : "none",
                    }}
                  ></div>
                  <div
                    className="absolute left-1/2 top-6 h-0 w-0 -translate-x-1/2"
                    style={{
                      borderLeft: "14px solid transparent",
                      borderRight: "14px solid transparent",
                      borderTop: "24px solid #fbbf24",
                      filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))",
                    }}
                  ></div>
                </div>
              </div>

              {/* Wheel SVG */}
              <div className="relative z-20 p-2">
                <svg
                  ref={wheelRef}
                  className="h-80 w-80 rounded-full"
                  viewBox="0 0 400 400"
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    transition: isSpinning
                      ? "transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)"
                      : "none",
                    filter: "drop-shadow(0 10px 25px rgba(0,0,0,0.5))",
                  }}
                >
                  {segments.map((segment, index) => {
                    const startAngle = (segment.angle - 30) * (Math.PI / 180);
                    const endAngle = (segment.angle + 30) * (Math.PI / 180);
                    const largeArcFlag = 0;

                    const x1 = 200 + 200 * Math.cos(startAngle);
                    const y1 = 200 + 200 * Math.sin(startAngle);
                    const x2 = 200 + 200 * Math.cos(endAngle);
                    const y2 = 200 + 200 * Math.sin(endAngle);

                    const textAngle = segment.angle;
                    const textRadius = 130;
                    const textX =
                      200 + textRadius * Math.cos((textAngle * Math.PI) / 180);
                    const textY =
                      200 + textRadius * Math.sin((textAngle * Math.PI) / 180);

                    return (
                      <g key={index}>
                        <path
                          d={`M 200 200 L ${x1} ${y1} A 200 200 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                          fill={segment.color}
                          stroke="#1e293b"
                          strokeWidth="3"
                        />
                        <text
                          x={textX}
                          y={textY}
                          fill={segment.color === "#fff" ? "#1e293b" : "#fff"}
                          fontSize="16"
                          fontWeight="900"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          transform={`rotate(${textAngle + 90}, ${textX}, ${textY})`}
                        >
                          {segment.text}
                        </text>
                      </g>
                    );
                  })}

                  {/* Center Circle */}
                  <circle
                    cx="200"
                    cy="200"
                    r="45"
                    fill="#1e293b"
                    stroke="#ffffff"
                    strokeWidth="8"
                  />
                  <circle cx="200" cy="200" r="35" fill="#0f172a" />
                </svg>
              </div>

              {/* Bottom Platform with Button */}
              <div
                className="absolute -bottom-28 -left-10 z-10 flex h-[80%] w-[125%] items-end justify-center rounded-3xl bg-gradient-to-b from-slate-800 to-slate-900 pb-6 shadow-2xl"
                style={{
                  boxShadow:
                    "0 -10px 40px rgba(0,0,0,0.5), inset 0 2px 10px rgba(255,255,255,0.1)",
                }}
              >
                <button
                  onClick={handleSpin}
                  disabled={isSpinning}
                  className="rounded-full bg-gradient-to-r from-purple-600 via-purple-500 to-purple-600 px-8 py-3 text-lg font-bold text-white shadow-xl transition-all hover:scale-105 hover:shadow-purple-500/50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                  style={{
                    boxShadow: "0 8px 25px rgba(132, 99, 237, 0.5)",
                  }}
                >
                  {isSpinning ? "Spinning..." : "Spin Again"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpinNew;
