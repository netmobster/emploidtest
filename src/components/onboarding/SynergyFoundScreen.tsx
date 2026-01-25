import { useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import confetti from "canvas-confetti";

interface SynergyFoundScreenProps {
  onContinue: () => void;
}

export function SynergyFoundScreen({ onContinue }: SynergyFoundScreenProps) {
  const { profile } = useAuth();

  const calculateMatchReadiness = () => {
    if (!profile) return 0;
    
    let score = 0;
    if (profile.has_completed_culture_game) score += 30;
    if (profile.has_completed_synergy_quiz) score += 30;
    if (profile.full_name) score += 10;
    if (profile.bio) score += 10;
    if (profile.avatar_url) score += 10;
    if (profile.skills && Array.isArray(profile.skills) && profile.skills.length >= 3) score += 10;
    
    return Math.min(score, 100);
  };

  const matchReadiness = calculateMatchReadiness();

  // Fire confetti on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      // First burst
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#8b5cf6", "#a78bfa", "#c4b5fd", "#10b981", "#34d399"],
      });
      
      // Second burst
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ["#8b5cf6", "#a78bfa", "#c4b5fd"],
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ["#8b5cf6", "#a78bfa", "#c4b5fd"],
        });
      }, 200);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  const completionItems = [
    { label: "Culture Profile", completed: profile?.has_completed_culture_game },
    { label: "Synergy Profile", completed: profile?.has_completed_synergy_quiz },
    { label: "Basic Info", completed: !!profile?.full_name },
    { label: "Profile Photo", completed: !!profile?.avatar_url },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-md mx-auto text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
        className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
      >
        <Sparkles className="w-10 h-10 text-white" />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-3xl font-bold text-foreground mb-2"
      >
        🎉 Synergy Found!
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-muted-foreground mb-8"
      >
        We've mapped your work DNA. You're ready for meaningful connections.
      </motion.p>

      {/* Match Readiness Circle */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className="relative w-40 h-40 mx-auto mb-8"
      >
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="80"
            cy="80"
            r="70"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-muted"
          />
          <motion.circle
            cx="80"
            cy="80"
            r="70"
            stroke="url(#gradient)"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            initial={{ strokeDasharray: "0 440" }}
            animate={{ strokeDasharray: `${(matchReadiness / 100) * 440} 440` }}
            transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--primary))" />
              <stop offset="100%" stopColor="hsl(var(--accent))" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-4xl font-bold text-foreground"
          >
            {matchReadiness}%
          </motion.span>
          <span className="text-sm text-muted-foreground">Match Ready</span>
        </div>
      </motion.div>

      {/* Completion Checklist */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-card border border-border rounded-xl p-4 mb-8"
      >
        <div className="space-y-2">
          {completionItems.map((item, idx) => (
            <div key={item.label} className="flex items-center gap-3">
              <CheckCircle
                className={`w-5 h-5 ${
                  item.completed ? "text-green-500" : "text-muted-foreground"
                }`}
              />
              <span
                className={
                  item.completed ? "text-foreground" : "text-muted-foreground"
                }
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Button onClick={onContinue} size="lg" className="w-full h-14 text-lg">
          See Your Matches
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </motion.div>
    </motion.div>
  );
}
