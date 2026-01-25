import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Circle, Sparkles, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { CompletionItem } from "@/hooks/useProfileCompletion";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
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
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const handleItemClick = (item: CompletionItem) => {
    if (!item.comingSoon) {
      navigate(item.path, { state: { returnTo: location.pathname } });
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
        <CardTitle className="text-base sm:text-lg flex items-center gap-2 flex-wrap">
          <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
          <span className="truncate">Profile</span>
          {isComplete && (
            <Badge className="bg-green-500/20 text-green-600 border-green-500/30 ml-auto text-[10px] sm:text-xs">
              <Check className="w-3 h-3 mr-1" />
              Done
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 px-3 sm:px-6 pb-3 sm:pb-6">
        {/* Circular Progress - stacked on mobile */}
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 88 88">
              {/* Background circle */}
              <circle
                cx="44"
                cy="44"
                r={radius}
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-muted"
              />
              {/* Progress circle */}
              <circle
                cx="44"
                cy="44"
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
              <span className="text-lg sm:text-2xl font-bold">{percentage}%</span>
            </div>
          </div>
          <div className="flex-1 min-w-0 w-full text-center sm:text-left">
            <p className="text-xs sm:text-sm font-medium text-foreground line-clamp-2">
              {message}
            </p>
            <div className="mt-2 space-y-1.5">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground font-medium w-10 flex-shrink-0 text-left">Basic</span>
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden min-w-0">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${basicPercentage}%` }}
                  />
                </div>
                <span className="font-medium text-foreground w-8 text-right flex-shrink-0">{basicPercentage}%</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground font-medium w-10 flex-shrink-0 text-left">Extra</span>
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden min-w-0">
                  <div
                    className="h-full bg-accent transition-all"
                    style={{ width: `${extendedPercentage}%` }}
                  />
                </div>
                <span className="font-medium text-foreground w-8 text-right flex-shrink-0">{extendedPercentage}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Basic Items */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Required
            </span>
          </div>
          {basicItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item)}
              className={cn(
                "w-full flex items-center gap-2 sm:gap-3 p-2 rounded-lg text-left transition-colors",
                item.completed
                  ? "bg-primary/20 hover:bg-primary/30 cursor-pointer"
                  : "bg-secondary hover:bg-secondary/80 cursor-pointer"
              )}
            >
              {item.completed ? (
                <Check className="h-4 w-4 text-primary flex-shrink-0" />
              ) : (
                <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              )}
              <span className={cn(
                "text-xs sm:text-sm flex-1 min-w-0 truncate",
                item.completed ? "text-primary font-medium" : "text-foreground"
              )}>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Extended Items */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Optional
            </span>
          </div>
          <TooltipProvider>
            {extendedItems.map((item) => (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>
                    <button
                      onClick={() => handleItemClick(item)}
                      disabled={item.comingSoon}
                      className={cn(
                        "w-full flex items-center gap-2 sm:gap-3 p-2 rounded-lg text-left transition-colors",
                        item.comingSoon
                          ? "bg-muted text-muted-foreground cursor-not-allowed opacity-60"
                          : item.completed
                          ? "bg-accent/20 hover:bg-accent/30 cursor-pointer"
                          : "bg-secondary hover:bg-secondary/80 cursor-pointer"
                      )}
                  >
                      {item.completed ? (
                        <Check className="h-4 w-4 text-accent flex-shrink-0" />
                      ) : item.comingSoon ? (
                        <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      ) : (
                        <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      )}
                      <span className={cn(
                        "text-xs sm:text-sm flex-1 min-w-0 truncate",
                        item.completed ? "text-accent font-medium" : item.comingSoon ? "text-muted-foreground" : "text-foreground"
                      )}>{item.label}</span>
                    {item.comingSoon && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 flex-shrink-0">
                        Soon
                      </Badge>
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
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
}
