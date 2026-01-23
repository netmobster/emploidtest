import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ChevronDown,
  ChevronUp,
  Sparkles,
  Brain,
  User,
  Camera,
  X,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface GettingStartedStep {
  id: string;
  title: string;
  description: string;
  icon: typeof Sparkles;
  path: string;
  isComplete: boolean;
}

interface GettingStartedBannerProps {
  profile: {
    has_completed_synergy_quiz?: boolean | null;
    has_completed_culture_game?: boolean | null;
    bio?: string | null;
    avatar_url?: string | null;
    skills?: string[] | null;
    user_type: string;
  };
  onDismiss?: () => void;
}

export function GettingStartedBanner({ profile, onDismiss }: GettingStartedBannerProps) {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);

  // Check localStorage for dismissed state
  useEffect(() => {
    const dismissed = localStorage.getItem("getting-started-dismissed");
    if (dismissed) {
      const dismissedDate = new Date(dismissed);
      const now = new Date();
      const daysSinceDismissed = Math.floor(
        (now.getTime() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      // Show again after 3 days
      if (daysSinceDismissed < 3) {
        setIsDismissed(true);
      }
    }

    // Auto-expand on first visit
    const hasSeenBanner = localStorage.getItem("getting-started-seen");
    if (!hasSeenBanner) {
      setIsExpanded(true);
      localStorage.setItem("getting-started-seen", "true");
    } else {
      setIsExpanded(false);
    }
  }, []);

  const steps: GettingStartedStep[] = [
    {
      id: "synergy",
      title: "Take the Synergy Quiz",
      description: "Discover your work style and get better matches",
      icon: Brain,
      path: "/synergy-score-quiz",
      isComplete: !!profile.has_completed_synergy_quiz,
    },
    {
      id: "bio",
      title: "Write your bio",
      description: "Help others understand who you are",
      icon: User,
      path: profile.user_type === "employer" ? "/company-profile" : "/candidate-profile",
      isComplete: !!profile.bio && profile.bio.length > 10,
    },
    {
      id: "photo",
      title: "Add a profile photo",
      description: "Profiles with photos get 5x more views",
      icon: Camera,
      path: profile.user_type === "employer" ? "/employer-dashboard" : "/candidate-extended-profile",
      isComplete: !!profile.avatar_url,
    },
  ];

  // Add skills step only for candidates
  if (profile.user_type === "candidate") {
    steps.push({
      id: "skills",
      title: "Add your skills",
      description: "Match with jobs that need your expertise",
      icon: Sparkles,
      path: "/candidate-extended-profile",
      isComplete: !!profile.skills && profile.skills.length >= 3,
    });
  }

  const completedCount = steps.filter((s) => s.isComplete).length;
  const progress = Math.round((completedCount / steps.length) * 100);
  const isAllComplete = completedCount === steps.length;

  // Don't show if dismissed or all complete
  if (isDismissed || isAllComplete) {
    return null;
  }

  const handleDismiss = () => {
    localStorage.setItem("getting-started-dismissed", new Date().toISOString());
    setIsDismissed(true);
    onDismiss?.();
  };

  const handleStepClick = (step: GettingStartedStep) => {
    if (!step.isComplete) {
      navigate(step.path);
    }
  };

  const incompleteSteps = steps.filter((s) => !s.isComplete);
  const nextStep = incompleteSteps[0];

  return (
    <Card className="mb-4 sm:mb-6 overflow-hidden bg-gradient-to-br from-primary/5 via-card to-accent/5 border-primary/20">
      {/* Header - always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 sm:p-4 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">
              Complete your profile
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {completedCount} of {steps.length} steps done
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <div className="hidden sm:flex items-center gap-2">
            <Progress value={progress} className="w-20 h-2" />
            <span className="text-sm font-medium text-foreground">{progress}%</span>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Mobile progress bar */}
      <div className="sm:hidden px-4 pb-2">
        <div className="flex items-center gap-2">
          <Progress value={progress} className="flex-1 h-2" />
          <span className="text-xs font-medium text-foreground">{progress}%</span>
        </div>
      </div>

      {/* Expandable content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-2">
              {steps.map((step, index) => (
                <motion.button
                  key={step.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleStepClick(step)}
                  disabled={step.isComplete}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left",
                    step.isComplete
                      ? "bg-primary/5 cursor-default"
                      : "bg-card hover:bg-muted/50 cursor-pointer border border-border hover:border-primary/30"
                  )}
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                      step.isComplete
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    {step.isComplete ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <step.icon className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "font-medium text-sm truncate",
                        step.isComplete
                          ? "text-muted-foreground line-through"
                          : "text-foreground"
                      )}
                    >
                      {step.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {step.description}
                    </p>
                  </div>
                  {!step.isComplete && (
                    <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  )}
                </motion.button>
              ))}

              {/* Actions */}
              <div className="flex items-center justify-between pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDismiss}
                  className="text-muted-foreground text-xs"
                >
                  <X className="w-3 h-3 mr-1" />
                  Skip for now
                </Button>
                {nextStep && (
                  <Button
                    size="sm"
                    onClick={() => handleStepClick(nextStep)}
                    className="text-xs"
                  >
                    {nextStep.title}
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
