import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Users, Calendar, MoreVertical, Trash2, Eye, AlertCircle, FileEdit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { RoleDefinitionDialog } from "@/components/role/RoleDefinitionDialog";
import { cn } from "@/lib/utils";

interface JobCardProps {
  job: {
    id: string;
    title: string;
    company: string;
    city_id: string;
    role_id: string;
    created_at: string;
    type?: string | null;
    matchCount?: number;
    is_complete?: boolean;
  };
  onDelete?: (id: string) => void;
  onViewCandidates?: (id: string) => void;
  onRoleComplete?: () => void;
  delay?: number;
}

export function JobCard({ job, onDelete, onViewCandidates, onRoleComplete, delay = 0 }: JobCardProps) {
  const createdAt = new Date(job.created_at);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const isPending = job.is_complete === false;
  
  const handleCardClick = () => {
    if (isPending) {
      setShowRoleDialog(true);
    } else {
      onViewCandidates?.(job.id);
    }
  };

  const handleRoleComplete = () => {
    onRoleComplete?.();
    setShowRoleDialog(false);
  };
  
  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay }}
        onClick={handleCardClick}
        className={cn(
          "bg-card rounded-xl p-5 shadow-card border border-border hover-lift group cursor-pointer transition-all",
          isPending && "border-dashed border-primary/50 bg-primary/5"
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <h3 className="font-semibold text-foreground truncate">{job.title}</h3>
              {isPending ? (
                <Badge variant="outline" className="text-xs shrink-0 border-primary text-primary gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Pending Setup
                </Badge>
              ) : job.type && (
                <Badge variant="secondary" className="text-xs shrink-0">
                  {job.type}
                </Badge>
              )}
            </div>
            
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {job.city_id}
              </span>
              {!isPending && (
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {job.matchCount ?? 0} matches
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDistanceToNow(createdAt, { addSuffix: true })}
              </span>
            </div>

            {isPending && (
              <p className="text-xs text-primary mt-2 flex items-center gap-1">
                <FileEdit className="w-3 h-3" />
                Click to complete role details
              </p>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button 
                variant="ghost" 
                size="icon" 
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isPending ? (
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setShowRoleDialog(true); }}>
                  <FileEdit className="w-4 h-4 mr-2" />
                  Complete Role Details
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onViewCandidates?.(job.id); }}>
                  <Eye className="w-4 h-4 mr-2" />
                  View Candidates
                </DropdownMenuItem>
              )}
              <DropdownMenuItem 
                onClick={(e) => { e.stopPropagation(); onDelete?.(job.id); }}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Job
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.div>

      <RoleDefinitionDialog
        open={showRoleDialog}
        onOpenChange={setShowRoleDialog}
        jobId={job.id}
        onComplete={handleRoleComplete}
      />
    </>
  );
}