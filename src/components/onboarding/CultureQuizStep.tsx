import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Heart, ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CultureQuizStepProps {
  onComplete: () => void;
  onSkip: () => void;
}

const CULTURE_QUESTIONS = [
  {
    id: "environment",
    question: "What work environment helps you thrive?",
    options: ["Structured & Predictable", "Dynamic & Fast-paced", "Creative & Flexible", "Mission-Driven"],
  },
  {
    id: "collaboration",
    question: "How do you prefer to collaborate?",
    options: ["Independent Work", "Small Team Collaboration", "Large Team Projects", "Mix of Both"],
  },
  {
    id: "motivation",
    question: "What motivates you most?",
    options: ["Stability & Security", "Growth & Challenge", "Impact & Purpose", "Recognition & Rewards"],
  },
  {
    id: "feedback",
    question: "How do you approach feedback?",
    options: ["Prefer Written Feedback", "Prefer Direct Conversations", "Regular Check-ins", "As Needed"],
  },
  {
    id: "balance",
    question: "What's your ideal work-life balance?",
    options: ["Clear Boundaries", "Flexible Integration", "Results-Focused", "Structured Hours"],
  },
  {
    id: "decisions",
    question: "How do you prefer decisions to be made?",
    options: ["Consensus-Driven", "Quick & Decisive", "Data-Informed", "Leader-Guided"],
  },
];

export function CultureQuizStep({ onComplete, onSkip }: CultureQuizStepProps) {
  const { user, refreshProfile } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const currentQuestion = CULTURE_QUESTIONS[currentIndex];
  const progress = ((currentIndex + 1) / CULTURE_QUESTIONS.length) * 100;

  const handleAnswer = async (answer: string) => {
    const newAnswers = { ...answers, [currentQuestion.id]: answer };
    setAnswers(newAnswers);

    if (currentIndex < CULTURE_QUESTIONS.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Save answers
      await saveCulturePreferences(newAnswers);
    }
  };

  const saveCulturePreferences = async (finalAnswers: Record<string, string>) => {
    if (!user) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          culture_preferences: finalAnswers,
          has_completed_culture_game: true,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (error) throw error;

      await refreshProfile();
      toast.success("Culture preferences saved!");
      onComplete();
    } catch (error: any) {
      toast.error(error.message || "Failed to save preferences");
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  if (isSaving) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Saving your preferences...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-md mx-auto"
    >
      {/* Header with Skip */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          disabled={currentIndex === 0}
          className="text-muted-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onSkip}
          className="text-muted-foreground hover:text-foreground"
        >
          Skip for Now
        </Button>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-muted rounded-full mb-8 overflow-hidden">
        <motion.div
          className="h-full bg-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div className="text-center mb-8">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Heart className="w-6 h-6 text-primary" />
        </div>
        <h2 className="text-lg font-semibold text-foreground mb-1">
          What makes work feel right?
        </h2>
        <p className="text-sm text-muted-foreground">
          Question {currentIndex + 1} of {CULTURE_QUESTIONS.length}
        </p>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <h3 className="text-xl font-bold text-foreground text-center mb-6">
            {currentQuestion.question}
          </h3>

          <div className="space-y-3">
            {currentQuestion.options.map((option, idx) => (
              <motion.button
                key={option}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => handleAnswer(option)}
                className={cn(
                  "w-full p-4 text-left rounded-xl border-2 transition-all duration-200",
                  "hover:border-primary hover:bg-primary/5",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                  answers[currentQuestion.id] === option
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card"
                )}
              >
                <span className="font-medium text-foreground">{option}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
