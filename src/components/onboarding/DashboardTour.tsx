import { useState, useEffect, useRef } from "react";
import Joyride, { CallBackProps, STATUS, Step, ACTIONS, EVENTS } from "react-joyride";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { useFeatureToggle } from "@/contexts/FeatureToggleContext";

interface DashboardTourProps {
  steps: Step[];
  userType: "employer" | "candidate";
}

const joyrideStyles = {
  options: {
    arrowColor: "hsl(240 10% 15%)",
    backgroundColor: "hsl(240 10% 15%)",
    overlayColor: "rgba(0, 0, 0, 0.75)",
    primaryColor: "hsl(262 83% 58%)",
    textColor: "hsl(0 0% 95%)",
    zIndex: 10000,
  },
  tooltip: {
    borderRadius: 16,
    padding: 0,
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
    border: "1px solid hsl(240 5% 26%)",
  },
  tooltipContainer: {
    textAlign: "left" as const,
  },
  tooltipTitle: {
    fontSize: 18,
    fontWeight: 600,
    padding: "16px 20px 8px",
    borderBottom: "none",
  },
  tooltipContent: {
    padding: "0 20px 16px",
    fontSize: 14,
    lineHeight: 1.6,
  },
  tooltipFooter: {
    padding: "12px 20px",
    borderTop: "1px solid hsl(240 5% 26%)",
    marginTop: 0,
  },
  buttonNext: {
    backgroundColor: "hsl(262 83% 58%)",
    borderRadius: 8,
    fontWeight: 500,
    fontSize: 14,
    padding: "8px 16px",
  },
  buttonBack: {
    color: "hsl(240 5% 65%)",
    marginRight: 10,
    fontSize: 14,
  },
  buttonSkip: {
    color: "hsl(240 5% 65%)",
    fontSize: 13,
  },
  spotlight: {
    borderRadius: 12,
  },
};

export function DashboardTour({ steps, userType }: DashboardTourProps) {
  const { status, markDashboardTourCompleted, isLoading, dashboardTourRestartNonce } = useOnboarding();
  const { testMode } = useFeatureToggle();
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const previousNonce = useRef(dashboardTourRestartNonce);

  // Start tour automatically if conditions are met
  // Tour should run when Public Mode is OFF (real mode)
  useEffect(() => {
    if (!isLoading && !status.hasCompletedDashboardTour && !testMode.enabled) {
      // Small delay to ensure DOM elements are rendered
      const timer = setTimeout(() => {
        console.log("[DashboardTour] Auto-starting tour (not completed, not in test mode)");
        setRun(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isLoading, status.hasCompletedDashboardTour, testMode.enabled]);

  // Handle restart nonce changes (from "Restart Tour" button)
  useEffect(() => {
    if (dashboardTourRestartNonce > previousNonce.current) {
      console.log("[DashboardTour] Restart triggered via nonce change:", dashboardTourRestartNonce);
      previousNonce.current = dashboardTourRestartNonce;
      setStepIndex(0);
      // Force a re-run by toggling off then on
      setRun(false);
      setTimeout(() => {
        setRun(true);
      }, 100);
    }
  }, [dashboardTourRestartNonce]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status: joyrideStatus, action, index, type } = data;

    // Handle step changes
    if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
      setStepIndex(index + (action === ACTIONS.PREV ? -1 : 1));
    }

    // Handle tour completion
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];
    if (finishedStatuses.includes(joyrideStatus)) {
      setRun(false);
      markDashboardTourCompleted();
    }
  };

  // Filter steps to only include ones with existing targets
  const [activeSteps, setActiveSteps] = useState<Step[]>([]);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      const validSteps: Step[] = [];
      const missingTargets: string[] = [];
      
      steps.forEach((step) => {
        const target = step.target as string;
        const element = document.querySelector(target) as HTMLElement | null;
        if (element && element.offsetParent !== null) {
          validSteps.push(step);
        } else {
          missingTargets.push(target);
        }
      });
      
      if (missingTargets.length > 0) {
        console.warn("[DashboardTour] Missing targets:", missingTargets);
      }
      console.log("[DashboardTour] Valid steps:", validSteps.length, "of", steps.length);
      
      setActiveSteps(validSteps);
    }, 500);
    return () => clearTimeout(timer);
  }, [steps]);

  // Only render when Public Mode is OFF (real mode) and we have valid steps
  if (testMode.enabled || activeSteps.length === 0) {
    return null;
  }

  return (
    <Joyride
      steps={activeSteps}
      run={run}
      stepIndex={stepIndex}
      continuous
      showProgress
      showSkipButton
      disableOverlayClose
      spotlightClicks
      callback={handleJoyrideCallback}
      styles={joyrideStyles}
      locale={{
        back: "Back",
        close: "Close",
        last: "Finish",
        next: "Next",
        skip: "Skip Tour",
      }}
      floaterProps={{
        disableAnimation: true,
      }}
    />
  );
}
