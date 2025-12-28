import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import SwipeCard from "@/components/SwipeCard";
import { EMPLOYER_CULTURE_QUESTIONS, CANDIDATE_CULTURE_QUESTIONS, UserType } from "@/lib/gameData";
import { Button } from "@/components/ui/button";
import { ArrowLeft, PartyPopper } from "lucide-react";

const CultureGame = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const userType = (searchParams.get("type") as UserType) || "candidate";
  const role = searchParams.get("role") || "";
  
  const questions = userType === "employer" ? EMPLOYER_CULTURE_QUESTIONS : CANDIDATE_CULTURE_QUESTIONS;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isComplete, setIsComplete] = useState(false);

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
    
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsComplete(true);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

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
              ? "Browse matching candidates now." 
              : "Explore companies that match your preferences."}
          </p>
          <Button variant="hero" size="xl" onClick={() => navigate(`/results?type=${userType}&role=${role}`)}>
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
