import { motion } from "framer-motion";
import { CheckCircle, Sparkles, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuizCompletionSummaryProps {
  employerName: string;
  questionCount: number;
  onViewChat: () => void;
  onClose: () => void;
}

export function QuizCompletionSummary({
  employerName,
  questionCount,
  onViewChat,
  onClose,
}: QuizCompletionSummaryProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        className="w-full max-w-sm bg-card border border-border rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Success Animation */}
        <div className="bg-gradient-to-br from-primary/20 to-accent/20 p-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="w-20 h-20 mx-auto rounded-full bg-primary/20 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.4 }}
            >
              <CheckCircle className="w-10 h-10 text-primary" />
            </motion.div>
          </motion.div>
        </div>

        <div className="p-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-xl font-bold text-foreground mb-2">
              Quiz Complete! 🎉
            </h2>
            <p className="text-muted-foreground text-sm mb-6">
              You answered {questionCount} questions. Your responses have been sent to {employerName}.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-3"
          >
            <Button 
              onClick={onViewChat} 
              className="w-full gap-2"
              size="lg"
            >
              <MessageCircle className="w-4 h-4" />
              Back to Chat
            </Button>
            <Button 
              onClick={onClose} 
              variant="ghost"
              className="w-full text-muted-foreground"
            >
              Close
            </Button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-xs text-muted-foreground mt-4 flex items-center justify-center gap-1"
          >
            <Sparkles className="w-3 h-3" />
            Your insights are now visible in the chat
          </motion.p>
        </div>
      </motion.div>
    </motion.div>
  );
}
