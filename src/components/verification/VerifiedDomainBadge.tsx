import { ShieldCheck } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface VerifiedDomainBadgeProps {
  domain?: string | null;
  isVerified?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function VerifiedDomainBadge({
  domain,
  isVerified = false,
  size = "md",
  className,
}: VerifiedDomainBadgeProps) {
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
              "inline-flex items-center justify-center text-blue-500",
              className
            )}
          >
            <ShieldCheck className={sizeClasses[size]} />
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          <p>Verified employee of {domain || "company"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
