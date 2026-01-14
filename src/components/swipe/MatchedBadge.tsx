import { CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface MatchedBadgeProps {
  className?: string;
}

const MatchedBadge = ({ className }: MatchedBadgeProps) => {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-full",
        "bg-green-500/90 text-white text-sm font-medium shadow-lg",
        "animate-fade-in",
        className
      )}
    >
      <CheckCircle className="w-4 h-4" />
      <span>Matched</span>
    </div>
  );
};

export default MatchedBadge;
