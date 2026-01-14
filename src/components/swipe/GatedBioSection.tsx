import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface GatedBioSectionProps {
  bio: string;
  isUnlocked: boolean;
  teaserLength?: number;
  className?: string;
}

const GatedBioSection = ({
  bio,
  isUnlocked,
  teaserLength = 100,
  className,
}: GatedBioSectionProps) => {
  const shouldGate = bio.length > teaserLength && !isUnlocked;
  const teaser = shouldGate ? bio.substring(0, teaserLength) : bio;

  return (
    <div className={cn("relative", className)}>
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        About
      </h2>
      
      <div className="relative">
        {/* Visible teaser */}
        <p className="text-foreground leading-relaxed">
          {teaser}
          {shouldGate && "..."}
        </p>

        {/* Gated content overlay */}
        {shouldGate && (
          <div className="relative mt-2">
            {/* Blurred preview of remaining text */}
            <div className="relative overflow-hidden">
              <p className="text-foreground leading-relaxed blur-sm select-none pointer-events-none">
                {bio.substring(teaserLength, teaserLength + 150)}...
              </p>
              
              {/* Gradient overlay with lock message */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/80 to-background flex items-end justify-center pb-2">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/80 backdrop-blur-sm border border-border">
                  <Lock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">
                    Match to read more
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Full bio when unlocked */}
        {isUnlocked && bio.length > teaserLength && (
          <p className="text-foreground leading-relaxed">
            {bio}
          </p>
        )}
      </div>
    </div>
  );
};

export default GatedBioSection;
