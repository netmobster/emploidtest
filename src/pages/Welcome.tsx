import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Sparkles, ArrowRight, CheckCircle2, User, Building2 } from "lucide-react";
import Logo from "@/components/Logo";
import confetti from "canvas-confetti";

const Welcome = () => {
  const navigate = useNavigate();
  const { user, profile, isLoading } = useAuth();

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
    }
  }, [isLoading, user, navigate]);

  // Fire confetti on mount
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

  const handleContinue = () => {
    navigate("/profile-setup");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  const isEmployer = profile.user_type === "employer";
  const displayName = profile.full_name || user.email?.split("@")[0] || "there";

  const steps = isEmployer
    ? [
        { label: "Complete your profile & company details", icon: Building2 },
        { label: "Define your ideal culture fit", icon: Sparkles },
        { label: "Post jobs & discover matching candidates", icon: User },
      ]
    : [
        { label: "Complete your profile", icon: User },
        { label: "Share your work preferences & culture", icon: Sparkles },
        { label: "Get matched with great companies", icon: Building2 },
      ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="bg-card rounded-3xl p-8 shadow-elegant border border-border">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center"
            >
              <CheckCircle2 className="w-10 h-10 text-primary" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Welcome, {displayName}! 🎉
              </h1>
              <p className="text-muted-foreground">
                Your account has been created successfully.
              </p>
            </motion.div>
          </div>

          {/* User type badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex justify-center mb-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary">
              {isEmployer ? (
                <Building2 className="w-4 h-4" />
              ) : (
                <User className="w-4 h-4" />
              )}
              <span className="text-sm font-medium capitalize">
                {profile.user_type} Account
              </span>
            </div>
          </motion.div>

          {/* What's next section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-8"
          >
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 text-center">
              What's Next
            </h2>
            <div className="space-y-3">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-primary">
                      {index + 1}
                    </span>
                  </div>
                  <p className="text-sm text-foreground flex-1">{step.label}</p>
                  <step.icon className="w-4 h-4 text-muted-foreground" />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <Button
              onClick={handleContinue}
              className="w-full h-12 text-base gap-2"
            >
              Let's Get Started
              <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>

          {/* Powered by */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-6 flex justify-center"
          >
            <Logo size="sm" />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Welcome;