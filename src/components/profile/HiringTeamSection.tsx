import { Users, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { HiringManagerCard } from "./HiringManagerCard";
import { useHiringTeam } from "@/hooks/useHiringTeam";

interface HiringTeamSectionProps {
  employerId?: string;
  isMatched?: boolean;
  isEditing?: boolean;
}

export function HiringTeamSection({ 
  employerId, 
  isMatched = false, 
  isEditing = false 
}: HiringTeamSectionProps) {
  const { teamMembers, isLoading } = useHiringTeam(employerId);

  if (isLoading) {
    return (
      <div className="border border-border rounded-xl p-6 bg-card">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-foreground">Hiring Team</h3>
        </div>
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }

  // No team members yet
  if (teamMembers.length === 0) {
    return (
      <div className="border border-dashed border-border rounded-xl p-6 bg-muted/20">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-foreground">Hiring Team</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          No hiring team members added yet.
        </p>
      </div>
    );
  }

  // Not matched - show placeholder
  if (!isMatched) {
    return (
      <div className="border border-dashed border-border rounded-xl p-6 bg-muted/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-foreground">Hiring Team</h3>
          </div>
          <Badge variant="secondary" className="gap-1">
            <Lock className="w-3 h-3" />
            Match to reveal
          </Badge>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Match with this company to see who you'll be speaking with.
        </p>

        <div className="space-y-3 opacity-50">
          {teamMembers.slice(0, 2).map((member) => (
            <HiringManagerCard 
              key={member.id} 
              member={member} 
              isRevealed={false}
            />
          ))}
          {teamMembers.length > 2 && (
            <p className="text-xs text-muted-foreground text-center">
              +{teamMembers.length - 2} more team members
            </p>
          )}
        </div>
      </div>
    );
  }

  // Matched - show full team
  return (
    <div className="border border-border rounded-xl p-6 bg-card">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Hiring Team</h3>
        <Badge variant="outline" className="text-xs">
          {teamMembers.length} member{teamMembers.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      <div className="space-y-3">
        {teamMembers.map((member) => (
          <HiringManagerCard 
            key={member.id} 
            member={member} 
            isRevealed={true}
          />
        ))}
      </div>
    </div>
  );
}
