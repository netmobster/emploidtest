import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface OnboardingStatus {
  hasSeenPhilosophy: boolean;
  hasCompletedWalkthrough: boolean;
  hasCompletedDashboardTour: boolean;
}

interface OnboardingContextType {
  status: OnboardingStatus;
  isLoading: boolean;
  markPhilosophySeen: () => Promise<void>;
  markWalkthroughCompleted: () => Promise<void>;
  markDashboardTourCompleted: () => Promise<void>;
  refetch: () => Promise<void>;
}

const defaultStatus: OnboardingStatus = {
  hasSeenPhilosophy: false,
  hasCompletedWalkthrough: false,
  hasCompletedDashboardTour: false,
};

const OnboardingContext = createContext<OnboardingContextType>({
  status: defaultStatus,
  isLoading: true,
  markPhilosophySeen: async () => {},
  markWalkthroughCompleted: async () => {},
  markDashboardTourCompleted: async () => {},
  refetch: async () => {},
});

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [status, setStatus] = useState<OnboardingStatus>(defaultStatus);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStatus = useCallback(async () => {
    if (!user) {
      // Check localStorage for anonymous users
      const hasSeenPhilosophy = localStorage.getItem("has_seen_philosophy") === "true";
      setStatus({
        hasSeenPhilosophy,
        hasCompletedWalkthrough: false,
        hasCompletedDashboardTour: false,
      });
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("user_onboarding_status")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        console.error("Failed to fetch onboarding status:", error);
      }

      if (data) {
        setStatus({
          hasSeenPhilosophy: data.has_seen_philosophy || false,
          hasCompletedWalkthrough: data.has_completed_walkthrough || false,
          hasCompletedDashboardTour: data.has_completed_dashboard_tour || false,
        });
      } else {
        // Create initial record for new user
        const { error: insertError } = await supabase
          .from("user_onboarding_status")
          .insert({
            user_id: user.id,
            has_seen_philosophy: localStorage.getItem("has_seen_philosophy") === "true",
          });

        if (insertError) {
          console.error("Failed to create onboarding status:", insertError);
        }
      }
    } catch (err) {
      console.error("Failed to fetch onboarding status:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const markPhilosophySeen = async () => {
    localStorage.setItem("has_seen_philosophy", "true");
    setStatus((prev) => ({ ...prev, hasSeenPhilosophy: true }));

    if (user) {
      await supabase
        .from("user_onboarding_status")
        .upsert({
          user_id: user.id,
          has_seen_philosophy: true,
          philosophy_seen_at: new Date().toISOString(),
        }, { onConflict: "user_id" });
    }
  };

  const markWalkthroughCompleted = async () => {
    setStatus((prev) => ({ ...prev, hasCompletedWalkthrough: true }));

    if (user) {
      await supabase
        .from("user_onboarding_status")
        .update({
          has_completed_walkthrough: true,
          walkthrough_completed_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);
    }
  };

  const markDashboardTourCompleted = async () => {
    setStatus((prev) => ({ ...prev, hasCompletedDashboardTour: true }));

    if (user) {
      await supabase
        .from("user_onboarding_status")
        .update({
          has_completed_dashboard_tour: true,
          dashboard_tour_completed_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);
    }
  };

  return (
    <OnboardingContext.Provider
      value={{
        status,
        isLoading,
        markPhilosophySeen,
        markWalkthroughCompleted,
        markDashboardTourCompleted,
        refetch: fetchStatus,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error("useOnboarding must be used within OnboardingProvider");
  }
  return context;
}
