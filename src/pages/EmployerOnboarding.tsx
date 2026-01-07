import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import SwipeCard from "@/components/SwipeCard";
import { EMPLOYER_CULTURE_QUESTIONS } from "@/lib/gameData";
import { Button } from "@/components/ui/button";
import { ArrowLeft, PartyPopper, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import ProfileHeader from "@/components/ProfileHeader";

const EmployerOnboarding = () => {
  const { user, profile, isLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const cityId = searchParams.get("city") || "new-york";
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isComplete, setIsComplete] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
      return;
    }
    
    if (!isLoading && profile) {
      // If not an employer, redirect to candidate onboarding
      if (profile.user_type !== 'employer') {
        navigate("/candidate-onboarding");
        return;
      }
      
      // If profile not complete, redirect to profile setup
      if (!profile.has_completed_profile) {
        navigate("/profile-setup");
        return;
      }
      
      // If already completed culture game, go to completion
      if (profile.has_completed_culture_game) {
        navigate("/onboarding-complete");
      }
    }
  }, [user, profile, isLoading, navigate]);

  const saveCulturePreferences = async (cultureAnswers: Record<string, string>) => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          culture_preferences: cultureAnswers,
          has_completed_culture_game: true,
        })
        .eq("user_id", user.id);

      if (error) {
        console.error("Error saving culture preferences:", error);
        toast.error("Failed to save culture preferences");
      } else {
        toast.success("Culture profile saved!");
      }
    } catch (err) {
      console.error("Error:", err);
      toast.error("Something went wrong");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAnswer = async (questionId: string, answer: string) => {
    const updatedAnswers = { ...answers, [questionId]: answer };
    setAnswers(updatedAnswers);
    
    if (currentIndex < EMPLOYER_CULTURE_QUESTIONS.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      await saveCulturePreferences(updatedAnswers);
      setIsComplete(true);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center mx-auto mb-6">
            <PartyPopper className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-4">Culture Profile Complete!</h1>
          <p className="text-muted-foreground mb-8">
            Your company culture has been saved. Now let's find the perfect candidates for your role.
          </p>
          <Button 
            variant="hero" 
            size="xl" 
            onClick={() => navigate("/onboarding-complete")}
            disabled={isSaving}
          >
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
            Continue
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      {/* Profile Header */}
      <div className="absolute top-4 right-4 z-10">
        <ProfileHeader />
      </div>
      
      <div className="container max-w-lg mx-auto">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
          <Button variant="ghost" onClick={() => navigate("/")} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <div className="text-center">
            <span className="text-sm font-medium text-accent bg-accent/10 px-3 py-1 rounded-full">
              Company Culture Setup
            </span>
            <h1 className="text-2xl font-bold text-foreground mt-4">
              Describe your company culture
            </h1>
            <p className="text-muted-foreground mt-2">
              This will help us match you with candidates who share your values
            </p>
          </div>
        </motion.div>

        <SwipeCard
          question={EMPLOYER_CULTURE_QUESTIONS[currentIndex]}
          currentIndex={currentIndex}
          totalQuestions={EMPLOYER_CULTURE_QUESTIONS.length}
          onAnswer={handleAnswer}
          onBack={handleBack}
          canGoBack={currentIndex > 0}
        />
      </div>
    </div>
  );
};

export default EmployerOnboarding;