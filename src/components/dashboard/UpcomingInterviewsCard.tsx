import { format, formatDistanceToNow, isWithinInterval, addMinutes } from "date-fns";
import { motion } from "framer-motion";
import { Calendar, Video, Clock, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Interview, useInterviews } from "@/hooks/useInterviews";

interface UpcomingInterviewsCardProps {
  maxItems?: number;
}

export function UpcomingInterviewsCard({ maxItems = 3 }: UpcomingInterviewsCardProps) {
  const navigate = useNavigate();
  const { upcomingInterviews, isLoading } = useInterviews();

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            Upcoming Interviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-16 bg-muted rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (upcomingInterviews.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            Upcoming Interviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Calendar className="h-10 w-10 text-muted-foreground/50 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No upcoming interviews</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
    >
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Upcoming Interviews
            </CardTitle>
            {upcomingInterviews.length > maxItems && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/settings?tab=interviews")}
                className="text-xs"
              >
                See All
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {upcomingInterviews.slice(0, maxItems).map((interview) => (
            <InterviewItem key={interview.id} interview={interview} />
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function InterviewItem({ interview }: { interview: Interview }) {
  const scheduledAt = new Date(interview.scheduled_at);
  const endTime = addMinutes(scheduledAt, interview.duration_minutes);
  const isNow = isWithinInterval(new Date(), { start: scheduledAt, end: endTime });

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border transition-colors",
        isNow
          ? "bg-primary/10 border-primary animate-pulse"
          : "bg-secondary/30 border-border"
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-primary flex-shrink-0" />
          <span className="text-sm font-medium truncate">
            {format(scheduledAt, "MMM d, h:mm a")}
          </span>
          <Badge
            variant={interview.status === "confirmed" ? "default" : "secondary"}
            className="text-[10px] flex-shrink-0"
          >
            {interview.status}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 truncate">
          {isNow ? (
            <span className="text-primary font-medium">Happening now!</span>
          ) : (
            `In ${formatDistanceToNow(scheduledAt)}`
          )}
        </p>
      </div>

      {interview.meeting_link && interview.status === "confirmed" && (
        <Button size="sm" variant={isNow ? "default" : "outline"} asChild>
          <a
            href={interview.meeting_link}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Video className="w-4 h-4 mr-1" />
            Join
            {isNow && <ExternalLink className="w-3 h-3 ml-1" />}
          </a>
        </Button>
      )}
    </div>
  );
}
