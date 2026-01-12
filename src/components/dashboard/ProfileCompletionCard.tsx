import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Circle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { CompletionItem } from "@/hooks/useProfileCompletion";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ProfileCompletionCardProps {
  percentage: number;
  items: CompletionItem[];
  message: string;
}

export function ProfileCompletionCard({
  percentage,
  items,
  message,
}: ProfileCompletionCardProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // Calculate stroke dasharray for circular progress
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const handleItemClick = (item: CompletionItem) => {
    if (!item.comingSoon) {
      navigate(item.path, { state: { returnTo: location.pathname } });
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Profile Completion
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Circular Progress */}
        <div className="flex items-center gap-4">
          <div className="relative w-24 h-24 flex-shrink-0">
            <svg className="w-24 h-24 transform -rotate-90">
              {/* Background circle */}
              <circle
                cx="48"
                cy="48"
                r={radius}
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-muted"
              />
              {/* Progress circle */}
              <circle
                cx="48"
                cy="48"
                r={radius}
                stroke="url(#progressGradient)"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-500 ease-out"
              />
              <defs>
                <linearGradient
                  id="progressGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="0%" stopColor="hsl(var(--primary))" />
                  <stop offset="100%" stopColor="hsl(var(--accent))" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold">{percentage}%</span>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">
              {message}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {items.filter((i) => i.completed).length} of {items.length}{" "}
              completed
            </p>
          </div>
        </div>

        {/* Checklist */}
        <div className="space-y-2">
          {items.map((item) => (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => handleItemClick(item)}
                  disabled={item.comingSoon}
                  className={cn(
                    "w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors",
                    item.comingSoon
                      ? "bg-muted/50 text-muted-foreground cursor-not-allowed"
                      : item.completed
                      ? "bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer"
                      : "bg-muted/50 hover:bg-muted text-foreground cursor-pointer"
                  )}
                >
                  {item.completed ? (
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  )}
                  <span className="text-sm flex-1">{item.label}</span>
                  {item.comingSoon && (
                    <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                      Soon
                    </span>
                  )}
                </button>
              </TooltipTrigger>
              {item.comingSoon && (
                <TooltipContent>
                  <p>This feature is coming soon!</p>
                </TooltipContent>
              )}
            </Tooltip>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
