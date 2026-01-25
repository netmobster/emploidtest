import { useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, CheckCircle, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";

interface SynergyFoundScreenProps {
  matchReadiness: number;
  onContinue: () => void;
  userType?: "candidate" | "employer";
}

export function SynergyFoundScreen({ matchReadiness, onContinue, userType = "candidate" }: SynergyFoundScreenProps) {
  useEffect(() => {
    // Fire confetti celebration
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ["#8b5cf6", "#a78bfa", "#c4b5fd", "#22c55e", "#4ade80"],
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ["#8b5cf6", "#a78bfa", "#c4b5fd", "#22c55e", "#4ade80"],
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  const isEmployer = userType === "employer";
  const title = isEmployer ? "Strategic Briefing Complete!" : "Synergy Found!";
  const subtitle = isEmployer 
    ? "Your company profile is ready. Let's find your perfect candidates."
    : "We've mapped your work DNA. You're ready for meaningful connections.";
  const ctaText = isEmployer ? "See High-Synergy Candidates" : "See Your Matches";
  const Icon = isEmployer ? Building2 : Sparkles;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md w-full"
      >
        {/* Celebration Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mb-8"
        >
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center shadow-lg">
            <Icon className="w-12 h-12 text-primary-foreground" />
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl sm:text-4xl font-bold text-foreground mb-4"
        >
          🎉 {title} 🎉
        </motion.h1>

        {/* Match Readiness Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6"
        >
          <div className="inline-flex flex-col items-center bg-card border border-border rounded-2xl p-6 shadow-lg">
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.6, type: "spring", stiffness: 150 }}
              className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-primary to-green-500 bg-clip-text text-transparent"
            >
              {matchReadiness}%
            </motion.span>
            <span className="text-sm text-muted-foreground mt-2">
              {isEmployer ? "Profile Strength" : "Match Readiness"}
            </span>
          </div>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-muted-foreground mb-8 text-lg"
        >
          {subtitle}
        </motion.p>

        {/* Completion badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-wrap justify-center gap-2 mb-8"
        >
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 text-green-600 rounded-full text-sm">
            <CheckCircle className="w-4 h-4" />
            <span>{isEmployer ? "Identity Verified" : "Profile Complete"}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 text-green-600 rounded-full text-sm">
            <CheckCircle className="w-4 h-4" />
            <span>Culture Mapped</span>
          </div>
          {!isEmployer && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 text-green-600 rounded-full text-sm">
              <CheckCircle className="w-4 h-4" />
              <span>Synergy Analyzed</span>
            </div>
          )}
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Button
            size="lg"
            onClick={onContinue}
            className="gap-2 text-lg px-8 py-6"
          >
            {ctaText}
            <ArrowRight className="w-5 h-5" />
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
