import { motion, AnimatePresence } from "framer-motion";
import { GameQuestion } from "@/lib/gameData";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface SwipeCardProps {
  question: GameQuestion;
  currentIndex: number;
  totalQuestions: number;
  onAnswer: (questionId: string, answer: string) => void;
  onBack?: () => void;
  canGoBack?: boolean;
}

const SwipeCard = ({
  question,
  currentIndex,
  totalQuestions,
  onAnswer,
  onBack,
  canGoBack = false,
}: SwipeCardProps) => {
  const handleOptionClick = (option: string) => {
    onAnswer(question.id, option);
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Question {currentIndex + 1}</span>
          <span>{totalQuestions} total</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="h-full gradient-primary"
            initial={{ width: 0 }}
            animate={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, scale: 0.95, x: 50 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.95, x: -50 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-card rounded-3xl shadow-card p-8"
        >
          {/* Question */}
          <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
            {question.question}
          </h2>

          {/* Options */}
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <motion.button
                key={option}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleOptionClick(option)}
                className={cn(
                  "w-full p-4 rounded-xl text-left transition-all duration-200",
                  "border-2 border-border bg-secondary/50 text-foreground",
                  "hover:border-primary hover:bg-primary/10 hover:scale-[1.02]",
                  "active:scale-[0.98]"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full border-2 border-muted-foreground flex items-center justify-center" />
                  <span className="font-medium">{option}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Back button */}
      {canGoBack && (
        <div className="flex justify-center mt-8">
          <Button
            variant="outline"
            onClick={onBack}
            className="rounded-full px-6"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      )}
    </div>
  );
};

export default SwipeCard;
