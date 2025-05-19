"use client";

import { useState } from "react";

interface BackgroundSettingsProps {
  backgroundColor: string;
  onBackgroundChange: (color: string) => void;
}

export default function BackgroundSettings({
  backgroundColor,
  onBackgroundChange,
}: BackgroundSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const predefinedColors = [
    "#1a1a1a", // Dark
    "#ffffff", // White
    "#f0f4f8", // Light blue/gray
    "#121638", // Deep blue
    "#2d3748", // Slate
    "#553c9a", // Purple
    "#2c7a7b", // Teal
    "#744210", // Brown
  ];

  return (
    <div className="fixed top-4 left-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-black/20 hover:bg-black/30 backdrop-blur-md text-white px-4 py-2 rounded-md transition-colors"
      >
        <span className="w-4 h-4 rounded-full" style={{ backgroundColor }} />
        {isOpen ? "Close" : "Background"}
      </button>

      {isOpen && (
        <div className="mt-2 p-4 bg-black/20 backdrop-blur-md rounded-md grid grid-cols-4 gap-2">
          {predefinedColors.map((color) => (
            <button
              key={color}
              className={`w-8 h-8 rounded-full border-2 ${
                color === backgroundColor
                  ? "border-white"
                  : "border-transparent"
              } hover:scale-110 transition-transform`}
              style={{ backgroundColor: color }}
              onClick={() => onBackgroundChange(color)}
              aria-label={`Set background to ${color}`}
            />
          ))}

          <div className="col-span-4 mt-2">
            <input
              type="color"
              value={backgroundColor}
              onChange={(e) => onBackgroundChange(e.target.value)}
              className="w-full h-8 cursor-pointer"
            />
          </div>
        </div>
      )}
    </div>
  );
}
