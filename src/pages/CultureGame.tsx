import { useState } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import SwipeCard from "@/components/SwipeCard";
import { EMPLOYER_CULTURE_QUESTIONS, CANDIDATE_CULTURE_QUESTIONS, UserType, ROLES } from "@/lib/gameData";
import { Button } from "@/components/ui/button";
import { ArrowLeft, PartyPopper, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import CultureSummaryDialog from "@/components/CultureSummaryDialog";

const CultureGame = () => {
  const { user, profile } = useAuth();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const userType = (searchParams.get("type") as UserType) || "candidate";
  const roleId = searchParams.get("role") || "";
  const cityId = searchParams.get("city") || "new-york";
  
  const skillsAnswers = (location.state as { skillsAnswers?: Record<string, string> })?.skillsAnswers || {};
  
  // For employers, we show their saved culture for confirmation instead of playing the game again
  const isEmployerWithCulture = userType === "employer" && profile?.has_completed_culture_game && profile?.culture_preferences;
  
  const questions = userType === "employer" ? EMPLOYER_CULTURE_QUESTIONS : CANDIDATE_CULTURE_QUESTIONS;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isComplete, setIsComplete] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showCultureSummary, setShowCultureSummary] = useState<boolean>(!!isEmployerWithCulture);

  const role = ROLES.find(r => r.id === roleId);

  const saveJobToDatabase = async (cultureAnswers: Record<string, string>) => {
    if (userType !== "employer" || !user) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase.from("jobs").insert({
        title: role?.title || "Open Position",
        company: profile?.company_name || profile?.full_name || "Your Company",
        role_id: roleId,
        city_id: cityId,
        description: `Looking for a ${role?.title || "professional"} to join our team`,
        salary: "Competitive",
        type: "Full-time",
        remote: false,
        skills_preferences: skillsAnswers,
        culture_preferences: cultureAnswers,
        user_id: user.id,
      });

      if (error) {
        console.error("Error saving job:", error);
        toast.error("Failed to save job posting");
      } else {
        toast.success("Job posted successfully!");
      }
    } catch (err) {
      console.error("Error:", err);
      toast.error("Something went wrong");
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmCulture = async () => {
    if (profile?.culture_preferences) {
      await saveJobToDatabase(profile.culture_preferences as Record<string, string>);
      setShowCultureSummary(false);
      setIsComplete(true);
    }
  };

  const handleEditCulture = () => {
    navigate("/employer-onboarding");
  };

  const handleAnswer = async (questionId: string, answer: string) => {
    const updatedAnswers = { ...answers, [questionId]: answer };
    setAnswers(updatedAnswers);
    
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Save job for employers before completing
      if (userType === "employer") {
        await saveJobToDatabase(updatedAnswers);
      }
      setIsComplete(true);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // Show culture summary dialog for employers who already completed the game
  if (isEmployerWithCulture && showCultureSummary) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <CultureSummaryDialog
          open={showCultureSummary}
          onOpenChange={(open) => setShowCultureSummary(open)}
          culturePreferences={profile.culture_preferences as Record<string, string>}
          onConfirm={handleConfirmCulture}
          onEdit={handleEditCulture}
          isLoading={isSaving}
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <h1 className="text-2xl font-bold text-foreground mb-2">Post New Job</h1>
          <p className="text-muted-foreground">
            Review your company culture before posting
          </p>
        </motion.div>
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
          <h1 className="text-3xl font-bold text-foreground mb-4">You're all set!</h1>
          <p className="text-muted-foreground mb-8">
            Your profile is complete. {userType === "employer" 
              ? "Your job has been posted! Browse matching candidates now." 
              : "Explore companies that match your preferences."}
          </p>
          <Button 
            variant="hero" 
            size="xl" 
            onClick={() => navigate(userType === "employer" 
              ? `/employer-results?type=${userType}&role=${roleId}&city=${cityId}` 
              : `/results?type=${userType}&role=${roleId}&city=${cityId}`
            )}
            disabled={isSaving}
          >
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
            View Matches
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="container max-w-lg mx-auto">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <div className="text-center">
            <span className="text-sm font-medium text-accent bg-accent/10 px-3 py-1 rounded-full">
              Game 2 of 2: Culture Fit
            </span>
            <h1 className="text-2xl font-bold text-foreground mt-4">
              {userType === "employer" ? "Describe your company culture" : "What culture fits you?"}
            </h1>
          </div>
        </motion.div>

        <SwipeCard
          question={questions[currentIndex]}
          currentIndex={currentIndex}
          totalQuestions={questions.length}
          onAnswer={handleAnswer}
          onBack={handleBack}
          canGoBack={currentIndex > 0}
        />
      </div>
    </div>
  );
};

export default CultureGame;