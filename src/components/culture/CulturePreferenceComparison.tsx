import { Check, AlertTriangle, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { parseCulturePreferences, groupPreferencesByCategory, cultureQuestionMap } from "@/lib/cultureUtils";
import { cn } from "@/lib/utils";

interface CulturePreferenceComparisonProps {
  userPreferences: Record<string, string> | null | undefined;
  otherPreferences: Record<string, string> | null | undefined;
  userLabel?: string;
  otherLabel?: string;
  className?: string;
}

type MatchLevel = "match" | "similar" | "different";

function getMatchLevel(userAnswer: string, otherAnswer: string): MatchLevel {
  if (userAnswer === otherAnswer) return "match";
  
  // Define similar answer groups
  const similarGroups = [
    ["very_flexible", "flexible"],
    ["structured", "very_structured"],
    ["high", "very_high"],
    ["low", "medium"],
    ["collaborative", "team_oriented"],
    ["independent", "autonomous"],
  ];
  
  const isSimilar = similarGroups.some(
    (group) => group.includes(userAnswer) && group.includes(otherAnswer)
  );
  
  return isSimilar ? "similar" : "different";
}

function MatchIndicator({ level }: { level: MatchLevel }) {
  switch (level) {
    case "match":
      return (
        <div className="flex items-center gap-1 text-emerald-500">
          <Check className="w-4 h-4" />
          <span className="text-xs font-medium">Match</span>
        </div>
      );
    case "similar":
      return (
        <div className="flex items-center gap-1 text-amber-500">
          <Zap className="w-4 h-4" />
          <span className="text-xs font-medium">Similar</span>
        </div>
      );
    case "different":
      return (
        <div className="flex items-center gap-1 text-orange-500">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-xs font-medium">Different</span>
        </div>
      );
  }
}

function formatAnswer(answer: string): string {
  return answer
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

export function CulturePreferenceComparison({
  userPreferences,
  otherPreferences,
  userLabel = "You",
  otherLabel = "Company",
  className,
}: CulturePreferenceComparisonProps) {
  if (!userPreferences || !otherPreferences) {
    return (
      <div className={cn("text-center text-muted-foreground py-8", className)}>
        Culture preferences not available for comparison
      </div>
    );
  }

  const allQuestionIds = Object.keys(cultureQuestionMap);

  return (
    <div className={cn("space-y-6", className)}>
      {allQuestionIds.map((questionId) => {
        const questionInfo = cultureQuestionMap[questionId];
        const userAnswer = userPreferences[questionId];
        const otherAnswer = otherPreferences[questionId];
        
        if (!userAnswer && !otherAnswer) return null;
        
        const matchLevel = userAnswer && otherAnswer 
          ? getMatchLevel(userAnswer, otherAnswer) 
          : "different";
        const Icon = questionInfo.icon;

        return (
          <div
            key={questionId}
            className={cn(
              "p-4 rounded-lg border transition-colors",
              matchLevel === "match" && "bg-emerald-500/5 border-emerald-500/20",
              matchLevel === "similar" && "bg-amber-500/5 border-amber-500/20",
              matchLevel === "different" && "bg-orange-500/5 border-orange-500/20"
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium text-sm">{questionInfo.label}</span>
              </div>
              <MatchIndicator level={matchLevel} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">{userLabel}</p>
                <Badge variant="secondary" className="text-xs">
                  {userAnswer ? formatAnswer(userAnswer) : "Not set"}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">{otherLabel}</p>
                <Badge variant="outline" className="text-xs">
                  {otherAnswer ? formatAnswer(otherAnswer) : "Not set"}
                </Badge>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
