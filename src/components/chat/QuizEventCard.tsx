import { motion } from "framer-motion";
import { ClipboardList, Send, CheckCircle2 } from "lucide-react";

interface QuizEventCardProps {
  type: "sent" | "received" | "completed";
  employerName?: string;
  candidateName?: string;
  questionCount?: number;
}

export function QuizEventCard({
  type,
  employerName = "Employer",
  candidateName = "Candidate",
  questionCount = 0,
}: QuizEventCardProps) {
  if (type === "sent") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-[85%] ml-auto bg-primary/10 border border-primary/20 rounded-2xl rounded-br-md p-3"
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-full bg-primary/20">
            <Send className="w-3 h-3 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-foreground">
              Quiz sent to {candidateName}
            </p>
            <p className="text-xs text-muted-foreground">
              {questionCount} questions • Waiting for response
            </p>
          </div>
          <ClipboardList className="w-4 h-4 text-primary/60" />
        </div>
      </motion.div>
    );
  }

  if (type === "received") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-[85%] bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl rounded-bl-md p-3"
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-full bg-amber-100 dark:bg-amber-900/50">
            <ClipboardList className="w-3 h-3 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-foreground">
              Quiz from {employerName}
            </p>
            <p className="text-xs text-muted-foreground">
              {questionCount} questions to answer
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  // type === "completed"
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
          <p className="text-sm text-foreground">
            Quiz completed by {candidateName}
          </p>
          <p className="text-xs text-muted-foreground">
            Click to view responses
          </p>
        </div>
      </div>
    </motion.div>
  );
}
