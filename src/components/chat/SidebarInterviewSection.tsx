import { format, formatDistanceToNow, isWithinInterval, addMinutes } from "date-fns";
import { motion } from "framer-motion";
import { Calendar, Video, Clock, Building2, User, Briefcase, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Interview } from "@/hooks/useInterviews";

interface MatchContext {
  id: string;
  job?: {
    id: string;
    title: string;
    company: string;
  } | null;
  employer?: {
    full_name: string | null;
    avatar_url: string | null;
    company_name: string | null;
  } | null;
  hiringManager?: {
    name: string;
    title: string | null;
    avatar_url: string | null;
  } | null;
}

interface SidebarInterviewSectionProps {
  interviews: Interview[];
  matchContext?: MatchContext;
  isCandidate?: boolean;
}

export function SidebarInterviewSection({
  interviews,
  matchContext,
  isCandidate = true,
}: SidebarInterviewSectionProps) {
  const upcomingInterviews = interviews.filter(
    (i) =>
      new Date(i.scheduled_at) > new Date() &&
      (i.status === "pending" || i.status === "confirmed")
  );

  if (upcomingInterviews.length === 0 && !matchContext) {
    return null;
  }

  return (
    <div className="p-3 space-y-3">
      {/* Context Section for Candidates */}
      {isCandidate && matchContext && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          {/* Job Info */}
          {matchContext.job && (
            <div className="p-3 rounded-lg bg-secondary/50 border border-border">
              <div className="flex items-start gap-2">
                <Briefcase className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">
                    {matchContext.job.title}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Building2 className="w-3 h-3 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground truncate">
                      {matchContext.job.company}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Hiring Manager Info */}
          {(matchContext.hiringManager || matchContext.employer) && (
            <div className="p-3 rounded-lg bg-secondary/50 border border-border">
              <div className="flex items-center gap-2.5">
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarImage
                    src={
                      matchContext.hiringManager?.avatar_url ||
                      matchContext.employer?.avatar_url ||
                      undefined
                    }
                  />
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {(
                      matchContext.hiringManager?.name ||
                      matchContext.employer?.full_name ||
                      "?"
                    )
                      .slice(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">
                    {matchContext.hiringManager?.name ||
                      matchContext.employer?.full_name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {matchContext.hiringManager?.title || "Hiring Manager"}
                    {matchContext.employer?.company_name &&
                      ` at ${matchContext.employer.company_name}`}
                  </p>
                </div>
              </div>
            </div>
          )}

          {upcomingInterviews.length > 0 && <Separator />}
        </motion.div>
      )}

      {/* Upcoming Interviews */}
      {upcomingInterviews.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium text-foreground">
              Upcoming Interviews
            </span>
          </div>

          <div className="space-y-2">
            {upcomingInterviews.slice(0, 2).map((interview) => (
              <InterviewCard key={interview.id} interview={interview} />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

function InterviewCard({ interview }: { interview: Interview }) {
  const scheduledAt = new Date(interview.scheduled_at);
  const endTime = addMinutes(scheduledAt, interview.duration_minutes);
  const isNow = isWithinInterval(new Date(), { start: scheduledAt, end: endTime });

  return (
    <div
      className={cn(
        "p-2.5 rounded-lg border transition-all",
        isNow
          ? "bg-primary/10 border-primary shadow-sm"
          : "bg-muted/30 border-border"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-primary flex-shrink-0" />
            <span className="text-xs font-medium truncate">
              {format(scheduledAt, "EEE, MMM d")}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {format(scheduledAt, "h:mm a")} •{" "}
            {isNow ? (
              <span className="text-primary font-medium">Now!</span>
            ) : (
              formatDistanceToNow(scheduledAt, { addSuffix: true })
            )}
          </p>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <Badge
            variant={interview.status === "confirmed" ? "default" : "secondary"}
            className="text-[9px] px-1.5 py-0"
          >
            {interview.status}
          </Badge>

          {interview.meeting_link && interview.status === "confirmed" && (
            <Button
              size="sm"
              variant={isNow ? "default" : "ghost"}
              className="h-6 w-6 p-0"
              asChild
            >
              <a
                href={interview.meeting_link}
                target="_blank"
                rel="noopener noreferrer"
                title="Join Meeting"
              >
                <Video className="w-3 h-3" />
              </a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
