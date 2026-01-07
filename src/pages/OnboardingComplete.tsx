import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Sparkles, PartyPopper, Rocket } from "lucide-react";
import Logo from "@/components/Logo";
import HowItWorks from "@/components/HowItWorks";
import FAQSection from "@/components/FAQSection";

const OnboardingComplete = () => {
  const navigate = useNavigate();
  const { user, profile, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
      return;
    }
  }, [user, isLoading, navigate]);

  const handleStartSearch = () => {
    if (profile?.user_type === 'employer') {
      navigate("/city?type=employer");
    } else {
      navigate("/city?type=candidate");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const isEmployer = profile?.user_type === 'employer';

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="container max-w-2xl mx-auto text-center relative"
        >
          <Logo size="md" className="mx-auto mb-6" />
          
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="flex justify-center gap-4 mb-6"
          >
            <motion.div
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ repeat: Infinity, duration: 2, delay: 0 }}
            >
              <PartyPopper className="w-10 h-10 text-primary" />
            </motion.div>
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, delay: 0.3 }}
            >
              <Sparkles className="w-12 h-12 text-yellow-500" />
            </motion.div>
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
            >
              <PartyPopper className="w-10 h-10 text-primary" />
            </motion.div>
          </motion.div>

          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Congratulations! 🎉
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8">
            Your profile is all set up and ready to go.
            {isEmployer 
              ? " Let's find the perfect candidates for your team!"
              : " Let's find your dream job!"}
          </p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button
              onClick={handleStartSearch}
              size="lg"
              className="text-lg px-8 py-6"
            >
              <Rocket className="w-5 h-5 mr-2" />
              {isEmployer ? "Start Hiring" : "Start Your Search"}
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 px-4 bg-muted/30">
        <div className="container max-w-4xl mx-auto">
          <HowItWorks />
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4">
        <div className="container max-w-2xl mx-auto">
          <FAQSection />
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-12 px-4 bg-primary/5">
        <div className="container max-w-lg mx-auto text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Ready to get started?
          </h2>
          <p className="text-muted-foreground mb-6">
            Your perfect {isEmployer ? "candidate" : "job"} is just a swipe away.
          </p>
          <Button onClick={handleStartSearch} size="lg">
            {isEmployer ? "Find Candidates" : "Find Jobs"}
          </Button>
        </div>
      </section>
    </div>
  );
};

export default OnboardingComplete;
