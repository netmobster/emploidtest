import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { Day14Interstitial } from "@/components/onboarding/Day14Interstitial";
import { Loader2 } from "lucide-react";
import confetti from "canvas-confetti";

/**
 * Welcome Page - Post-OAuth Entry Point
 * 
 * This page is ONLY for brand new users immediately after Google OAuth.
 * It displays the Day14Interstitial (full-page narrative) as the primary experience.
 * The "Account Created" modal has been removed - the interstitial IS the welcome.
 */
const Welcome = () => {
  const navigate = useNavigate();
  const { user, profile, isLoading } = useAuth();
  const { markWalkthroughCompleted, isLoading: onboardingLoading } = useOnboarding();

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
    }
  }, [isLoading, user, navigate]);

  // Fire confetti on mount for celebration
  useEffect(() => {
    if (!isLoading && user && profile) {
      const timer = setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#8b5cf6", "#a78bfa", "#c4b5fd"],
        });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isLoading, user, profile]);

  const handleInterstitialComplete = async () => {
    await markWalkthroughCompleted();
    // Route candidates to V2 onboarding, employers to profile setup
    if (profile?.user_type === "candidate") {
      navigate("/candidate-onboarding-v2");
    } else {
      navigate("/profile-setup");
    }
  };

  if (isLoading || onboardingLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  // Always show the Day14 Interstitial for new users - this is THE welcome experience
  return (
    <Day14Interstitial
      userType={profile.user_type as "candidate" | "employer"}
      onComplete={handleInterstitialComplete}
    />
  );
};

export default Welcome;
