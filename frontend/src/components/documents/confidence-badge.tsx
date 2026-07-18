"use client";

interface ConfidenceBadgeProps {
  score: number;
  size?: "sm" | "md" | "lg";
}

export function ConfidenceBadge({ score, size = "md" }: ConfidenceBadgeProps) {
  const percentage = Math.round(score * 100);

  const color =
    percentage >= 80
      ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
      : percentage >= 60
        ? "text-yellow-400 bg-yellow-400/10 border-yellow-400/20"
        : "text-red-400 bg-red-400/10 border-red-400/20";

  const sizeClasses = {
    sm: "px-1.5 py-0.5 text-[10px]",
    md: "px-2 py-1 text-xs",
    lg: "px-3 py-1.5 text-sm",
  };

  return (
    <div className={`inline-flex items-center gap-1 rounded-lg border font-medium ${color} ${sizeClasses[size]}`}>
      <div
        className={`h-1.5 w-1.5 rounded-full ${
          percentage >= 80
            ? "bg-emerald-400"
            : percentage >= 60
              ? "bg-yellow-400"
              : "bg-red-400"
        }`}
      />
      {percentage}% confidence
    </div>
  );
}
