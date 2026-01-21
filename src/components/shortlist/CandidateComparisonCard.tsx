import { motion } from "framer-motion";
import {
  X,
  User,
  MessageSquare,
  MapPin,
  Briefcase,
  Clock,
  Star,
  Heart,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { getCompatibilityLabel, getCompatibilityColor } from "@/lib/synergyUtils";
import { cn } from "@/lib/utils";

interface CandidateData {
  candidate_id: string;
  notes: string | null;
  synergyScore: number;
  cultureScore: number;
  overallScore: number;
  profile: {
    full_name: string | null;
    avatar_url: string | null;
    job_title: string | null;
    location: string | null;
    skills: string[] | null;
    years_of_experience: string | null;
    bio: string | null;
  } | null;
}

interface CandidateComparisonCardProps {
  candidate: CandidateData;
  onRemove: () => void;
  onViewProfile: () => void;
  onMessage: () => void;
}

export function CandidateComparisonCard({
  candidate,
  onRemove,
  onViewProfile,
  onMessage,
}: CandidateComparisonCardProps) {
  const { profile, synergyScore, cultureScore, overallScore, notes } = candidate;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-orange-500";
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-orange-500";
  };

  return (
    <Card className="relative overflow-hidden h-full">
      {/* Remove Button */}
      <button
        onClick={onRemove}
        className="absolute top-2 right-2 z-10 p-1 rounded-full bg-background/80 hover:bg-destructive/10 transition-colors"
      >
        <X className="w-4 h-4 text-muted-foreground hover:text-destructive" />
      </button>

      <CardHeader className="pb-2 pt-4">
        {/* Avatar & Name */}
        <div className="flex flex-col items-center text-center">
          <Avatar className="w-16 h-16 mb-2">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback className="text-xl">
              {profile?.full_name?.charAt(0) || "?"}
            </AvatarFallback>
          </Avatar>
          <h3 className="font-semibold text-foreground truncate max-w-full">
            {profile?.full_name || "Unknown"}
          </h3>
          <p className="text-sm text-muted-foreground truncate max-w-full">
            {profile?.job_title || "No title"}
          </p>
        </div>

        {/* Overall Score */}
        <div className="mt-3 text-center">
          <div className={cn("text-3xl font-bold", getScoreColor(overallScore))}>
            {overallScore}%
          </div>
          <p className="text-xs text-muted-foreground">
            {getCompatibilityLabel(overallScore)}
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Score Breakdown */}
        <div className="space-y-3">
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="flex items-center gap-1 text-muted-foreground">
                <Star className="w-3 h-3" />
                Synergy Match
              </span>
              <span className={getScoreColor(synergyScore)}>{synergyScore}%</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all", getProgressColor(synergyScore))}
                style={{ width: `${synergyScore}%` }}
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="flex items-center gap-1 text-muted-foreground">
                <Heart className="w-3 h-3" />
                Culture Fit
              </span>
              <span className={getScoreColor(cultureScore)}>{cultureScore}%</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all", getProgressColor(cultureScore))}
                style={{ width: `${cultureScore}%` }}
              />
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 text-sm">
          {profile?.location && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-3.5 h-3.5" />
              <span className="truncate">{profile.location}</span>
            </div>
          )}
          {profile?.years_of_experience && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              <span>{profile.years_of_experience} experience</span>
            </div>
          )}
        </div>

        {/* Skills */}
        {profile?.skills && profile.skills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {profile.skills.slice(0, 4).map((skill, i) => (
              <Badge key={i} variant="secondary" className="text-[10px] px-1.5 py-0">
                {skill}
              </Badge>
            ))}
            {profile.skills.length > 4 && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                +{profile.skills.length - 4}
              </Badge>
            )}
          </div>
        )}

        {/* Notes */}
        {notes && (
          <div className="p-2 bg-secondary/50 rounded-lg">
            <p className="text-xs text-muted-foreground italic truncate">
              "{notes}"
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={onViewProfile}
          >
            <User className="w-3.5 h-3.5 mr-1" />
            Profile
          </Button>
          <Button size="sm" className="flex-1" onClick={onMessage}>
            <MessageSquare className="w-3.5 h-3.5 mr-1" />
            Message
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
