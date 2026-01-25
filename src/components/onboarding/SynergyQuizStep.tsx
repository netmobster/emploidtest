import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Category } from "@/data/questions";

interface SynergyQuizStepProps {
  onComplete: () => void;
  onSkip: () => void;
}

// Synergy questions - A/B choice format
const SYNERGY_QUESTIONS = [
  {
    id: "autonomy_1",
    category: "autonomy" as Category,
    optionA: "I prefer clear guidelines and structured tasks",
    optionB: "I thrive when I can define my own approach",
  },
  {
    id: "collaboration_1",
    category: "collaboration" as Category,
    optionA: "I do my best work independently",
    optionB: "I energize from team collaboration",
  },
  {
    id: "impact_1",
    category: "impact" as Category,
    optionA: "I focus on executing tasks excellently",
    optionB: "I want to see the big-picture impact of my work",
  },
  {
    id: "security_1",
    category: "security" as Category,
    optionA: "I value stability and predictability",
    optionB: "I embrace change and new challenges",
  },
  {
    id: "recognition_1",
    category: "recognition" as Category,
    optionA: "I'm content knowing I did great work",
    optionB: "I appreciate public acknowledgment of my contributions",
  },
  {
    id: "autonomy_2",
    category: "autonomy" as Category,
    optionA: "I like having my day planned out",
    optionB: "I prefer flexibility in how I organize my time",
  },
  {
    id: "collaboration_2",
    category: "collaboration" as Category,
    optionA: "I prefer written async communication",
    optionB: "I prefer real-time discussions and meetings",
  },
  {
    id: "impact_2",
    category: "impact" as Category,
    optionA: "I focus on my immediate responsibilities",
    optionB: "I want to influence company direction",
  },
  {
    id: "security_2",
    category: "security" as Category,
    optionA: "I prefer a proven, established company",
    optionB: "I'm excited by startup environments",
  },
  {
    id: "recognition_2",
    category: "recognition" as Category,
    optionA: "Competitive salary is my priority",
    optionB: "Growth opportunities matter more than compensation",
  },
];

export function SynergyQuizStep({ onComplete, onSkip }: SynergyQuizStepProps) {
  const { user, refreshProfile } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, "A" | "B">>({});
  const [isSaving, setIsSaving] = useState(false);

  const currentQuestion = SYNERGY_QUESTIONS[currentIndex];
  const progress = ((currentIndex + 1) / SYNERGY_QUESTIONS.length) * 100;

  const handleAnswer = async (choice: "A" | "B") => {
    const newAnswers = { ...answers, [currentQuestion.id]: choice };
    setAnswers(newAnswers);

    if (currentIndex < SYNERGY_QUESTIONS.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      await saveSynergyScores(newAnswers);
    }
  };

  const calculateScores = (finalAnswers: Record<string, "A" | "B">) => {
    const categoryScores: Record<Category, number> = {
      autonomy: 5,
      collaboration: 5,
      impact: 5,
      security: 5,
      recognition: 5,
    };

    SYNERGY_QUESTIONS.forEach((q) => {
      const answer = finalAnswers[q.id];
      if (answer === "B") {
        categoryScores[q.category] += 2.5;
      } else {
        categoryScores[q.category] -= 2.5;
      }
    });

    // Normalize to 0-10 range
    Object.keys(categoryScores).forEach((key) => {
      const k = key as Category;
      categoryScores[k] = Math.max(0, Math.min(10, categoryScores[k]));
    });

    return categoryScores;
  };

  const saveSynergyScores = async (finalAnswers: Record<string, "A" | "B">) => {
    if (!user) return;

    setIsSaving(true);
    try {
      const scores = calculateScores(finalAnswers);

      const { error } = await supabase
        .from("profiles")
        .update({
          synergy_scores: scores,
          has_completed_synergy_quiz: true,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (error) throw error;

      await refreshProfile();
      toast.success("Synergy profile saved!");
      onComplete();
    } catch (error: any) {
      toast.error(error.message || "Failed to save synergy scores");
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
        <p className="text-muted-foreground">Calculating your synergy...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-lg mx-auto"
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
          <Sparkles className="w-6 h-6 text-primary" />
        </div>
        <h2 className="text-lg font-semibold text-foreground mb-1">
          Discover your work DNA
        </h2>
        <p className="text-sm text-muted-foreground">
          Question {currentIndex + 1} of {SYNERGY_QUESTIONS.length}
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
          <h3 className="text-lg font-semibold text-foreground text-center mb-6">
            Which resonates more with you?
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              onClick={() => handleAnswer("A")}
              className={cn(
                "p-6 text-center rounded-xl border-2 transition-all duration-200 min-h-[140px] flex items-center justify-center",
                "hover:border-primary hover:bg-primary/5",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                answers[currentQuestion.id] === "A"
                  ? "border-primary bg-primary/10"
                  : "border-border bg-card"
              )}
            >
              <div>
                <span className="text-2xl font-bold text-primary mb-2 block">A</span>
                <span className="text-sm text-foreground">{currentQuestion.optionA}</span>
              </div>
            </motion.button>

            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              onClick={() => handleAnswer("B")}
              className={cn(
                "p-6 text-center rounded-xl border-2 transition-all duration-200 min-h-[140px] flex items-center justify-center",
                "hover:border-primary hover:bg-primary/5",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                answers[currentQuestion.id] === "B"
                  ? "border-primary bg-primary/10"
                  : "border-border bg-card"
              )}
            >
              <div>
                <span className="text-2xl font-bold text-primary mb-2 block">B</span>
                <span className="text-sm text-foreground">{currentQuestion.optionB}</span>
              </div>
            </motion.button>
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
