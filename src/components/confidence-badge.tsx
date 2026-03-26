"use client";

import { useWizard } from "@/lib/wizard-context";

function badgeColor(score: number) {
  if (score >= 90) return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
  if (score >= 75) return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
  return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
}

export function ConfidenceBadge({ field }: { field: string }) {
  const { transcriptMode, liveMode, confidenceScores } = useWizard();

  if (!transcriptMode && !liveMode) return null;

  const score = confidenceScores[field];
  if (score === undefined) return null;

  return (
    <span
      className={`ml-2 inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ${badgeColor(score)}`}
    >
      {score}%
    </span>
  );
}
