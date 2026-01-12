import { Users, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface HiringTeamSectionProps {
  isEditing?: boolean;
}

export function HiringTeamSection({ isEditing = false }: HiringTeamSectionProps) {
  return (
    <div className="border border-dashed border-border rounded-xl p-6 bg-muted/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-foreground">Hiring Team</h3>
          <Badge variant="secondary" className="text-xs">
            Coming Soon
          </Badge>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Add your hiring managers and team members who will be involved in the interview process.
        Candidates will be able to see who they'll be meeting with.
      </p>

      <div className="space-y-3 opacity-50">
        {/* Placeholder for future hiring team members */}
        <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-background/50">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            <Users className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Hiring Manager</p>
            <p className="text-xs text-muted-foreground">Name, Title, LinkedIn</p>
          </div>
        </div>

        {isEditing && (
          <Button variant="outline" className="w-full" disabled>
            <Plus className="w-4 h-4 mr-2" />
            Add Team Member
          </Button>
        )}
      </div>

      <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
        <p className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Coming Soon:</span>{" "}
          You'll be able to add team members with their name, title, and LinkedIn profile.
          This helps candidates know who they'll be interviewing with.
        </p>
      </div>
    </div>
  );
}
