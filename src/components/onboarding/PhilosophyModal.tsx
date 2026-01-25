import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Sparkles, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFeatureToggle } from "@/contexts/FeatureToggleContext";
import { useAuth } from "@/contexts/AuthContext";

const PHILOSOPHY_CARDS = [
  {
    icon: Sparkles,
    title: "The Why",
    subtitle: "Resumes are Dead",
    description:
      "We match based on 'Big Rocks' and 'Daily Stacks'—real impact, not just history. Your next role isn't about where you've been, it's about where you're going.",
    gradient: "from-primary to-primary/60",
  },
  {
    icon: Shield,
    title: "The Trust",
    subtitle: "No Social Noise",
    description:
      "Every employer is domain-verified; every candidate is identity-bound. High-compute only. We filter the noise so you can focus on signal.",
    gradient: "from-blue-500 to-blue-500/60",
  },
  {
    icon: Zap,
    title: "The Handshake",
    subtitle: "Data-First Networking",
    description:
      "Our Synergy Score gates the chat so you only talk when the match is mathematically sound. Quality over quantity, always.",
    gradient: "from-success to-success/60",
  },
];

export function PhilosophyModal() {
  const { testMode } = useFeatureToggle();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [currentCard, setCurrentCard] = useState(0);

  useEffect(() => {
    // Only show for unauthenticated users who haven't seen philosophy
    // AND when PUBLIC MODE is OFF (testMode.enabled = false means real verification mode)
    const hasSeenPhilosophy = localStorage.getItem("has_seen_philosophy");
    
    if (!user && !hasSeenPhilosophy && !testMode.enabled) {
      // Small delay for better UX
      const timer = setTimeout(() => setIsOpen(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [user, testMode.enabled]);

  const handleNext = () => {
    if (currentCard < PHILOSOPHY_CARDS.length - 1) {
      setCurrentCard(currentCard + 1);
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    localStorage.setItem("has_seen_philosophy", "true");
    setIsOpen(false);
  };

  if (!isOpen) return null;

  const card = PHILOSOPHY_CARDS[currentCard];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-10 text-muted-foreground hover:text-foreground"
            onClick={handleClose}
          >
            <X className="w-5 h-5" />
          </Button>

          {/* Progress Dots */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-2">
            {PHILOSOPHY_CARDS.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentCard(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentCard
                    ? "bg-primary w-6"
                    : index < currentCard
                    ? "bg-primary/50"
                    : "bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>

          {/* Card Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentCard}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="p-8 pt-16"
            >
              {/* Icon */}
              <div
                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center mb-6 mx-auto`}
              >
                <card.icon className="w-8 h-8 text-white" />
              </div>

              {/* Content */}
              <div className="text-center space-y-4">
                <div>
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                    {card.title}
                  </span>
                  <h2 className="text-2xl font-bold text-foreground mt-1">
                    {card.subtitle}
                  </h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {card.description}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Footer */}
          <div className="p-6 pt-0 flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-muted-foreground"
            >
              Skip
            </Button>
            <Button
              onClick={handleNext}
              className="gap-2"
            >
              {currentCard === PHILOSOPHY_CARDS.length - 1 ? (
                "Enter the Network"
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
