import { motion } from "framer-motion";
import { Palette, TrendingUp, TrendingDown, Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  getCultureCompatibilityLabel,
  getCultureCompatibilityColor,
  getCultureCompatibilityBg,
} from "@/lib/cultureUtils";
import { cn } from "@/lib/utils";

interface CultureCompatibilityBadgeProps {
  score: number;
  matchingAreas: string[];
  differingAreas: string[];
  className?: string;
  showDetails?: boolean;
}

export function CultureCompatibilityBadge({
  score,
  matchingAreas,
  differingAreas,
  className,
  showDetails = false,
}: CultureCompatibilityBadgeProps) {
  if (score === 0) return null;

  const label = getCultureCompatibilityLabel(score);
  const colorClass = getCultureCompatibilityColor(score);
  const bgClass = getCultureCompatibilityBg(score);

  if (!showDetails) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border cursor-help",
              bgClass,
              className
            )}
          >
            <Palette className={cn("w-4 h-4", colorClass)} />
            <span className={cn("font-semibold text-sm", colorClass)}>
              {score}% Culture Match
            </span>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-2">
            <p className="font-medium">{label}</p>
            {matchingAreas.length > 0 && (
              <div className="flex items-start gap-1 text-xs">
                <Check className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Strong alignment: {matchingAreas.join(", ")}</span>
              </div>
            )}
            {differingAreas.length > 0 && (
              <div className="flex items-start gap-1 text-xs">
                <X className="w-3 h-3 text-orange-500 mt-0.5 flex-shrink-0" />
                <span>Different approach: {differingAreas.join(", ")}</span>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-xl p-4 border",
        bgClass,
        className
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Palette className={cn("w-5 h-5", colorClass)} />
          <span className="font-semibold text-foreground">Culture Compatibility</span>
        </div>
        <div className={cn("text-2xl font-bold", colorClass)}>
          {score}%
        </div>
      </div>
      
      <p className={cn("text-sm mb-3", colorClass)}>{label}</p>
      
      <div className="space-y-2">
        {matchingAreas.length > 0 && (
          <div className="flex items-start gap-2">
            <div className="p-1 rounded-full bg-green-500/20 flex-shrink-0">
              <TrendingUp className="w-3 h-3 text-green-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Strong alignment in:</p>
              <div className="flex flex-wrap gap-1">
                {matchingAreas.map((area) => (
                  <Badge key={area} variant="secondary" className="text-xs bg-green-500/10 text-green-700 dark:text-green-400">
                    {area}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {differingAreas.length > 0 && (
          <div className="flex items-start gap-2">
            <div className="p-1 rounded-full bg-orange-500/20 flex-shrink-0">
              <TrendingDown className="w-3 h-3 text-orange-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Different approaches in:</p>
              <div className="flex flex-wrap gap-1">
                {differingAreas.map((area) => (
                  <Badge key={area} variant="secondary" className="text-xs bg-orange-500/10 text-orange-700 dark:text-orange-400">
                    {area}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
