import { useState, useRef } from "react";
import CircleSegment from "./ui/circle-segment";

const SpinningWheel = ({ onSpinComplete, canSpin = true }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const wheelRef = useRef(null);

  // 🎵 Sound ref
  const spinSoundRef = useRef(null);
  if (!spinSoundRef.current) {
    spinSoundRef.current = new Audio("/wheel.mp3");
    spinSoundRef.current.loop = true; // keep playing until stop
  }

  const segmentCount = 8;
  const segmentAngle = 360 / segmentCount;

  const winningPrizes = [
    { text: "100", imageSrc: "/logo-light.png", imageSize: 64 },
    { text: "", imageSrc: "/macbook_pro.png", imageSize: 70 }, //mac
    { text: "200", imageSrc: "/logo-light.png", imageSize: 64 },
    { text: "", imageSrc: "/vr.svg", imageSize: 70 }, //vr
    { text: "300", imageSrc: "/logo-light.png", imageSize: 64 },
    { text: "", imageSrc: "/ipad_pro.webp", imageSize: 70 },//ipad
    { text: "500", imageSrc: "/logo-light.png", imageSize: 64 },
    { text: "", imageSrc: "/kindle.webp", imageSize: 70 },//kindle
  ].map((prize) => ({
    ...prize,
    radius: 200,
    color: "white",
    borderColor: "black",
    textColor: "black",
  }));

  const handleSpin = () => {
    if (isSpinning || !canSpin) return;

    setIsSpinning(true);

    // 🎵 Start sound
    spinSoundRef.current.currentTime = 0;
    spinSoundRef.current.play();

    const spinDuration = 3000;
    const minRotations = 3;
    const maxRotations = 6;

    const eligibleIndexes = winningPrizes
      .map((prize, index) => (prize.text ? index : null))
      .filter((index) => index !== null);

    const winningIndex =
      eligibleIndexes[Math.floor(Math.random() * eligibleIndexes.length)];

    const baseAngle = winningIndex * segmentAngle + segmentAngle / 2;
    const randomRotations =
      Math.floor(Math.random() * (maxRotations - minRotations + 1)) +
      minRotations;

    const targetRotation = randomRotations * 360 + (360 - baseAngle);

    const startTime = Date.now();
    const startRotation = 0;
    const totalChange =
      targetRotation - startRotation + Math.floor(Math.random() * 44) + 1;

    const animateWheel = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;

      if (elapsed < spinDuration) {
        const progress = 1 - Math.pow(1 - elapsed / spinDuration, 3);
        const currentRotation = startRotation + totalChange * progress;
        setRotation(currentRotation);
        requestAnimationFrame(animateWheel);
      } else {
        setRotation(targetRotation);
        setIsSpinning(false);

        // 🎵 Stop sound
        spinSoundRef.current.pause();
        spinSoundRef.current.currentTime = 0;

        // notify parent
        setTimeout(() => {
          if (onSpinComplete) {
            onSpinComplete(winningPrizes[winningIndex]);
          }
        }, 300);
      }
    };

    requestAnimationFrame(animateWheel);
  };

  const segments = winningPrizes.map((prize, i) => {
    const startAngle = -segmentAngle / 2;
    const endAngle = segmentAngle / 2;
    const segmentRotation = i * segmentAngle;

    return (
      <div
        key={i}
        className="absolute"
        style={{
          transform: `rotate(${segmentRotation}deg)`,
          transformOrigin: "center",
        }}
      >
        <CircleSegment
          radius={prize.radius}
          startAngle={startAngle}
          endAngle={endAngle}
          color={prize.color}
          borderColor={prize.borderColor}
          imageSrc={prize.imageSrc}
          text={prize.text}
          textColor={prize.textColor}
          imageSize={prize.imageSize}
        />
      </div>
    );
  });

  return (
    <div className="relative h-[400px] w-[400px] pt-2">
      {/* Wheel */}
      <div
        ref={wheelRef}
        className="relative h-full w-full transition-transform"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: isSpinning ? "none" : "transform 0.5s ease-out",
        }}
      >
        {segments}
      </div>

      {/* Spin Button */}
      <div
        onClick={handleSpin}
        className={`absolute left-1/2 top-1/2 z-10 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black font-bold uppercase text-white`}
      >
        {isSpinning ? "Spinning" : canSpin ? "Spin" : "Wait"}
      </div>

      {/* Triangle Pointer */}
      <div className="absolute -top-5 left-1/2 z-10 -translate-x-1/2 rotate-180">
        <div className="h-0 w-0 border-b-[25px] border-l-[15px] border-r-[15px] border-b-white border-l-transparent border-r-transparent" />
      </div>
    </div>
  );
};

export default SpinningWheel;
