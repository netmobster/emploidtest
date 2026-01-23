import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, User, Building2 } from "lucide-react";
import Logo from "@/components/Logo";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, profile, isLoading: authLoading, refreshProfile } = useAuth();
  
  const defaultUserType = (searchParams.get("type") as "employer" | "candidate") || "candidate";
  
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState<"employer" | "candidate">(defaultUserType);
  const hasUpdatedProfile = useRef(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth?type=${userType}`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        toast.error(error.message);
      }
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Combined effect: update profile user_type if needed, then redirect
  useEffect(() => {
    const handleAuthRedirect = async () => {
      if (!user || authLoading || !profile) return;

      // If profile user_type doesn't match URL param and profile isn't complete, update it first
      if (profile.user_type !== defaultUserType && !profile.has_completed_profile && !hasUpdatedProfile.current) {
        hasUpdatedProfile.current = true;
        const { error } = await supabase
          .from("profiles")
          .update({ user_type: defaultUserType })
          .eq("user_id", user.id);
        
        if (!error) {
          await refreshProfile();
          return; // Wait for profile refresh before redirecting
        }
      }

      // Now handle redirect based on onboarding state
      if (!profile.has_completed_profile) {
        navigate("/profile-setup", { replace: true });
        return;
      }
      
      if (!profile.has_completed_culture_game) {
        const destination = profile.user_type === "employer" ? "/employer-onboarding" : "/candidate-onboarding";
        navigate(destination, { replace: true });
        return;
      }
      
      // Fully onboarded - go to dashboard
      const dashboard = profile.user_type === "employer" ? "/employer-dashboard" : "/candidate-dashboard";
      navigate(dashboard, { replace: true });
    };

    handleAuthRedirect();
  }, [user, authLoading, profile, defaultUserType, refreshProfile, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-card rounded-2xl p-8 shadow-elegant">
          <div className="text-center mb-8">
            <Logo size="md" className="mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Welcome
            </h1>
            <p className="text-muted-foreground">
              Sign in or create an account to continue
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-sm text-muted-foreground mb-3 text-center">I am a...</p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={userType === "candidate" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setUserType("candidate")}
                >
                  <User className="w-4 h-4 mr-2" />
                  Candidate
                </Button>
                <Button
                  type="button"
                  variant={userType === "employer" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setUserType("employer")}
                >
                  <Building2 className="w-4 h-4 mr-2" />
                  Employer
                </Button>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full h-12"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              Continue with Google
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
