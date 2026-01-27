import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  DollarSign, 
  Briefcase, 
  Target, 
  Wrench,
  Users,
  Zap,
  X 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RolePreviewData {
  title: string;
  company: string;
  pay_min?: number | null;
  pay_max?: number | null;
  work_mode?: string;
  city_hub?: string;
  mission_statement?: string;
  big_rocks?: string[];
  daily_stack?: string[];
  vibe_mode?: string;
}

interface RolePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roleData: RolePreviewData;
}

export function RolePreviewDialog({
  open,
  onOpenChange,
  roleData,
}: RolePreviewDialogProps) {
  const formatSalary = (min?: number | null, max?: number | null) => {
    if (!min && !max) return "Salary TBD";
    if (min && max) return `$${(min / 1000).toFixed(0)}K - $${(max / 1000).toFixed(0)}K`;
    if (min) return `From $${(min / 1000).toFixed(0)}K`;
    return `Up to $${(max! / 1000).toFixed(0)}K`;
  };

  const workModeLabels: Record<string, string> = {
    remote: "Remote",
    hybrid: "Hybrid",
    onsite: "On-site",
    "on-site": "On-site",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg">Candidate Preview</DialogTitle>
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
              Preview Mode
            </Badge>
          </div>
        </DialogHeader>

        {/* Card Preview */}
        <div className="space-y-4 p-4 rounded-xl border bg-card">
          {/* Header */}
          <div>
            <h3 className="text-xl font-bold text-foreground">{roleData.title}</h3>
            <p className="text-muted-foreground">{roleData.company}</p>
          </div>

          {/* Badges Row */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="gap-1">
              <DollarSign className="w-3 h-3" />
              {formatSalary(roleData.pay_min, roleData.pay_max)}
            </Badge>
            {roleData.work_mode && (
              <Badge variant="outline" className="gap-1">
                <Briefcase className="w-3 h-3" />
                {workModeLabels[roleData.work_mode] || roleData.work_mode}
              </Badge>
            )}
            {roleData.city_hub && (
              <Badge variant="outline" className="gap-1">
                <MapPin className="w-3 h-3" />
                {roleData.city_hub}
              </Badge>
            )}
          </div>

          {/* Mission Statement */}
          {roleData.mission_statement ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-primary">
                <Target className="w-4 h-4" />
                The Mission
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {roleData.mission_statement}
              </p>
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
              <p className="text-sm text-amber-700 dark:text-amber-400">
                ⚠️ No mission statement yet. Add one to help candidates understand the role.
              </p>
            </div>
          )}

          {/* Big Rocks */}
          {roleData.big_rocks && roleData.big_rocks.filter(Boolean).length > 0 ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-primary">
                <Zap className="w-4 h-4" />
                The Three Big Rocks
              </div>
              <ul className="space-y-1.5">
                {roleData.big_rocks.filter(Boolean).map((rock, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-medium flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    {rock}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-muted/50 border border-dashed">
              <p className="text-sm text-muted-foreground">
                No 90-day outcomes defined yet.
              </p>
            </div>
          )}

          {/* Daily Stack */}
          {roleData.daily_stack && roleData.daily_stack.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-primary">
                <Wrench className="w-4 h-4" />
                Daily Stack
              </div>
              <div className="flex flex-wrap gap-1.5">
                {roleData.daily_stack.map((tool) => (
                  <Badge key={tool} variant="secondary" className="text-xs">
                    {tool}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Vibe Mode */}
          {roleData.vibe_mode && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-primary">
                <Users className="w-4 h-4" />
                Work Style
              </div>
              <Badge variant="outline">
                {roleData.vibe_mode === "async-autonomous" 
                  ? "Async & Autonomous" 
                  : "High-Collaboration"}
              </Badge>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close Preview
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
