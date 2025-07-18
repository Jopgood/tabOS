// src/components/ui/LoadingSpinner.tsx
import { Loader } from "lucide-react";
import React from "react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: "primary" | "secondary" | "white";
  speed?: "slow" | "normal" | "fast";
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  color = "primary",
  speed = "slow",
}) => {
  // Size mappings
  const sizeMap = {
    sm: 16,
    md: 32,
    lg: 48,
  };

  // Color mappings
  const colorClasses = {
    primary: "text-black-600",
    secondary: "text-gray-600",
    white: "text-white",
  };

  // Speed mappings
  const speedClasses = {
    slow: "animate-spin-slow",
    normal: "animate-spin",
    fast: "animate-spin-fast",
  };

  return (
    <div className="flex items-center justify-center">
      <Loader
        className={`${speedClasses[speed]} ${colorClasses[color]}`}
        size={sizeMap[size]}
      />
    </div>
  );
};
