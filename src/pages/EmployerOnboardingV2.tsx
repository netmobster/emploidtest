import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Heart, Users, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { OnboardingStepperV2, Step } from "@/components/onboarding/OnboardingStepperV2";
import { EmployerIdentityStep } from "@/components/onboarding/EmployerIdentityStep";
import { EmployerCultureStep } from "@/components/onboarding/EmployerCultureStep";
import { EmployerTeamStep } from "@/components/onboarding/EmployerTeamStep";
import { SynergyFoundScreen } from "@/components/onboarding/SynergyFoundScreen";
import Logo from "@/components/Logo";

const EMPLOYER_STEPS: Step[] = [
  { id: "identity", label: "Identity", icon: <Building2 className="w-4 h-4" /> },
  { id: "culture", label: "Culture", icon: <Heart className="w-4 h-4" /> },
  { id: "team", label: "Team", icon: <Users className="w-4 h-4" /> },
];

export default function EmployerOnboardingV2() {
  const navigate = useNavigate();
  const { user, profile, isLoading: authLoading } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [cultureSkipped, setCultureSkipped] = useState(false);
  const [teamSkipped, setTeamSkipped] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Redirect if not logged in or not employer
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth?type=employer");
      return;
    }
    if (!authLoading && profile?.user_type !== "employer") {
      navigate("/candidate-onboarding-v2");
      return;
    }
    if (!authLoading && profile) {
      // Fully done - redirect to dashboard
      if (profile.has_completed_profile && profile.has_completed_culture_game && (profile as any).team_environment) {
        navigate("/employer-dashboard", { replace: true });
        return;
      }
      // Resume: skip already-completed steps
      if (profile.has_completed_profile && profile.company_name) {
        if (profile.has_completed_culture_game) {
          setCompletedSteps([0, 1]);
          setCurrentStep(2);
        } else {
          setCompletedSteps([0]);
          setCurrentStep(1);
        }
      }
    }
  }, [user, profile, authLoading, navigate]);

  if (authLoading || !user || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleStepComplete = (stepIndex: number) => {
    setCompletedSteps(prev => [...prev, stepIndex]);
    
    if (stepIndex < EMPLOYER_STEPS.length - 1) {
      setCurrentStep(stepIndex + 1);
    } else {
      // Last step completed - check if culture was completed for success screen
      if (!cultureSkipped) {
        setShowSuccess(true);
      } else {
        navigate("/employer-dashboard");
      }
    }
  };

  const handleCultureSkip = () => {
    setCultureSkipped(true);
    setCurrentStep(2); // Move to team step
  };

  const handleTeamSkip = () => {
    setTeamSkipped(true);
    // If culture was also skipped, go straight to dashboard
    if (cultureSkipped) {
      navigate("/employer-dashboard");
    } else {
      setShowSuccess(true);
    }
  };

  const handleSuccessContinue = () => {
    navigate("/employer-dashboard?showCandidates=true");
  };

  const calculateMatchReadiness = (): number => {
    let score = 0;
    if (profile.company_name) score += 20;
    if (profile.company_website) score += 10;
    if (profile.has_completed_culture_game) score += 30;
    if (profile.bio) score += 15;
    if (profile.avatar_url) score += 10;
    if ((profile as any).team_environment) score += 15;
    return Math.min(score, 100);
  };

  // Show success screen
  if (showSuccess) {
    return (
      <SynergyFoundScreen
        matchReadiness={calculateMatchReadiness()}
        onContinue={handleSuccessContinue}
        userType="employer"
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="px-4 sm:px-6">
          <div className="flex items-center justify-center h-14">
            <Logo size="sm" />
          </div>
        </div>
      </header>

      <main className="px-4 sm:px-6 py-8 max-w-2xl mx-auto">
        {/* Progress Stepper */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <OnboardingStepperV2
            steps={EMPLOYER_STEPS}
            currentStep={currentStep}
            completedSteps={completedSteps}
          />
        </motion.div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {currentStep === 0 && (
            <EmployerIdentityStep
              key="identity"
              onComplete={() => handleStepComplete(0)}
            />
          )}
          {currentStep === 1 && (
            <EmployerCultureStep
              key="culture"
              onComplete={() => handleStepComplete(1)}
              onSkip={handleCultureSkip}
            />
          )}
          {currentStep === 2 && (
            <EmployerTeamStep
              key="team"
              onComplete={() => handleStepComplete(2)}
              onSkip={handleTeamSkip}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}