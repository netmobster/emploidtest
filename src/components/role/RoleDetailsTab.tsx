import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  DollarSign, 
  MapPin, 
  Wifi, 
  Building2, 
  Target,
  Wrench,
  Users,
  Zap
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface RoleDetailsTabProps {
  jobId: string;
}

interface JobDetails {
  title: string;
  company: string;
  pay_min: number | null;
  pay_max: number | null;
  work_mode: string | null;
  location_text: string | null;
  reporting_to: string | null;
  mission_statement: string | null;
  big_rocks: string[] | null;
  daily_stack: string[] | null;
  vibe_mode: string | null;
}

export function RoleDetailsTab({ jobId }: RoleDetailsTabProps) {
  const [job, setJob] = useState<JobDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchJobDetails = async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("title, company, pay_min, pay_max, work_mode, location_text, reporting_to, mission_statement, big_rocks, daily_stack, vibe_mode")
        .eq("id", jobId)
        .single();

      if (!error && data) {
        setJob({
          ...data,
          big_rocks: Array.isArray(data.big_rocks) 
            ? (data.big_rocks as unknown as string[]) 
            : null,
        });
      }
      setIsLoading(false);
    };

    fetchJobDetails();
  }, [jobId]);

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Role details not available
      </div>
    );
  }

  const formatSalary = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const workModeLabels: Record<string, string> = {
    "remote": "Remote",
    "hybrid": "Hybrid",
    "on-site": "On-site",
  };

  const vibeModeLabels: Record<string, { label: string; description: string }> = {
    "async-autonomous": { 
      label: "Async & Autonomous", 
      description: "Independent work with async communication" 
    },
    "high-collaboration": { 
      label: "High Collaboration", 
      description: "Regular meetings and real-time coordination" 
    },
  };

  return (
    <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-200px)]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center pb-4 border-b"
      >
        <h2 className="text-xl font-semibold">{job.title}</h2>
        <p className="text-muted-foreground">{job.company}</p>
      </motion.div>

      {/* Logistics Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-xl border p-4 space-y-3"
      >
        <h3 className="font-medium flex items-center gap-2">
          <Building2 className="w-4 h-4 text-primary" />
          The Logistics
        </h3>
        
        <div className="grid grid-cols-2 gap-3">
          {/* Pay Range */}
          {(job.pay_min || job.pay_max) && (
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <span>
                {job.pay_min && job.pay_max
                  ? `${formatSalary(job.pay_min)} - ${formatSalary(job.pay_max)}`
                  : job.pay_min
                    ? `From ${formatSalary(job.pay_min)}`
                    : `Up to ${formatSalary(job.pay_max!)}`}
              </span>
            </div>
          )}

          {/* Work Mode */}
          {job.work_mode && (
            <div className="flex items-center gap-2 text-sm">
              <Wifi className="w-4 h-4 text-muted-foreground" />
              <span>{workModeLabels[job.work_mode] || job.work_mode}</span>
            </div>
          )}

          {/* Location */}
          {job.location_text && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span>{job.location_text}</span>
            </div>
          )}

          {/* Reporting To */}
          {job.reporting_to && (
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span>Reports to {job.reporting_to}</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Mission Card */}
      {job.mission_statement && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-xl border p-4 space-y-2"
        >
          <h3 className="font-medium flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            The Mission
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {job.mission_statement}
          </p>
        </motion.div>
      )}

      {/* Big Rocks Card */}
      {job.big_rocks && job.big_rocks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-xl border p-4 space-y-3"
        >
          <h3 className="font-medium flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            90-Day Priorities
          </h3>
          <div className="space-y-2">
            {job.big_rocks.filter(Boolean).map((rock, index) => (
              <div key={index} className="flex items-start gap-3">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-medium shrink-0 mt-0.5">
                  {index + 1}
                </span>
                <span className="text-sm">{rock}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Daily Stack Card */}
      {job.daily_stack && job.daily_stack.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card rounded-xl border p-4 space-y-3"
        >
          <h3 className="font-medium flex items-center gap-2">
            <Wrench className="w-4 h-4 text-primary" />
            Daily Tools
          </h3>
          <div className="flex flex-wrap gap-2">
            {job.daily_stack.map((tool) => (
              <Badge key={tool} variant="secondary">
                {tool}
              </Badge>
            ))}
          </div>
        </motion.div>
      )}

      {/* Vibe Card */}
      {job.vibe_mode && vibeModeLabels[job.vibe_mode] && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={cn(
            "rounded-xl border p-4 space-y-1",
            job.vibe_mode === "async-autonomous" 
              ? "bg-blue-500/5 border-blue-500/20" 
              : "bg-amber-500/5 border-amber-500/20"
          )}
        >
          <h3 className="font-medium">
            {vibeModeLabels[job.vibe_mode].label}
          </h3>
          <p className="text-sm text-muted-foreground">
            {vibeModeLabels[job.vibe_mode].description}
          </p>
        </motion.div>
      )}
    </div>
  );
}
