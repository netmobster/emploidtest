import { useMemo, useState } from "react";
import { Sparkles, Users, Briefcase, ChevronDown, ChevronUp } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MatchScoreBreakdown, getScoreColor, getMatchLabel } from "@/lib/matchScoreUtils";
import { DualRadarChart } from "@/components/culture/DualRadarChart";

interface MatchBreakdownModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  breakdown: MatchScoreBreakdown;
  candidateName?: string;
  employerName?: string;
  candidateCulturePrefs?: Record<string, string> | null;
  employerCulturePrefs?: Record<string, string> | null;
}

export function MatchBreakdownModal({
  open,
  onOpenChange,
  breakdown,
  candidateName,
  employerName,
  candidateCulturePrefs,
  employerCulturePrefs,
}: MatchBreakdownModalProps) {
  const [showCultureChart, setShowCultureChart] = useState(false);

  const scores = useMemo(() => [
    {
      label: "Skill Match",
      value: breakdown.skillScore,
      icon: Briefcase,
      description: "Based on matching skills and job requirements",
      weight: "40%",
    },
    {
      label: "Culture Fit",
      value: breakdown.cultureScore,
      icon: Users,
      description: "Alignment of work culture preferences",
      weight: "30%",
    },
    {
      label: "Synergy Score",
      value: breakdown.synergyScore,
      icon: Sparkles,
      description: "Work style and values compatibility",
      weight: "30%",
    },
  ], [breakdown]);

  const hasCultureData = candidateCulturePrefs || employerCulturePrefs;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Match Breakdown
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-6">
          {/* Overall Score */}
          <div className="text-center p-6 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
            <div className="relative w-32 h-32 mx-auto mb-4">
              {/* Circular progress background */}
              <svg className="w-32 h-32 transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="none"
                  className="text-muted"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="url(#matchGradient)"
                  strokeWidth="12"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${breakdown.totalScore * 3.52} 352`}
                  className="transition-all duration-700 ease-out"
                />
                <defs>
                  <linearGradient id="matchGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="hsl(var(--primary))" />
                    <stop offset="100%" stopColor="hsl(var(--accent))" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-foreground">{breakdown.totalScore}%</span>
              </div>
            </div>
            <p className={cn("text-lg font-semibold", getScoreColor(breakdown.totalScore))}>
              {getMatchLabel(breakdown.totalScore)}
            </p>
            {(candidateName || employerName) && (
              <p className="text-sm text-muted-foreground mt-1">
                {candidateName && employerName
                  ? `${candidateName} & ${employerName}`
                  : candidateName || employerName}
              </p>
            )}
          </div>

          {/* Score Breakdown */}
          <div className="space-y-4">
            {scores.map((score) => (
              <div key={score.label} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <score.icon className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium text-foreground">{score.label}</span>
                    <span className="text-xs text-muted-foreground">({score.weight})</span>
                  </div>
                  <span className={cn("font-semibold", getScoreColor(score.value))}>
                    {score.value}%
                  </span>
                </div>
                <Progress 
                  value={score.value} 
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground">{score.description}</p>
              </div>
            ))}
          </div>

          {/* Culture Comparison Chart (Expandable) */}
          {hasCultureData && (
            <div className="border-t border-border pt-4">
              <Button
                variant="ghost"
                className="w-full justify-between"
                onClick={() => setShowCultureChart(!showCultureChart)}
              >
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Culture Comparison
                </span>
                {showCultureChart ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
              
              {showCultureChart && (
                <div className="mt-4">
                  <DualRadarChart
                    userPreferences={candidateCulturePrefs}
                    otherPreferences={employerCulturePrefs}
                    userLabel={candidateName || "Candidate"}
                    otherLabel={employerName || "Company"}
                    userColor="hsl(var(--primary))"
                    otherColor="hsl(var(--accent))"
                  />
                </div>
              )}
            </div>
          )}

          {/* Legend */}
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              Match score is calculated using: 40% Skills + 30% Culture + 30% Synergy
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
