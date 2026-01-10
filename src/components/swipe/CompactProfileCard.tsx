import { MapPin, Wifi, Star, ChevronUp, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CandidateData {
  id: string;
  name: string;
  title: string;
  avatar: string;
  bio: string;
  skills: string[];
  location: string;
  experience: string;
  availability: string;
  remote: boolean;
  matchScore: number;
  linkedinUrl?: string;
  websiteUrl?: string;
  portfolioUrl?: string;
  remotePreference?: string;
  resumeUrl?: string;
  coverImageUrl?: string;
  hasSynergyScore?: boolean;
  synergyBadge?: string;
}

interface JobData {
  id: string;
  title: string;
  company: string;
  description: string;
  location: string;
  salary: string;
  remote: boolean;
  benefits?: string[];
  requirements?: string[];
  matchScore: number;
}

interface CompactProfileCardProps {
  data: CandidateData | JobData;
  type: "candidate" | "job";
  dragX?: number;
  onExpand?: () => void;
}

const isCandidate = (data: CandidateData | JobData): data is CandidateData => {
  return "name" in data;
};

const CompactProfileCard = ({ data, type, dragX = 0, onExpand }: CompactProfileCardProps) => {
  const matchScore = data.matchScore;
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-orange-500";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-500/10 border-green-500/30";
    if (score >= 60) return "bg-yellow-500/10 border-yellow-500/30";
    return "bg-orange-500/10 border-orange-500/30";
  };

  // Calculate overlay opacity based on drag position
  const likeOpacity = Math.min(Math.max(dragX / 100, 0), 1);
  const passOpacity = Math.min(Math.max(-dragX / 100, 0), 1);

  const skills = isCandidate(data) ? data.skills : data.requirements || [];
  const displaySkills = skills.slice(0, 3);
  const remainingSkills = skills.length - 3;

  return (
    <div 
      className="relative w-full h-full bg-card rounded-3xl shadow-card overflow-hidden cursor-pointer"
      onClick={(e) => {
        e.stopPropagation();
        onExpand?.();
      }}
    >
      {/* Like/Pass overlay indicators */}
      <div
        className="absolute inset-0 bg-green-500/20 z-10 pointer-events-none rounded-3xl border-4 border-green-500 transition-opacity"
        style={{ opacity: likeOpacity }}
      />
      <div
        className="absolute inset-0 bg-red-500/20 z-10 pointer-events-none rounded-3xl border-4 border-red-500 transition-opacity"
        style={{ opacity: passOpacity }}
      />

      {/* Like/Pass text indicators */}
      {likeOpacity > 0.3 && (
        <div className="absolute top-8 left-8 z-20 rotate-[-15deg]">
          <span className="text-4xl font-black text-green-500 border-4 border-green-500 px-4 py-2 rounded-lg">
            LIKE
          </span>
        </div>
      )}
      {passOpacity > 0.3 && (
        <div className="absolute top-8 right-8 z-20 rotate-[15deg]">
          <span className="text-4xl font-black text-red-500 border-4 border-red-500 px-4 py-2 rounded-lg">
            PASS
          </span>
        </div>
      )}

      {/* Synergy Badge - Top Left */}
      {isCandidate(data) && data.hasSynergyScore && (
        <div className="absolute top-4 left-4 z-10">
          <Badge className="bg-primary/90 text-primary-foreground text-xs">
            <Sparkles className="w-3 h-3 mr-1" />
            {data.synergyBadge || "Synergy Verified"}
          </Badge>
        </div>
      )}

      {/* Match Score Badge - Top Right */}
      <div className={cn(
        "absolute top-4 right-4 z-10 flex items-center gap-1 px-3 py-1.5 rounded-full border",
        getScoreBg(matchScore)
      )}>
        <Star className={cn("w-4 h-4", getScoreColor(matchScore))} />
        <span className={cn("text-sm font-bold", getScoreColor(matchScore))}>
          {matchScore}%
        </span>
      </div>

      {/* Main Content */}
      <div className="h-full flex flex-col">
        {/* Avatar/Logo Section - Takes up more space */}
        <div className="flex-1 relative min-h-[50%]">
          {type === "candidate" && isCandidate(data) ? (
            <div className="w-full h-full bg-gradient-to-br from-secondary to-muted flex items-center justify-center">
              {data.avatar && data.avatar.startsWith("http") ? (
                <img 
                  src={data.avatar} 
                  alt={data.name} 
                  className="w-full h-full object-cover"
                />
              ) : data.avatar ? (
                // Emoji avatar
                <span className="text-9xl">
                  {data.avatar}
                </span>
              ) : (
                <span className="text-8xl font-bold text-primary/30">
                  {data.name.charAt(0)}
                </span>
              )}
            </div>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
              <span className="text-8xl font-bold text-primary/30">
                {!isCandidate(data) && data.company.charAt(0)}
              </span>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="p-6 bg-card">
          {/* Name/Title */}
          <div className="mb-3">
            <h2 className="text-2xl font-bold text-foreground truncate">
              {isCandidate(data) ? data.name : data.title}
            </h2>
            <p className="text-base text-muted-foreground truncate">
              {isCandidate(data) ? data.title : data.company}
            </p>
          </div>

          {/* Location + Remote */}
          <div className="flex items-center gap-2 mb-4 text-muted-foreground">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm truncate">{data.location}</span>
            {data.remote && (
              <Badge variant="outline" className="text-xs flex-shrink-0">
                <Wifi className="w-3 h-3 mr-1" />
                Remote
              </Badge>
            )}
          </div>

          {/* Skills/Requirements badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            {displaySkills.map((skill, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
            {remainingSkills > 0 && (
              <Badge variant="outline" className="text-xs">
                +{remainingSkills} more
              </Badge>
            )}
          </div>

          {/* Tap for more indicator */}
          <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
            <ChevronUp className="w-4 h-4" />
            <span>Tap for full profile</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompactProfileCard;
