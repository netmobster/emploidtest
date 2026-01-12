import { useState } from "react";
import { cn } from "@/lib/utils";
import { MatchScoreBreakdown, getScoreColor, getMatchLabel } from "@/lib/matchScoreUtils";
import { MatchBreakdownModal } from "./MatchBreakdownModal";

interface MatchScoreBadgeProps {
  breakdown: MatchScoreBreakdown;
  candidateName?: string;
  employerName?: string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function MatchScoreBadge({
  breakdown,
  candidateName,
  employerName,
  size = "md",
  showLabel = true,
  className,
}: MatchScoreBadgeProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5",
  };

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full font-semibold transition-all",
          "bg-primary/10 hover:bg-primary/20 cursor-pointer",
          sizeClasses[size],
          className
        )}
      >
        <span className={getScoreColor(breakdown.totalScore)}>
          {breakdown.totalScore}%
        </span>
        {showLabel && (
          <span className="text-muted-foreground font-normal">
            {getMatchLabel(breakdown.totalScore)}
          </span>
        )}
      </button>

      <MatchBreakdownModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        breakdown={breakdown}
        candidateName={candidateName}
        employerName={employerName}
      />
    </>
  );
}
