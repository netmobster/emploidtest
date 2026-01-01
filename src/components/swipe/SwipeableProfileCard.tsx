import { motion } from "framer-motion";
import { MapPin, Briefcase, Clock, Wifi, Star } from "lucide-react";
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

interface SwipeableProfileCardProps {
  data: CandidateData | JobData;
  type: "candidate" | "job";
  dragX?: number;
}

const isCandidate = (data: CandidateData | JobData): data is CandidateData => {
  return "name" in data;
};

const SwipeableProfileCard = ({ data, type, dragX = 0 }: SwipeableProfileCardProps) => {
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

  return (
    <div className="relative w-full h-full bg-card rounded-3xl shadow-card overflow-hidden">
      {/* Like/Pass overlay indicators */}
      <motion.div
        className="absolute inset-0 bg-green-500/20 z-10 pointer-events-none rounded-3xl border-4 border-green-500"
        style={{ opacity: likeOpacity }}
      />
      <motion.div
        className="absolute inset-0 bg-red-500/20 z-10 pointer-events-none rounded-3xl border-4 border-red-500"
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

      {/* Content */}
      <div className="h-full flex flex-col p-6 overflow-y-auto">
        {/* Header with avatar/logo and match score */}
        <div className="flex items-start gap-4 mb-6">
          {type === "candidate" && isCandidate(data) ? (
            <div className="w-24 h-24 rounded-2xl bg-secondary flex items-center justify-center text-4xl font-bold text-primary overflow-hidden flex-shrink-0">
              {data.avatar ? (
                <img src={data.avatar} alt={data.name} className="w-full h-full object-cover" />
              ) : (
                data.name.charAt(0)
              )}
            </div>
          ) : (
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-3xl font-bold text-primary flex-shrink-0">
              {!isCandidate(data) && data.company.charAt(0)}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-foreground truncate">
              {isCandidate(data) ? data.name : data.title}
            </h2>
            <p className="text-lg text-muted-foreground truncate">
              {isCandidate(data) ? data.title : data.company}
            </p>
            <div className="flex items-center gap-2 mt-2 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{data.location}</span>
              {data.remote && (
                <Badge variant="outline" className="ml-2 text-xs">
                  <Wifi className="w-3 h-3 mr-1" />
                  Remote
                </Badge>
              )}
            </div>
          </div>

          {/* Match Score */}
          <div className={cn(
            "flex flex-col items-center justify-center px-4 py-3 rounded-2xl border",
            getScoreBg(matchScore)
          )}>
            <Star className={cn("w-5 h-5 mb-1", getScoreColor(matchScore))} />
            <span className={cn("text-2xl font-bold", getScoreColor(matchScore))}>
              {matchScore}%
            </span>
            <span className="text-xs text-muted-foreground">Match</span>
          </div>
        </div>

        {/* Bio/Description */}
        <div className="mb-6">
          <p className="text-foreground leading-relaxed">
            {isCandidate(data) ? data.bio : data.description}
          </p>
        </div>

        {/* Skills/Requirements */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            {type === "candidate" ? "Skills" : "Requirements"}
          </h3>
          <div className="flex flex-wrap gap-2">
            {(isCandidate(data) ? data.skills : data.requirements || []).map((item, index) => (
              <Badge key={index} variant="secondary" className="px-3 py-1">
                {item}
              </Badge>
            ))}
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-auto pt-4 border-t border-border">
          {isCandidate(data) ? (
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                <span>{data.experience}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{data.availability}</span>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {data.salary && (
                <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
                  <span>{data.salary}</span>
                </div>
              )}
              {data.benefits && data.benefits.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {data.benefits.slice(0, 4).map((benefit, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {benefit}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SwipeableProfileCard;
