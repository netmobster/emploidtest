import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Circle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { CompletionItem } from "@/hooks/useProfileCompletion";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ProfileCompletionCardProps {
  percentage: number;
  basicPercentage: number;
  extendedPercentage: number;
  items: CompletionItem[];
  basicItems: CompletionItem[];
  extendedItems: CompletionItem[];
  message: string;
  isComplete: boolean;
}

export function ProfileCompletionCard({
  percentage,
  basicPercentage,
  extendedPercentage,
  basicItems,
  extendedItems,
  message,
  isComplete,
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
          {isComplete && (
            <Badge className="bg-green-500/20 text-green-600 border-green-500/30 ml-auto">
              <Check className="w-3 h-3 mr-1" />
              Complete
            </Badge>
          )}
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
            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground">Basic:</span>
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${basicPercentage}%` }}
                  />
                </div>
                <span className="font-medium">{basicPercentage}%</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground">Extended:</span>
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent transition-all"
                    style={{ width: `${extendedPercentage}%` }}
                  />
                </div>
                <span className="font-medium">{extendedPercentage}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Basic Items */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Basic
            </span>
            <Badge variant="secondary" className="text-[10px] h-4">
              Required
            </Badge>
          </div>
          {basicItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item)}
              className={cn(
                "w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors",
                item.completed
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
            </button>
          ))}
        </div>

        {/* Extended Items */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Extended
            </span>
            <Badge variant="outline" className="text-[10px] h-4">
              Optional
            </Badge>
          </div>
          {extendedItems.map((item) => (
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
                      ? "bg-accent/10 text-accent-foreground hover:bg-accent/20 cursor-pointer"
                      : "bg-muted/50 hover:bg-muted text-foreground cursor-pointer"
                  )}
                >
                  {item.completed ? (
                    <Check className="h-4 w-4 text-accent flex-shrink-0" />
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
