import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Crown, Check } from "lucide-react";
import { HiringTeamMember } from "@/hooks/useHiringTeam";
import { cn } from "@/lib/utils";

interface HiringManagerSelectProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamMembers: HiringTeamMember[];
  onSelect: (member: HiringTeamMember) => void;
  title?: string;
  description?: string;
}

export function HiringManagerSelect({
  open,
  onOpenChange,
  teamMembers,
  onSelect,
  title = "Select Hiring Manager",
  description = "Who will be the hiring contact for this role?",
}: HiringManagerSelectProps) {
  const [selectedId, setSelectedId] = useState<string | null>(
    teamMembers.find((m) => m.is_primary)?.id || null
  );

  const handleConfirm = () => {
    const selectedMember = teamMembers.find((m) => m.id === selectedId);
    if (selectedMember) {
      onSelect(selectedMember);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <p className="text-sm text-muted-foreground">{description}</p>
        </DialogHeader>

        <div className="space-y-2 py-4">
          {teamMembers.map((member) => {
            const initials = member.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);
            const isSelected = selectedId === member.id;

            return (
              <button
                key={member.id}
                onClick={() => setSelectedId(member.id)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left",
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                )}
              >
                <Avatar className="w-10 h-10">
                  <AvatarImage src={member.avatar_url || undefined} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{member.name}</span>
                    {member.is_primary && (
                      <Badge variant="secondary" className="text-xs gap-1">
                        <Crown className="w-3 h-3" />
                        Primary
                      </Badge>
                    )}
                  </div>
                  {member.title && (
                    <p className="text-sm text-muted-foreground truncate">
                      {member.title}
                    </p>
                  )}
                </div>

                {isSelected && (
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedId}>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
