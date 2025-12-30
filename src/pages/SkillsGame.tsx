import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import SwipeCard from "@/components/SwipeCard";
import { EMPLOYER_SKILLS_QUESTIONS, CANDIDATE_SKILLS_QUESTIONS, UserType } from "@/lib/gameData";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const SkillsGame = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const userType = (searchParams.get("type") as UserType) || "candidate";
  const role = searchParams.get("role") || "";
  const city = searchParams.get("city") || "new-york";
  
  const questions = userType === "employer" ? EMPLOYER_SKILLS_QUESTIONS : CANDIDATE_SKILLS_QUESTIONS;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleAnswer = (questionId: string, answer: string) => {
    const updatedAnswers = { ...answers, [questionId]: answer };
    setAnswers(updatedAnswers);
    
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Move to culture game with skills answers
      navigate(`/game/culture?type=${userType}&role=${role}&city=${city}`, { 
        state: { skillsAnswers: updatedAnswers } 
      });
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="container max-w-lg mx-auto">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
          <Button variant="ghost" onClick={() => navigate(`/roles?type=${userType}&city=${city}`)} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Roles
          </Button>
          <div className="text-center">
            <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
              Game 1 of 2: Skills & Experience
            </span>
            <h1 className="text-2xl font-bold text-foreground mt-4">
              {userType === "employer" ? "What are you looking for?" : "Tell us about yourself"}
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

export default SkillsGame;
