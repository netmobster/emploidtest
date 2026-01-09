import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import SwipeCard from "@/components/SwipeCard";
import { EMPLOYER_SKILLS_QUESTIONS, CANDIDATE_SKILLS_QUESTIONS, UserType } from "@/lib/gameData";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import Logo from "@/components/Logo";
import ProfileHeader from "@/components/ProfileHeader";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const SkillsGame = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const userType = (searchParams.get("type") as UserType) || "candidate";
  const role = searchParams.get("role") || "";
  const city = searchParams.get("city") || "new-york";
  
  const questions = userType === "employer" ? EMPLOYER_SKILLS_QUESTIONS : CANDIDATE_SKILLS_QUESTIONS;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  const saveJobToDatabase = async (skillsAnswers: Record<string, string>) => {
    if (!user || !profile) return;

    try {
      const { error } = await supabase.from("jobs").insert({
        user_id: user.id,
        title: role.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        company: profile.company_name || "Company",
        role_id: role,
        city_id: city,
        skills_preferences: skillsAnswers,
        culture_preferences: profile.culture_preferences || {},
        remote: profile.remote_preference === "remote",
      });

      if (error) throw error;
      toast.success("Job posted successfully!");
    } catch (error) {
      console.error("Error saving job:", error);
      toast.error("Failed to save job posting");
    }
  };

  const handleAnswer = async (questionId: string, answer: string) => {
    if (isProcessing) return; // Prevent rapid clicks
    
    const updatedAnswers = { ...answers, [questionId]: answer };
    setAnswers(updatedAnswers);
    
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsProcessing(true);
      
      // For employers, save job with skills + culture from profile
      if (userType === "employer" && user) {
        await saveJobToDatabase(updatedAnswers);
      }
      
      // Navigate directly to swipe/matching screen
      navigate(userType === "employer" 
        ? `/swipe/employer?role=${role}` 
        : `/swipe/candidate?role=${role}&city=${city}`
      );
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      {/* Profile Header */}
      <div className="absolute top-4 right-4 z-10">
        <ProfileHeader />
      </div>
      
      <div className="container max-w-lg mx-auto">
        <Logo size="sm" className="mx-auto mb-6" />
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
          <Button variant="ghost" onClick={() => navigate(`/roles?type=${userType}&city=${city}`)} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Roles
          </Button>
          <div className="text-center">
            <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
              Match Preferences
            </span>
            <h1 className="text-2xl font-bold text-foreground mt-4">
              {userType === "employer" ? "What are you looking for?" : "Tell us about yourself"}
            </h1>
          </div>
        </motion.div>

        {isProcessing ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Finding your matches...</p>
          </div>
        ) : (
          <SwipeCard
            question={questions[currentIndex]}
            currentIndex={currentIndex}
            totalQuestions={questions.length}
            onAnswer={handleAnswer}
            onBack={handleBack}
            canGoBack={currentIndex > 0}
            disabled={isProcessing}
          />
        )}
      </div>
    </div>
  );
};

export default SkillsGame;
