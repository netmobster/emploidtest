import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface LockedSectionProps {
  title: string;
  description?: string;
  className?: string;
}

const LockedSection = ({ title, description, className }: LockedSectionProps) => {
  return (
    <div
      className={cn(
        "relative rounded-xl border border-dashed border-muted-foreground/30 bg-muted/30 p-6",
        className
      )}
    >
      <div className="flex flex-col items-center justify-center gap-3 text-center">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
          <Lock className="w-5 h-5 text-muted-foreground" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LockedSection;
