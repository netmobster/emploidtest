import { motion } from "framer-motion";
import { Sparkles, User, Clock, MessageCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getCategoryColor } from "@/data/quickFireQuestions";
import { cn } from "@/lib/utils";

interface QuizResponse {
  questionId: string;
  question: string;
  answer: string;
}

interface InterviewInsight {
  id: string;
  match_id: string;
  candidate_id: string;
  employer_id: string;
  responses: QuizResponse[];
  completed_at: string;
}

interface QuizResultsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  insight: InterviewInsight | null;
  candidateName?: string;
  isEmployer?: boolean;
}

export function QuizResultsDialog({
  isOpen,
  onClose,
  insight,
  candidateName = "Candidate",
  isEmployer = true,
}: QuizResultsDialogProps) {
  if (!insight) return null;

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getCategory = (questionId: string): string => {
    const parts = questionId.split("-");
    if (parts.length >= 2) {
      const lastPart = parts[parts.length - 1];
      if (!isNaN(parseInt(lastPart, 10))) {
        return parts.slice(0, -1).join("-");
      }
    }
    if (questionId.startsWith("vibe")) return "vibe-check";
    if (questionId.startsWith("human")) return "human-element";
    if (questionId.startsWith("mindset")) return "marketing-mindset";
    return "vibe-check";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            {isEmployer ? "Quiz Responses" : "Your Quiz Responses"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-4 text-sm text-muted-foreground border-b border-border pb-3">
          <div className="flex items-center gap-1.5">
            <User className="w-4 h-4" />
            <span>{candidateName}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>{formatDate(insight.completed_at)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MessageCircle className="w-4 h-4" />
            <span>{insight.responses.length} responses</span>
          </div>
        </div>

        <ScrollArea className="max-h-[50vh] pr-4">
          <div className="space-y-4">
            {insight.responses.map((response, idx) => {
              const category = getCategory(response.questionId);
              return (
                <motion.div
                  key={response.questionId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="space-y-2"
                >
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-primary">
                        {idx + 1}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {response.question}
                      </p>
                      <Badge
                        variant="outline"
                        className={cn("mt-1 text-[10px]", getCategoryColor(category))}
                      >
                        {category
                          .split("-")
                          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                          .join(" ")}
                      </Badge>
                    </div>
                  </div>
                  <div className="ml-8 p-3 bg-secondary/50 rounded-lg border border-border">
                    <p className="text-sm text-foreground">{response.answer}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
