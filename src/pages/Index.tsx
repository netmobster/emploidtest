import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Building2, User, ArrowRight, Sparkles, Target, Heart, LogIn, LogOut } from "lucide-react";
import { UserType } from "@/lib/gameData";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const [hoveredType, setHoveredType] = useState<UserType | null>(null);

  const handleSelect = (type: UserType) => {
    if (!user) {
      navigate(`/auth?type=${type}`);
    } else if (type === "employer" && profile?.has_completed_culture_game) {
      // Employers who have completed culture game go to culture confirmation first
      navigate("/culture-confirmation");
    } else {
      navigate(`/city?type=${type}`);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Auth header */}
      <div className="absolute top-4 right-4 z-10">
        {user ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {profile?.full_name || user.email}
            </span>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        ) : (
          <Button variant="outline" size="sm" onClick={() => navigate("/auth")}>
            <LogIn className="w-4 h-4 mr-2" />
            Sign In
          </Button>
        )}
      </div>

      {/* Hero Section */}
      <div className="relative">
        {/* Background gradient */}
        <div className="absolute inset-0 gradient-hero opacity-5" />
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-accent/5 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              <span className="gradient-text">Emploid</span>
            </h1>
            <p className="text-muted-foreground mt-2">Find your kind of work. Keep your kind of people.</p>
          </motion.div>

          {/* Main headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
              Find your perfect match,{" "}
              <span className="gradient-text">not just a job</span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground">
              Swipe through preferences, discover compatibility, and connect with 
              companies and candidates that truly align with your values.
            </p>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap justify-center gap-6 mb-16"
          >
            {[
              { icon: Target, label: "Skills Match", desc: "Find the right expertise" },
              { icon: Heart, label: "Culture Fit", desc: "Align on values" },
              { icon: Sparkles, label: "Smart Matching", desc: "AI-powered results" },
            ].map((feature) => (
              <div
                key={feature.label}
                className="flex items-center gap-3 bg-card shadow-card rounded-2xl px-5 py-3"
              >
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                  <feature.icon className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{feature.label}</p>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </div>
              </div>
            ))}
          </motion.div>

          {/* User type selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto"
          >
            {/* Employer Card */}
            <motion.button
              onMouseEnter={() => setHoveredType("employer")}
              onMouseLeave={() => setHoveredType(null)}
              onClick={() => handleSelect("employer")}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              className="group relative bg-card rounded-3xl p-8 text-left shadow-card hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-primary/20"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-primary-foreground" />
                </div>
                <ArrowRight className="w-6 h-6 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">I'm Hiring</h3>
              <p className="text-muted-foreground mb-4">
                Find candidates who match your role requirements and company culture.
              </p>
              <div className="flex flex-wrap gap-2">
                {["Define requirements", "Match culture", "Browse candidates"].map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-medium bg-primary/10 text-primary px-3 py-1 rounded-full"
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
              className="group relative bg-card rounded-3xl p-8 text-left shadow-card hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-accent/20"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="w-16 h-16 rounded-2xl gradient-accent flex items-center justify-center">
                  <User className="w-8 h-8 text-accent-foreground" />
                </div>
                <ArrowRight className="w-6 h-6 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">I'm Looking</h3>
              <p className="text-muted-foreground mb-4">
                Discover roles and companies that align with your skills and values.
              </p>
              <div className="flex flex-wrap gap-2">
                {["Share experience", "Define culture", "Find matches"].map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-medium bg-accent/10 text-accent px-3 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.button>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-16"
          >
            <p className="text-sm text-muted-foreground">
              Join thousands finding their perfect professional match
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Index;