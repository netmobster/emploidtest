import { motion } from "framer-motion";
import { Check, User, Heart, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface OnboardingStepperV2Props {
  currentStep: number;
  completedSteps: number[];
  className?: string;
}

const steps: Step[] = [
  { id: "identity", label: "Identity", icon: <User className="w-4 h-4" /> },
  { id: "culture", label: "Culture", icon: <Heart className="w-4 h-4" /> },
  { id: "synergy", label: "Synergy", icon: <Sparkles className="w-4 h-4" /> },
];

export function OnboardingStepperV2({ currentStep, completedSteps, className }: OnboardingStepperV2Props) {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between relative">
        {/* Progress line background */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-border mx-10" />
        
        {/* Active progress line */}
        <motion.div
          className="absolute top-5 left-0 h-0.5 bg-primary mx-10"
          initial={{ width: "0%" }}
          animate={{ 
            width: `${Math.min(currentStep / (steps.length - 1), 1) * 100}%` 
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        />
        
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(index);
          const isCurrent = currentStep === index;
          const isPast = index < currentStep;
          
          return (
            <div key={step.id} className="flex flex-col items-center z-10">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                  isCompleted || isPast
                    ? "bg-primary text-primary-foreground"
                    : isCurrent
                    ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500 }}
                  >
                    <Check className="w-5 h-5" />
                  </motion.div>
                ) : (
                  step.icon
                )}
              </motion.div>
              <span
                className={cn(
                  "mt-2 text-xs font-medium transition-colors",
                  isCurrent || isCompleted || isPast
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
