import { motion } from "framer-motion";
import { MapPin, Users, Calendar, MoreVertical, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";

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
  };
  onDelete?: (id: string) => void;
  onViewCandidates?: (id: string) => void;
  delay?: number;
}

export function JobCard({ job, onDelete, onViewCandidates, delay = 0 }: JobCardProps) {
  const createdAt = new Date(job.created_at);
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="bg-card rounded-xl p-5 shadow-card border border-border hover-lift group"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-foreground truncate">{job.title}</h3>
            {job.type && (
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
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {job.matchCount ?? 0} matches
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formatDistanceToNow(createdAt, { addSuffix: true })}
            </span>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onViewCandidates?.(job.id)}>
              <Eye className="w-4 h-4 mr-2" />
              View Candidates
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onDelete?.(job.id)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Job
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
}