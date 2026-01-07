import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, ArrowLeft, CheckCircle } from "lucide-react";
import Logo from "@/components/Logo";
import SwipeCard from "@/components/SwipeCard";
import ProfileHeader from "@/components/ProfileHeader";
import { GameQuestion } from "@/lib/gameData";

// Candidate culture questions
const CANDIDATE_CULTURE_QUESTIONS: GameQuestion[] = [
  {
    id: "environment",
    question: "What work environment helps you thrive?",
    type: "single",
    options: ["Structured & Predictable", "Dynamic & Fast-paced", "Creative & Flexible", "Mission-Driven"],
    category: "culture"
  },
  {
    id: "collaboration",
    question: "How do you prefer to collaborate?",
    type: "single",
    options: ["Independent Work", "Small Team Collaboration", "Large Team Projects", "Mix of Both"],
    category: "culture"
  },
  {
    id: "motivation",
    question: "What motivates you most?",
    type: "single",
    options: ["Stability & Security", "Growth & Challenge", "Impact & Purpose", "Recognition & Rewards"],
    category: "culture"
  },
  {
    id: "feedback",
    question: "How do you approach feedback?",
    type: "single",
    options: ["Prefer Written Feedback", "Prefer Direct Conversations", "Regular Check-ins", "As Needed"],
    category: "culture"
  },
  {
    id: "balance",
    question: "What's your ideal work-life balance?",
    type: "single",
    options: ["Clear Boundaries", "Flexible Integration", "Results-Focused", "Structured Hours"],
    category: "culture"
  },
  {
    id: "decisions",
    question: "How do you prefer decisions to be made?",
    type: "single",
    options: ["Consensus-Driven", "Quick & Decisive", "Data-Informed", "Leader-Guided"],
    category: "culture"
  }
];

const CandidateOnboarding = () => {
  const navigate = useNavigate();
  const { user, profile, isLoading, refreshProfile } = useAuth();
  
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
      // If not a candidate, redirect to employer onboarding
      if (profile.user_type !== 'candidate') {
        navigate("/employer-onboarding");
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

  const saveCulturePreferences = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          culture_preferences: answers,
          has_completed_culture_game: true,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) throw error;

      await refreshProfile();
      setIsComplete(true);
      toast.success("Culture preferences saved!");
    } catch (error: any) {
      toast.error(error.message || "Failed to save preferences");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));

    if (currentIndex < CANDIDATE_CULTURE_QUESTIONS.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      saveCulturePreferences();
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
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
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-10 h-10 text-primary" />
          </motion.div>
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Culture Profile Complete!
          </h1>
          <p className="text-muted-foreground mb-8 max-w-md">
            Great job! Your preferences have been saved. Now let's show you how to find your perfect match.
          </p>
          <Button onClick={() => navigate("/onboarding-complete")} size="lg">
            Continue
          </Button>
        </motion.div>
      </div>
    );
  }

  const currentQuestion = CANDIDATE_CULTURE_QUESTIONS[currentIndex];

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-lg mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            disabled={currentIndex === 0}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Logo size="sm" />
          <ProfileHeader className="ml-auto" />
        </div>

        <div className="text-center mb-6">
          <span className="text-sm font-medium text-accent bg-accent/10 px-3 py-1 rounded-full">
            Culture Profile Setup
          </span>
          <h1 className="text-2xl font-bold text-foreground mt-4">
            Tell us about your preferences
          </h1>
          <p className="text-muted-foreground mt-2">
            This will help us match you with companies that share your values
          </p>
        </div>

        {isSaving ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <SwipeCard
            question={currentQuestion}
            currentIndex={currentIndex}
            totalQuestions={CANDIDATE_CULTURE_QUESTIONS.length}
            onAnswer={handleAnswer}
            onBack={handleBack}
            canGoBack={currentIndex > 0}
          />
        )}
      </div>
    </div>
  );
};

export default CandidateOnboarding;
