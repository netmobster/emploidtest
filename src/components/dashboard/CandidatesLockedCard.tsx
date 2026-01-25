import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Lock, Users, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CandidatesLockedCardProps {
  variant?: "section" | "inline";
}

export function CandidatesLockedCard({ variant = "section" }: CandidatesLockedCardProps) {
  const navigate = useNavigate();

  if (variant === "inline") {
    return (
      <Button
        onClick={() => navigate("/employer-onboarding-v2")}
        className="w-full justify-between bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20"
        variant="outline"
      >
        <span className="flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          Complete Culture Profile
        </span>
        <ArrowRight className="w-4 h-4" />
      </Button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl p-6 shadow-card border border-border overflow-hidden"
    >
      <div className="flex items-center gap-2 mb-4">
        <Lock className="w-5 h-5 text-muted-foreground" />
        <h3 className="text-lg font-semibold text-foreground">High-Synergy Candidates</h3>
      </div>

      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-4 bg-secondary rounded-full flex items-center justify-center">
          <Users className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="text-foreground font-medium mb-2">
          Complete your Culture Profile
        </p>
        <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
          Tell us about your company culture to unlock personalized candidate matches.
        </p>
        <Button 
          onClick={() => navigate("/employer-onboarding-v2")}
          className="gap-2"
        >
          Complete Profile
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}
