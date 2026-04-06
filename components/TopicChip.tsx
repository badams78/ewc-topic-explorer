"use client";

import { GROUP_CHIP_COLORS } from "@/types";

interface TopicChipProps {
  topicCode: string;
  topicName: string;
  group: string;
  score?: number;
  onClick?: () => void;
  size?: "sm" | "md";
}

export default function TopicChip({ topicCode, topicName, group, score, onClick, size = "sm" }: TopicChipProps) {
  const colorClass = GROUP_CHIP_COLORS[group] || "bg-gray-100 text-gray-800";
  const sizeClass = size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1";

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-full font-medium transition-opacity hover:opacity-80 ${colorClass} ${sizeClass} ${onClick ? "cursor-pointer" : "cursor-default"}`}
      title={topicCode}
    >
      <span>{topicName}</span>
      {score !== undefined && (
        <span className="opacity-70 font-semibold">{score}</span>
      )}
    </button>
  );
}
