import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, 
  ArrowLeft, 
  Users, 
  Target, 
  Sparkles, 
  Briefcase, 
  Shield, 
  Zap,
  User,
  Building2,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ProgressDots from "@/components/ProgressDots";
import Logo from "@/components/Logo";

interface Day14InterstitialProps {
  userType: "candidate" | "employer";
  onComplete: () => void;
  onSkip?: () => void;
  isReturningUser?: boolean;
}

interface CardContent {
  title: string;
  body: string;
  note?: string;
  icon: React.ElementType;
}

// Candidate narrative cards
const CANDIDATE_CARDS: CardContent[] = [
  {
    title: "This is a 'YOU' Profile, not a Job Profile.",
    body: "Employers want to see who you really are. We skip the mystery so Day 1 feels like Day 14.",
    note: "You're briefing the network on your 'Big Rocks' so the right teams find you first.",
    icon: Users,
  },
  {
    title: "Team Discovery",
    body: "You're joining humans, not a job title. Review the team's hobbies and missions before you connect.",
    icon: Target,
  },
  {
    title: "Synergy First",
    body: "We match on personality and interests because the 'First Date Hump' is a waste of time.",
    icon: Sparkles,
  },
];

// Employer narrative cards
const EMPLOYER_CARDS: CardContent[] = [
  {
    title: "Brief Emploid, Not a Recruiter.",
    body: "This is a deliberate, deep-context process. By providing more data up front, you allow the system to protect your time later.",
    icon: Briefcase,
  },
  {
    title: "Team-First Matching",
    body: "We look past the job title to find the humans who fit your specific culture and team mission.",
    icon: Shield,
  },
  {
    title: "Precision vs. Volume",
    body: "We skip the 1000:1000 resume dump. You get a curated 1:1 experience based on real synergy.",
    icon: Zap,
  },
];

// Steps that will follow after the interstitial
const CANDIDATE_STEPS = [
  { label: "Complete your profile", icon: User },
  { label: "Share your work preferences & culture", icon: Sparkles },
  { label: "Get matched with great companies", icon: Building2 },
];

const EMPLOYER_STEPS = [
  { label: "Complete your profile & company details", icon: Building2 },
  { label: "Define your ideal culture fit", icon: Sparkles },
  { label: "Post jobs & discover matching candidates", icon: User },
];

export function Day14Interstitial({ userType, onComplete, onSkip, isReturningUser }: Day14InterstitialProps) {
  const [currentCard, setCurrentCard] = useState(0);
  const cards = userType === "candidate" ? CANDIDATE_CARDS : EMPLOYER_CARDS;
  const steps = userType === "candidate" ? CANDIDATE_STEPS : EMPLOYER_STEPS;
  const isLastCard = currentCard === cards.length - 1;

  const handleNext = () => {
    if (isLastCard) {
      onComplete();
    } else {
      setCurrentCard((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentCard > 0) {
      setCurrentCard((prev) => prev - 1);
    }
  };

  const card = cards[currentCard];
  const Icon = card.icon;

  return (
    <div className="fixed inset-0 z-50 bg-background flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg relative my-8"
      >
        {/* Skip to Dashboard button for returning users */}
        {isReturningUser && onSkip && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            onClick={onSkip}
            className="absolute -top-12 right-0 text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 group"
          >
            Skip to Dashboard
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        )}

        <div className="bg-card rounded-3xl border border-border shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="p-6 pb-4 text-center border-b border-border/50 bg-muted/30">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
              className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center"
            >
              <CheckCircle2 className="w-6 h-6 text-primary" />
            </motion.div>
            {userType === "employer" && (
              <p className="text-xs uppercase tracking-wider text-primary font-semibold mb-2">
                A Heavier Lift for a Higher Standard
              </p>
            )}
            <h2 className="text-xl font-bold text-foreground">
              {userType === "candidate" ? "The 'Day 14' Experience" : "The Strategic Briefing"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              1:1 Connections, Not 1000:1000 Noise
            </p>
          </div>

          {/* Card Content */}
          <div className="p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentCard}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <Icon className="w-8 h-8 text-primary" />
                </div>

                <h3 className="text-2xl font-bold text-foreground mb-4 leading-tight">
                  {card.title}
                </h3>

                <p className="text-muted-foreground leading-relaxed mb-4">
                  {card.body}
                </p>

                {card.note && (
                  <div className="mt-4 p-3 rounded-xl bg-accent/10 border border-accent/20">
                    <p className="text-sm text-accent-foreground">
                      {card.note}
                    </p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* What's Coming Section - show on last card */}
          <AnimatePresence>
            {isLastCard && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="px-8 pb-4"
              >
                <div className="border-t border-border/50 pt-4">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 text-center">
                    What's Coming
                  </h4>
                  <div className="space-y-2">
                    {steps.map((step, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + index * 0.1 }}
                        className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/50 border border-border/50"
                      >
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-[10px] font-bold text-primary">
                            {index + 1}
                          </span>
                        </div>
                        <p className="text-sm text-foreground flex-1">{step.label}</p>
                        <step.icon className="w-4 h-4 text-muted-foreground" />
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer */}
          <div className="px-8 pb-6">
            <ProgressDots total={cards.length} current={currentCard} />

            <div className="flex items-center gap-3">
              {currentCard > 0 && (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="flex-1"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
              <Button
                onClick={handleNext}
                className="flex-1"
              >
                {isLastCard ? "Let's Get Started" : "Next"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            {/* Operator Note */}
            <p className="text-xs text-muted-foreground text-center mt-6 italic">
              "The best connections require the best data. Let's get to work."
            </p>

            {/* Logo */}
            <div className="mt-4 flex justify-center">
              <Logo size="sm" />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
