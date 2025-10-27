// import React from "react";

const CircleSegment = ({
  radius = 200,
  startAngle = -30,
  endAngle = 30,
  color = "white",
  borderColor = "black",
  imageSrc = "",
  text = "",
  textColor = "black",
  imageSize = 64,
}) => {
  const polarToCartesian = (r, angle) => {
    const radians = (angle - 90) * (Math.PI / 180);
    return {
      x: r * Math.cos(radians),
      y: r * Math.sin(radians),
    };
  };

  const start = polarToCartesian(radius, endAngle);
  const end = polarToCartesian(radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  const d = [
    `M ${start.x + radius} ${start.y + radius}`,
    `A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x + radius} ${end.y + radius}`,
    `L ${radius} ${radius}`,
    "Z",
  ].join(" ");

  const midAngle = (startAngle + endAngle) / 2;
  const center = polarToCartesian(radius * 0.55, midAngle);

  return (
    <svg
      width={radius * 2}
      height={radius * 2}
      className="mx-auto"
      viewBox={`0 0 ${radius * 2} ${radius * 2}`}
    >
      {/* Segment Path */}
      <path d={d} fill={color} stroke={borderColor} strokeWidth="2" />

      {/* Image (Centered) */}
      {imageSrc && (
        <image
          href={imageSrc}
          x={center.x + radius - 32}
          y={center.y + radius - 64}
          width={imageSize}
          height={imageSize}
          preserveAspectRatio="xMidYMid meet"
        />
      )}

      {/* Text Below Image */}
      <text
        x={center.x + radius}
        y={center.y + radius + 20}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={textColor}
        fontSize="16"
        fontWeight="bold"
      >
        {text}
      </text>
    </svg>
  );
};

export default CircleSegment;
