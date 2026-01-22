import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sparkles, Clock, Play } from "lucide-react";

interface QuizMessageCardProps {
  employerName: string;
  questionCount: number;
  onStart: () => void;
  isCompleted?: boolean;
}

export function QuizMessageCard({
  employerName,
  questionCount,
  onStart,
  isCompleted = false,
}: QuizMessageCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-xs bg-gradient-to-br from-purple-500/10 via-primary/5 to-blue-500/10 border border-primary/30 rounded-2xl p-4 space-y-3"
    >
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h4 className="font-semibold text-sm text-foreground">
            Get-to-Know-You Quiz
          </h4>
          <p className="text-xs text-muted-foreground">
            From {employerName}
          </p>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        {isCompleted
          ? "You've completed this quiz! ✅"
          : `Answer ${questionCount} quick questions so they can get to know the real you.`}
      </p>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          ~2 min
        </span>
        <span>•</span>
        <span>{questionCount} questions</span>
      </div>

      {!isCompleted && (
        <Button onClick={onStart} className="w-full gap-2" size="sm">
          <Play className="w-4 h-4" />
          Start Quiz
        </Button>
      )}
    </motion.div>
  );
}
