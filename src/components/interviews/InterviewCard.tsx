import { format, formatDistanceToNow, isPast, isWithinInterval, addMinutes } from "date-fns";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  Video,
  Check,
  X,
  ExternalLink,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Interview } from "@/hooks/useInterviews";
import { useAuth } from "@/contexts/AuthContext";

interface InterviewCardProps {
  interview: Interview;
  onConfirm?: () => void;
  onCancel?: () => void;
  onAddMeetingLink?: () => void;
  compact?: boolean;
}

export function InterviewCard({
  interview,
  onConfirm,
  onCancel,
  onAddMeetingLink,
  compact = false,
}: InterviewCardProps) {
  const { user } = useAuth();

  const scheduledAt = new Date(interview.scheduled_at);
  const endTime = addMinutes(scheduledAt, interview.duration_minutes);
  const isEmployer = user?.id === interview.employer_id;
  const isNow = isWithinInterval(new Date(), { start: scheduledAt, end: endTime });
  const hasPassed = isPast(endTime);

  const statusConfig: Record<
    Interview["status"],
    { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
  > = {
    pending: { label: "Pending", variant: "secondary" },
    confirmed: { label: "Confirmed", variant: "default" },
    cancelled: { label: "Cancelled", variant: "destructive" },
    completed: { label: "Completed", variant: "outline" },
    rescheduled: { label: "Rescheduling", variant: "secondary" },
  };

  const status = statusConfig[interview.status];

  if (compact) {
    return (
      <div
        className={cn(
          "flex items-center gap-3 p-3 rounded-lg border transition-colors",
          isNow
            ? "bg-primary/10 border-primary"
            : hasPassed
            ? "bg-muted/30 border-border"
            : "bg-card border-border"
        )}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
            <span className="text-sm font-medium truncate">
              {format(scheduledAt, "MMM d, h:mm a")}
            </span>
            <Badge variant={status.variant} className="text-[10px]">
              {status.label}
            </Badge>
          </div>
          {!hasPassed && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {isNow ? "Happening now!" : `In ${formatDistanceToNow(scheduledAt)}`}
            </p>
          )}
        </div>
        {interview.meeting_link && interview.status === "confirmed" && !hasPassed && (
          <Button size="sm" asChild>
            <a href={interview.meeting_link} target="_blank" rel="noopener noreferrer">
              <Video className="w-4 h-4 mr-1" />
              Join
            </a>
          </Button>
        )}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card
        className={cn(
          "overflow-hidden",
          isNow && "ring-2 ring-primary",
          hasPassed && interview.status !== "completed" && "opacity-60"
        )}
      >
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="font-medium">
                  {format(scheduledAt, "EEEE, MMMM d")}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>
                  {format(scheduledAt, "h:mm a")} - {format(endTime, "h:mm a")}
                </span>
              </div>
            </div>
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>

          {/* Time status */}
          {!hasPassed && interview.status !== "cancelled" && (
            <div
              className={cn(
                "text-sm mb-3 p-2 rounded-lg",
                isNow ? "bg-primary/10 text-primary font-medium" : "bg-muted/50"
              )}
            >
              {isNow ? (
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  Interview is happening now!
                </span>
              ) : (
                <span>Starts {formatDistanceToNow(scheduledAt, { addSuffix: true })}</span>
              )}
            </div>
          )}

          {/* Notes */}
          {interview.notes && (
            <div className="mb-3 p-2 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                <MessageSquare className="w-3 h-3" />
                Notes
              </div>
              <p className="text-sm">{interview.notes}</p>
            </div>
          )}

          {/* Meeting link */}
          {interview.meeting_link && interview.status === "confirmed" && (
            <div className="mb-3">
              <Button
                className="w-full"
                asChild
                disabled={hasPassed}
              >
                <a
                  href={interview.meeting_link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Video className="w-4 h-4 mr-2" />
                  Join Meeting
                  <ExternalLink className="w-3 h-3 ml-2" />
                </a>
              </Button>
            </div>
          )}

          {/* Actions */}
          {interview.status === "pending" && !hasPassed && (
            <div className="flex gap-2">
              {isEmployer && (
                <>
                  <Button
                    size="sm"
                    onClick={onConfirm}
                    className="flex-1"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Confirm
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onCancel}
                    className="flex-1"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Decline
                  </Button>
                </>
              )}
              {!isEmployer && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onCancel}
                  className="flex-1"
                >
                  <X className="w-4 h-4 mr-1" />
                  Cancel Request
                </Button>
              )}
            </div>
          )}

          {interview.status === "confirmed" && !interview.meeting_link && isEmployer && !hasPassed && (
            <Button
              size="sm"
              variant="outline"
              onClick={onAddMeetingLink}
              className="w-full"
            >
              <Video className="w-4 h-4 mr-2" />
              Add Meeting Link
            </Button>
          )}

          {interview.status === "confirmed" && !hasPassed && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onCancel}
              className="w-full mt-2 text-muted-foreground"
            >
              Cancel Interview
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
