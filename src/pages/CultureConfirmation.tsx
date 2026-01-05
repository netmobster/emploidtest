import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Edit2, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { EMPLOYER_CULTURE_QUESTIONS } from "@/lib/gameData";
import ProfileHeader from "@/components/ProfileHeader";

const CULTURE_CONFIRMED_KEY = "culture_confirmed_session";

const CultureConfirmation = () => {
  const navigate = useNavigate();
  const { user, profile, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      // Redirect if not authenticated
      if (!user) {
        navigate("/auth?type=employer");
        return;
      }

      // Redirect if not an employer
      if (profile && profile.user_type !== "employer") {
        navigate("/city?type=candidate");
        return;
      }

      // Redirect to onboarding if culture game not completed
      if (profile && !profile.has_completed_culture_game) {
        navigate("/employer-onboarding");
        return;
      }

      // Skip confirmation if already confirmed this session
      if (sessionStorage.getItem(CULTURE_CONFIRMED_KEY) === "true") {
        navigate("/city?type=employer");
        return;
      }
    }
  }, [user, profile, isLoading, navigate]);

  const handleContinue = () => {
    sessionStorage.setItem(CULTURE_CONFIRMED_KEY, "true");
    navigate("/city?type=employer");
  };

  const handleEdit = () => {
    navigate("/culture-edit?returnUrl=/culture-confirmation");
  };

  // Show loading state
  if (isLoading || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your profile...</p>
        </motion.div>
      </div>
    );
  }

  // Get culture preferences
  const culturePreferences = profile.culture_preferences as Record<string, string> | null;

  // Format culture summary items
  const getCultureSummaryItems = () => {
    if (!culturePreferences) return [];

    return EMPLOYER_CULTURE_QUESTIONS.map((question) => {
      const answer = culturePreferences[question.id];
      if (!answer) return null;

      return {
        question: question.question,
        answer: answer,
      };
    }).filter(Boolean);
  };

  const summaryItems = getCultureSummaryItems();

  return (
    <div className="min-h-screen bg-background">
      {/* Profile Header */}
      <div className="absolute top-4 right-4 z-10">
        <ProfileHeader />
      </div>
      
      <div className="container max-w-2xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Your Company Culture
          </h1>
          <p className="text-muted-foreground">
            Review your culture preferences before posting a job
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-xl border border-border p-6 mb-6"
        >
          {summaryItems.length > 0 ? (
            <div className="space-y-4">
              {summaryItems.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.03 }}
                  className="flex justify-between items-start py-3 border-b border-border last:border-0"
                >
                  <span className="text-sm text-muted-foreground">
                    {item?.question}
                  </span>
                  <span className="text-sm font-medium text-foreground ml-4 text-right">
                    {item?.answer}
                  </span>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No culture preferences set yet.
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <Button
            variant="outline"
            onClick={handleEdit}
            className="flex-1"
          >
            <Edit2 className="w-4 h-4 mr-2" />
            Edit Culture
          </Button>
          <Button
            onClick={handleContinue}
            className="flex-1"
          >
            Continue to City Selection
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default CultureConfirmation;
