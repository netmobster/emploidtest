import { useState } from "react";
import { HelpCircle, Mail, MapPin, X, BookOpen, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { useAuth } from "@/contexts/AuthContext";
import { FAQSheet } from "./FAQSheet";
import { FeedbackWidget } from "./FeedbackWidget";

export function HelpFAB() {
  const [isOpen, setIsOpen] = useState(false);
  const [isFAQOpen, setIsFAQOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const { resetDashboardTour } = useOnboarding();
  const { profile } = useAuth();

  const handleContactSupport = () => {
    window.location.href = "mailto:wearecleardigital@gmail.com?subject=Emploid Support Request";
    setIsOpen(false);
  };

  const handleStartTour = () => {
    resetDashboardTour();
    setIsOpen(false);
  };

  const handleOpenFAQ = () => {
    setIsFAQOpen(true);
    setIsOpen(false);
  };

  const handleOpenFeedback = () => {
    setIsFeedbackOpen(true);
    setIsOpen(false);
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 hidden md:block">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-16 right-0 w-56 bg-card border border-border rounded-xl shadow-lg overflow-hidden"
            >
              <div className="p-3 border-b border-border bg-muted/30">
                <p className="text-sm font-medium text-foreground">Need Help?</p>
                <p className="text-xs text-muted-foreground">We're here to assist you</p>
              </div>
              <div className="p-2 space-y-1">
                {/* Knowledge Base */}
                <button
                  onClick={handleOpenFAQ}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-muted/50 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <BookOpen className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Knowledge Base</p>
                    <p className="text-xs text-muted-foreground">Browse FAQs</p>
                  </div>
                </button>

                {/* Submit Feedback */}
                <button
                  onClick={handleOpenFeedback}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-muted/50 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                    <MessageSquare className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Submit Feedback</p>
                    <p className="text-xs text-muted-foreground">Bugs & requests</p>
                  </div>
                </button>

                {/* Contact Support */}
                <button
                  onClick={handleContactSupport}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-muted/50 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center group-hover:bg-muted/80 transition-colors">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Contact Support</p>
                    <p className="text-xs text-muted-foreground">Email us directly</p>
                  </div>
                </button>
                
                {/* Start Tour - only for authenticated users */}
                {profile && (
                  <button
                    onClick={handleStartTour}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-muted/50 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center group-hover:bg-muted/80 transition-colors">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Restart Tour</p>
                      <p className="text-xs text-muted-foreground">Learn the dashboard</p>
                    </div>
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Button
          onClick={() => setIsOpen(!isOpen)}
          size="icon"
          variant={isOpen ? "default" : "outline"}
          className="w-12 h-12 rounded-full shadow-lg hover:shadow-xl transition-all"
        >
          {isOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <HelpCircle className="w-5 h-5" />
          )}
        </Button>
      </div>

      {/* FAQ Sheet */}
      <FAQSheet open={isFAQOpen} onOpenChange={setIsFAQOpen} />

      {/* Feedback Widget */}
      <FeedbackWidget open={isFeedbackOpen} onOpenChange={setIsFeedbackOpen} />
    </>
  );
}
