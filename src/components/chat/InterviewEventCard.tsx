import { motion } from "framer-motion";
import { Calendar, CheckCircle2, Send } from "lucide-react";
import { format } from "date-fns";

interface InterviewEventCardProps {
  type: "scheduled" | "confirmed" | "cancelled";
  scheduledAt: string;
  isOutgoing?: boolean;
}

export function InterviewEventCard({
  type,
  scheduledAt,
  isOutgoing = false,
}: InterviewEventCardProps) {
  const formattedDate = format(new Date(scheduledAt), "MMM d, yyyy 'at' h:mm a");

  if (type === "scheduled") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`max-w-[85%] ${isOutgoing ? 'ml-auto bg-primary/10 border-primary/20 rounded-br-md' : 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 rounded-bl-md'} border rounded-2xl p-3`}
      >
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-full ${isOutgoing ? 'bg-primary/20' : 'bg-blue-100 dark:bg-blue-900/50'}`}>
            <Calendar className={`w-3 h-3 ${isOutgoing ? 'text-primary' : 'text-blue-600 dark:text-blue-400'}`} />
          </div>
          <div className="flex-1">
            <p className="text-sm text-foreground font-medium">
              Interview Scheduled
            </p>
            <p className="text-xs text-muted-foreground">
              {formattedDate}
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  if (type === "confirmed") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-[85%] bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl rounded-bl-md p-3"
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/50">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-foreground font-medium">
              Interview Confirmed
            </p>
            <p className="text-xs text-muted-foreground">
              {formattedDate}
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  // cancelled
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-[85%] bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-2xl rounded-bl-md p-3"
    >
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-full bg-red-100 dark:bg-red-900/50">
          <Calendar className="w-3 h-3 text-red-600 dark:text-red-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-foreground font-medium">
            Interview Cancelled
          </p>
          <p className="text-xs text-muted-foreground line-through">
            {formattedDate}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
