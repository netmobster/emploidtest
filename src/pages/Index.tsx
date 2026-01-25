import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Building2, User, ArrowRight, Loader2, Sparkles, Heart } from "lucide-react";
import { UserType } from "@/lib/gameData";
import { useAuth } from "@/contexts/AuthContext";
import { useSmartRedirect } from "@/hooks/useSmartRedirect";
import Logo from "@/components/Logo";
import ProfileHeader from "@/components/ProfileHeader";
import Footer from "@/components/Footer";
import { PhilosophyModal } from "@/components/onboarding/PhilosophyModal";
import { MirrorViewSection } from "@/components/home/MirrorViewSection";
import { HumanityBar } from "@/components/home/HumanityBar";
import { Button } from "@/components/ui/button";
import WorkLoveLanguageModal from "@/components/WorkLoveLanguageModal";

const Index = () => {
  const navigate = useNavigate();
  const { user, profile, isLoading } = useAuth();
  const { getLoginRedirect } = useSmartRedirect();
  const [hoveredType, setHoveredType] = useState<UserType | null>(null);
  const [isMatchingModalOpen, setIsMatchingModalOpen] = useState(false);

  // Smart redirect for logged-in users
  useEffect(() => {
    if (!isLoading && user && profile) {
      const destination = getLoginRedirect();
      if (destination) {
        navigate(destination, { replace: true });
      }
    }
  }, [isLoading, user, profile, getLoginRedirect, navigate]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // If user is logged in, they'll be redirected - show loading
  if (user && profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleSelect = (type: UserType) => {
    if (!user) {
      navigate(`/auth?type=${type}`);
    } else if (type === "employer" && profile?.has_completed_culture_game) {
      navigate("/culture-confirmation");
    } else {
      navigate(`/city?type=${type}`);
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Philosophy Modal for first-time visitors */}
      <PhilosophyModal />

      {/* Auth header */}
      <div className="absolute top-4 right-4 z-10">
        <ProfileHeader />
      </div>

      {/* Hero Section - tighter spacing */}
      <section className="relative pt-12 md:pt-16 pb-6">
        {/* Background effects */}
        <div className="absolute inset-0 gradient-hero opacity-5" />
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-accent/5 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mb-6"
          >
            <Logo size="xl" linkTo="" />
          </motion.div>

          {/* Main headline - center aligned, bold sans-serif */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground mb-4 leading-tight tracking-tight">
              Work where you belong.{" "}
              <span className="gradient-text">Hire who stays.</span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Hiring has become an industrial volume game where everyone loses—whether you're 
              applying to 1,000 roles or sorting through 1,000 resumes. Emploid kills the noise 
              and replaces it with real human synergy. No bots, no performance—just 1:1 
              connections that actually matter.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mirror View Section - flows directly from hero */}
      <MirrorViewSection />

      {/* Humanity Bar - tighter connection */}
      <HumanityBar />

      {/* User type selection - reduced spacing */}
      <section className="py-6 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto"
          >
            {/* Employer Card */}
            <motion.button
              onMouseEnter={() => setHoveredType("employer")}
              onMouseLeave={() => setHoveredType(null)}
              onClick={() => handleSelect("employer")}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              className="group relative bg-card rounded-2xl p-6 text-left shadow-card hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-primary/20"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-primary-foreground" />
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">I'm Hiring</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Find candidates who match your role requirements and company culture.
              </p>
              <div className="flex flex-wrap gap-1.5">
                {["Define requirements", "Match culture", "Browse candidates"].map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-medium bg-primary/10 text-primary px-2.5 py-0.5 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.button>

            {/* Candidate Card */}
            <motion.button
              onMouseEnter={() => setHoveredType("candidate")}
              onMouseLeave={() => setHoveredType(null)}
              onClick={() => handleSelect("candidate")}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              className="group relative bg-card rounded-2xl p-6 text-left shadow-card hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-accent/20"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl gradient-accent flex items-center justify-center">
                  <User className="w-6 h-6 text-accent-foreground" />
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">I'm Looking</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Discover roles and companies that align with your skills and values.
              </p>
              <div className="flex flex-wrap gap-1.5">
                {["Share experience", "Define culture", "Find matches"].map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-medium bg-accent/10 text-accent px-2.5 py-0.5 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.button>
          </motion.div>

          {/* Join the Network CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex justify-center mt-6"
          >
            <Button 
              size="lg"
              onClick={() => navigate("/auth")}
              className="gradient-primary text-primary-foreground px-8 py-6 text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Join the Network
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>

          {/* Supportive context - de-emphasized matching logic */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex justify-center mt-4"
          >
            <button
              onClick={() => setIsMatchingModalOpen(true)}
              className="text-sm text-muted-foreground/70 hover:text-muted-foreground transition-colors flex items-center gap-1.5 border border-border/50 rounded-full px-4 py-2 hover:border-border"
            >
              <Heart className="w-3.5 h-3.5" />
              See how we match humans to humans
            </button>
          </motion.div>

          {/* Trust indicator */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-4 text-xs text-muted-foreground/60"
          >
            Join thousands finding their perfect professional match
          </motion.p>
        </div>
      </section>

      <Footer />

      {/* Matching Modal */}
      <WorkLoveLanguageModal open={isMatchingModalOpen} onOpenChange={setIsMatchingModalOpen} />
    </div>
  );
};

export default Index;