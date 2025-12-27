import { useState } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { GameQuestion } from "@/lib/gameData";
import { Button } from "@/components/ui/button";
import { X, Check, RotateCcw } from "lucide-react";
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
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [exitDirection, setExitDirection] = useState<"left" | "right" | null>(null);
  const [dragX, setDragX] = useState(0);

  const handleDragEnd = (_: any, info: PanInfo) => {
    const threshold = 100;
    if (info.offset.x > threshold && selectedOption) {
      setExitDirection("right");
      setTimeout(() => onAnswer(question.id, selectedOption), 300);
    } else if (info.offset.x < -threshold) {
      setExitDirection("left");
      // Skip without answering (or handle differently)
    }
    setDragX(0);
  };

  const handleDrag = (_: any, info: PanInfo) => {
    setDragX(info.offset.x);
  };

  const handleConfirm = () => {
    if (selectedOption) {
      setExitDirection("right");
      setTimeout(() => onAnswer(question.id, selectedOption), 300);
    }
  };

  const handleSkip = () => {
    setExitDirection("left");
    setTimeout(() => onAnswer(question.id, ""), 300);
  };

  const rotation = dragX * 0.05;
  const opacity = Math.max(0.5, 1 - Math.abs(dragX) / 500);

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
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{
            opacity: exitDirection ? 0 : opacity,
            scale: 1,
            y: 0,
            x: exitDirection === "right" ? 300 : exitDirection === "left" ? -300 : dragX,
            rotate: exitDirection === "right" ? 20 : exitDirection === "left" ? -20 : rotation,
          }}
          exit={{
            opacity: 0,
            x: exitDirection === "right" ? 300 : -300,
            rotate: exitDirection === "right" ? 20 : -20,
          }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          className="bg-card rounded-3xl shadow-card p-8 cursor-grab active:cursor-grabbing"
        >
          {/* Swipe indicators */}
          <div className="absolute inset-0 pointer-events-none">
            <motion.div
              className="absolute top-8 left-8 px-4 py-2 rounded-lg bg-destructive/20 border-2 border-destructive text-destructive font-bold"
              animate={{ opacity: dragX < -50 ? 1 : 0 }}
            >
              SKIP
            </motion.div>
            <motion.div
              className="absolute top-8 right-8 px-4 py-2 rounded-lg bg-success/20 border-2 border-success text-success font-bold"
              animate={{ opacity: dragX > 50 && selectedOption ? 1 : 0 }}
            >
              CONFIRM
            </motion.div>
          </div>

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
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedOption(option)}
                className={cn(
                  "w-full p-4 rounded-xl text-left transition-all duration-200",
                  "border-2",
                  selectedOption === option
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border bg-secondary/50 text-foreground hover:border-primary/30 hover:bg-secondary"
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                      selectedOption === option
                        ? "border-primary bg-primary"
                        : "border-muted-foreground"
                    )}
                  >
                    {selectedOption === option && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-2 h-2 rounded-full bg-primary-foreground"
                      />
                    )}
                  </div>
                  <span className="font-medium">{option}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Action buttons */}
      <div className="flex justify-center gap-4 mt-8">
        {canGoBack && (
          <Button
            variant="outline"
            size="iconLg"
            onClick={onBack}
            className="rounded-full"
          >
            <RotateCcw className="w-6 h-6" />
          </Button>
        )}
        <Button
          variant="swipeNo"
          size="iconLg"
          onClick={handleSkip}
          className="rounded-full"
        >
          <X className="w-6 h-6" />
        </Button>
        <Button
          variant="swipeYes"
          size="iconLg"
          onClick={handleConfirm}
          disabled={!selectedOption}
          className="rounded-full"
        >
          <Check className="w-6 h-6" />
        </Button>
      </div>

      <p className="text-center text-sm text-muted-foreground mt-4">
        Select an option and swipe right to confirm, or left to skip
      </p>
    </div>
  );
};

export default SwipeCard;
