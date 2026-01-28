import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Briefcase, DollarSign, Wifi, Building2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Job {
  id: string;
  title: string;
  company: string;
  city_id: string;
  salary: string | null;
  type: string | null;
  remote: boolean | null;
  user_id: string | null;
}

interface JobRecommendationCardProps {
  job: Job;
  onView: (jobId: string) => void;
  delay?: number;
}

export function JobRecommendationCard({ job, onView, delay = 0 }: JobRecommendationCardProps) {
  const [isNavigating, setIsNavigating] = useState(false);

  const handleViewClick = () => {
    setIsNavigating(true);
    onView(job.id);
    // Reset after a timeout in case navigation doesn't happen
    setTimeout(() => setIsNavigating(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="p-4 rounded-lg border border-border bg-secondary/30 hover:bg-secondary/50 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-foreground truncate">{job.title}</h4>
          <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
            <Building2 className="h-3.5 w-3.5" />
            <span className="truncate">{job.company}</span>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {job.city_id && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span>{job.city_id}</span>
              </div>
            )}
            {job.salary && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <DollarSign className="h-3 w-3" />
                <span>{job.salary}</span>
              </div>
            )}
            {job.remote && (
              <Badge variant="secondary" className="text-xs">
                <Wifi className="h-3 w-3 mr-1" />
                Remote
              </Badge>
            )}
            {job.type && (
              <Badge variant="outline" className="text-xs">
                <Briefcase className="h-3 w-3 mr-1" />
                {job.type}
              </Badge>
            )}
          </div>
        </div>
        
        <Button size="sm" onClick={handleViewClick} disabled={isNavigating}>
          {isNavigating ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            "View"
          )}
        </Button>
      </div>
    </motion.div>
  );
}
