import { useState, useEffect, useRef } from "react";
import Joyride, { CallBackProps, STATUS, Step, ACTIONS, EVENTS } from "react-joyride";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { useFeatureToggle } from "@/contexts/FeatureToggleContext";
import { TourDebugPanel } from "@/components/onboarding/TourDebugPanel";

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

  // Helpful mount log to confirm the component is alive (previously it wasn't due to missing provider).
  useEffect(() => {
    console.log("[DashboardTour] Mounted", { userType });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Start tour automatically if conditions are met
  useEffect(() => {
    if (!isLoading && !status.hasCompletedDashboardTour) {
      // Small delay to ensure DOM elements are rendered
      const timer = setTimeout(() => {
        console.log("[DashboardTour] Auto-starting tour (not completed)");
        setRun(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isLoading, status.hasCompletedDashboardTour]);

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

  // Filter steps to only include ones with existing targets.
  // IMPORTANT: dashboards often mount async content; we retry a few times so we don't
  // permanently end up with 0 steps (which makes the tour look "broken").
  const [activeSteps, setActiveSteps] = useState<Step[]>([]);
  
  useEffect(() => {
    let cancelled = false;

    const compute = (attempt: number) => {
      if (cancelled) return;

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

      console.log("[DashboardTour] Step scan", {
        attempt,
        total: steps.length,
        valid: validSteps.length,
        missing: missingTargets,
        testMode: testMode.enabled,
        completed: status.hasCompletedDashboardTour,
      });

      if (validSteps.length > 0) {
        setActiveSteps(validSteps);
        return;
      }

      // Retry a few times while the dashboard finishes mounting data-driven UI.
      if (attempt < 6) {
        const delay = 250 + attempt * 250;
        window.setTimeout(() => compute(attempt + 1), delay);
      } else {
        setActiveSteps([]);
      }
    };

    compute(0);

    return () => {
      cancelled = true;
    };
  }, [steps, dashboardTourRestartNonce, status.hasCompletedDashboardTour, testMode.enabled]);

  // Don't mount Joyride until we have at least one valid step target.
  if (activeSteps.length === 0) {
    return (
      <TourDebugPanel
        title={`Tour Debug (${userType})`}
        status={status}
        isLoading={isLoading}
        restartNonce={dashboardTourRestartNonce}
        run={run}
        stepIndex={stepIndex}
        steps={steps}
      />
    );
  }

  return (
    <>
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

      <TourDebugPanel
        title={`Tour Debug (${userType})`}
        status={status}
        isLoading={isLoading}
        restartNonce={dashboardTourRestartNonce}
        run={run}
        stepIndex={stepIndex}
        steps={steps}
      />
    </>
  );
}
