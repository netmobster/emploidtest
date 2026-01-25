import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Logo from "@/components/Logo";
import { OnboardingStepperV2 } from "@/components/onboarding/OnboardingStepperV2";
import { IdentityStep } from "@/components/onboarding/IdentityStep";
import { CultureQuizStep } from "@/components/onboarding/CultureQuizStep";
import { SynergyQuizStep } from "@/components/onboarding/SynergyQuizStep";
import { SynergyFoundScreen } from "@/components/onboarding/SynergyFoundScreen";

type OnboardingStep = "identity" | "culture" | "synergy" | "success";

const CandidateOnboardingV2 = () => {
  const navigate = useNavigate();
  const { user, profile, isLoading, refreshProfile } = useAuth();
  
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("identity");
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [cultureSkipped, setCultureSkipped] = useState(false);
  const [synergySkipped, setSynergySkipped] = useState(false);

  // Redirect logic
  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
      return;
    }

    if (!isLoading && profile) {
      // If not a candidate, redirect to employer flow
      if (profile.user_type !== "candidate") {
        navigate("/employer-onboarding");
        return;
      }

      // Check if already completed - skip to dashboard
      if (profile.has_completed_culture_game && profile.has_completed_synergy_quiz) {
        navigate("/candidate-dashboard");
        return;
      }

      // If profile already complete, skip identity step
      if (profile.has_completed_profile) {
        setCompletedSteps([0]);
        // Check if culture is done
        if (profile.has_completed_culture_game) {
          setCompletedSteps([0, 1]);
          setCurrentStep("synergy");
        } else {
          setCurrentStep("culture");
        }
      }
    }
  }, [user, profile, isLoading, navigate]);

  const getStepIndex = (step: OnboardingStep): number => {
    switch (step) {
      case "identity": return 0;
      case "culture": return 1;
      case "synergy": return 2;
      case "success": return 3;
      default: return 0;
    }
  };

  const handleIdentityComplete = () => {
    setCompletedSteps([0]);
    setCurrentStep("culture");
  };

  const handleCultureComplete = () => {
    setCompletedSteps([0, 1]);
    setCurrentStep("synergy");
  };

  const handleCultureSkip = () => {
    setCultureSkipped(true);
    // If skipped, go directly to dashboard
    navigate("/candidate-dashboard");
  };

  const handleSynergyComplete = async () => {
    await refreshProfile();
    setCompletedSteps([0, 1, 2]);
    // Show success screen only if both quizzes were completed
    if (!cultureSkipped) {
      setCurrentStep("success");
    } else {
      navigate("/candidate-dashboard");
    }
  };

  const handleSynergySkip = () => {
    setSynergySkipped(true);
    // If skipped, go directly to dashboard
    navigate("/candidate-dashboard");
  };

  const handleSuccessContinue = () => {
    // Navigate to dashboard with matches prioritized (handled by dashboard)
    navigate("/candidate-dashboard?showMatches=true");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-center mb-8">
          <Logo size="md" />
        </div>

        {/* Progress Stepper - only show for main steps, not success */}
        {currentStep !== "success" && (
          <OnboardingStepperV2
            currentStep={getStepIndex(currentStep)}
            completedSteps={completedSteps}
            className="mb-10"
          />
        )}

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {currentStep === "identity" && (
            <motion.div
              key="identity"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <IdentityStep onComplete={handleIdentityComplete} />
            </motion.div>
          )}

          {currentStep === "culture" && (
            <motion.div
              key="culture"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <CultureQuizStep
                onComplete={handleCultureComplete}
                onSkip={handleCultureSkip}
              />
            </motion.div>
          )}

          {currentStep === "synergy" && (
            <motion.div
              key="synergy"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <SynergyQuizStep
                onComplete={handleSynergyComplete}
                onSkip={handleSynergySkip}
              />
            </motion.div>
          )}

          {currentStep === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <SynergyFoundScreen onContinue={handleSuccessContinue} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CandidateOnboardingV2;
