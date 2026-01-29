import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ShortlistEntry {
  jobId: string;
  jobTitle: string;
}

interface ShortlistIndicatorBadgeProps {
  shortlists: ShortlistEntry[];
  className?: string;
}

export const ShortlistIndicatorBadge = ({
  shortlists,
  className,
}: ShortlistIndicatorBadgeProps) => {
  if (shortlists.length === 0) return null;

  const label = shortlists.length === 1 
    ? "Shortlisted" 
    : `Shortlisted (${shortlists.length})`;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            className={`bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/30 cursor-pointer ${className}`}
          >
            <Star className="w-3 h-3 mr-1 fill-current" />
            <span className="text-[10px]">{label}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-1">
            <p className="font-medium text-xs">Shortlisted for:</p>
            <ul className="text-xs space-y-0.5">
              {shortlists.map((entry) => (
                <li key={entry.jobId} className="text-muted-foreground">
                  • {entry.jobTitle}
                </li>
              ))}
            </ul>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
