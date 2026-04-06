"use client";

interface ScoreBarProps {
  score: number;
  label?: string;
  color?: string;
  onClick?: () => void;
  showValue?: boolean;
}

function getScoreColor(score: number): string {
  if (score >= 85) return "#10b981";
  if (score >= 65) return "#3b82f6";
  if (score >= 45) return "#f59e0b";
  return "#9ca3af";
}

export default function ScoreBar({ score, label, color, onClick, showValue = true }: ScoreBarProps) {
  const barColor = color || getScoreColor(score);
  return (
    <div
      className={`flex items-center gap-2 ${onClick ? "cursor-pointer hover:bg-gray-50 rounded px-1 -mx-1" : ""}`}
      onClick={onClick}
    >
      {label && (
        <span className="text-xs text-gray-600 w-40 truncate shrink-0" title={label}>
          {label}
        </span>
      )}
      <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${score}%`, backgroundColor: barColor }}
        />
      </div>
      {showValue && (
        <span className="text-xs font-medium text-gray-700 w-8 text-right shrink-0">{score}</span>
      )}
    </div>
  );
}
