import { CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ProfileCompleteBadgeProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function ProfileCompleteBadge({
  className,
  size = "md",
  showLabel = true,
}: ProfileCompleteBadgeProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  const badge = (
    <div className={cn("flex items-center gap-1 text-green-600", className)}>
      <CheckCircle className={sizeClasses[size]} />
      {showLabel && (
        <span className={cn("font-medium", textSizeClasses[size])}>Complete</span>
      )}
    </div>
  );

  if (!showLabel) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent>
          <p>Profile Complete</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return badge;
}
