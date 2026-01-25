import { BadgeCheck } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface VerifiedProfessionalBadgeProps {
  isVerified?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function VerifiedProfessionalBadge({
  isVerified = false,
  size = "md",
  className,
}: VerifiedProfessionalBadgeProps) {
  if (!isVerified) return null;

  const sizeClasses = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              "inline-flex items-center justify-center text-emerald-500",
              className
            )}
          >
            <BadgeCheck className={sizeClasses[size]} />
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          <p>Identity verified via LinkedIn</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
