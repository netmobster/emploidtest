import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Linkedin, Mail, Crown, User } from "lucide-react";
import { HiringTeamMember } from "@/hooks/useHiringTeam";
import { cn } from "@/lib/utils";

interface HiringManagerCardProps {
  member: HiringTeamMember;
  isRevealed?: boolean;
  compact?: boolean;
  className?: string;
}

export function HiringManagerCard({
  member,
  isRevealed = true,
  compact = false,
  className,
}: HiringManagerCardProps) {
  const initials = member.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  if (!isRevealed) {
    return (
      <div className={cn(
        "flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-dashed",
        className
      )}>
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
          <User className="w-5 h-5 text-muted-foreground" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">Hiring Manager</p>
          <p className="text-xs text-muted-foreground">Match to reveal</p>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Avatar className="w-6 h-6">
          <AvatarImage src={member.avatar_url || undefined} alt={member.name} />
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
        <span className="text-sm">{member.name}</span>
        {member.is_primary && (
          <Crown className="w-3 h-3 text-amber-500" />
        )}
      </div>
    );
  }

  return (
    <div className={cn(
      "flex items-start gap-4 p-4 rounded-lg bg-card border",
      className
    )}>
      <Avatar className="w-12 h-12">
        <AvatarImage src={member.avatar_url || undefined} alt={member.name} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-medium truncate">{member.name}</h4>
          {member.is_primary && (
            <Badge variant="secondary" className="text-xs gap-1">
              <Crown className="w-3 h-3" />
              Primary
            </Badge>
          )}
        </div>
        {member.title && (
          <p className="text-sm text-muted-foreground truncate">{member.title}</p>
        )}

        <div className="flex items-center gap-2 mt-2">
          {member.linkedin_url && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              asChild
            >
              <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer">
                <Linkedin className="w-4 h-4" />
              </a>
            </Button>
          )}
          {member.email && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              asChild
            >
              <a href={`mailto:${member.email}`}>
                <Mail className="w-4 h-4" />
              </a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
