import { motion } from "framer-motion";
import { Sparkles, User, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { categoryColors } from "@/data/quickFireQuestions";
import { cn } from "@/lib/utils";

interface QuizResponse {
  questionId: string;
  question: string;
  answer: string;
}

interface QuizSummaryCardProps {
  candidateName: string;
  responses: QuizResponse[];
  completedAt: string;
}

export function QuizSummaryCard({
  candidateName,
  responses,
  completedAt,
}: QuizSummaryCardProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // Determine category from question ID prefix
  const getCategory = (questionId: string): string => {
    if (questionId.startsWith("vibe")) return "vibe-check";
    if (questionId.startsWith("human")) return "human-element";
    if (questionId.startsWith("mindset")) return "mindset";
    return "vibe-check";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-sm bg-gradient-to-br from-primary/5 via-background to-purple-500/5 border border-primary/20 rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 bg-primary/10 border-b border-primary/20">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-foreground">Candidate Deep-Dive</h3>
        </div>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <User className="w-3 h-3" />
          {candidateName} • {formatDate(completedAt)}
        </p>
      </div>

      {/* Responses */}
      <div className="p-4 space-y-4">
        {responses.map((response, idx) => (
          <div key={response.questionId} className="space-y-2">
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-[10px] font-bold text-primary">
                  {idx + 1}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {response.question}
                </p>
              </div>
            </div>
            <div className="ml-7 p-3 bg-background/80 rounded-lg border border-border">
              <p className="text-sm text-foreground">{response.answer}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 pb-4">
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <MessageCircle className="w-3 h-3" />
          <span>{responses.length} responses captured</span>
        </div>
      </div>
    </motion.div>
  );
}
