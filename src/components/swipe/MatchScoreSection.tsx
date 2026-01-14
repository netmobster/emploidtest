import { useState } from "react";
import { Briefcase, Users, Sparkles, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { MatchScoreBreakdown, getScoreColor, getMatchLabel } from "@/lib/matchScoreUtils";
import { MatchBreakdownModal } from "@/components/MatchBreakdownModal";

interface MatchScoreSectionProps {
  breakdown: MatchScoreBreakdown;
  candidateName?: string;
  employerName?: string;
  candidateCulturePrefs?: Record<string, string> | null;
  employerCulturePrefs?: Record<string, string> | null;
  className?: string;
}

const MatchScoreSection = ({
  breakdown,
  candidateName,
  employerName,
  candidateCulturePrefs,
  employerCulturePrefs,
  className,
}: MatchScoreSectionProps) => {
  const [modalOpen, setModalOpen] = useState(false);

  const scores = [
    {
      label: "Skills",
      value: breakdown.skillScore,
      icon: Briefcase,
      weight: "40%",
    },
    {
      label: "Culture",
      value: breakdown.cultureScore,
      icon: Users,
      weight: "30%",
    },
    {
      label: "Synergy",
      value: breakdown.synergyScore,
      icon: Sparkles,
      weight: "30%",
    },
  ];

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className={cn(
          "w-full p-4 rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20",
          "hover:from-primary/10 hover:to-accent/10 transition-all cursor-pointer",
          "active:scale-[0.98]",
          className
        )}
      >
        {/* Header with total score */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className={cn("text-lg font-bold", getScoreColor(breakdown.totalScore))}>
                {breakdown.totalScore}
              </span>
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-foreground">Match Score</p>
              <p className={cn("text-xs", getScoreColor(breakdown.totalScore))}>
                {getMatchLabel(breakdown.totalScore)}
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </div>

        {/* Score breakdown row */}
        <div className="flex gap-2">
          {scores.map((score) => (
            <div
              key={score.label}
              className="flex-1 flex flex-col items-center gap-1 p-2 rounded-lg bg-background/50"
            >
              <score.icon className={cn("w-4 h-4", getScoreColor(score.value))} />
              <span className={cn("text-sm font-semibold", getScoreColor(score.value))}>
                {score.value}%
              </span>
              <span className="text-xs text-muted-foreground">{score.label}</span>
            </div>
          ))}
        </div>
      </button>

      <MatchBreakdownModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        breakdown={breakdown}
        candidateName={candidateName}
        employerName={employerName}
        candidateCulturePrefs={candidateCulturePrefs}
        employerCulturePrefs={employerCulturePrefs}
      />
    </>
  );
};

export default MatchScoreSection;
