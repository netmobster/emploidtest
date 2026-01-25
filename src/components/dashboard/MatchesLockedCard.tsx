import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, Sparkles, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface MatchesLockedCardProps {
  onStartQuiz?: () => void;
}

export function MatchesLockedCard({ onStartQuiz }: MatchesLockedCardProps) {
  const navigate = useNavigate();

  const handleUnlock = () => {
    if (onStartQuiz) {
      onStartQuiz();
    } else {
      // Navigate to synergy quiz
      navigate("/synergy-score-quiz");
    }
  };

  return (
    <Card className="mb-6 border-dashed border-2 border-muted-foreground/30 bg-muted/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-muted-foreground">
          <Lock className="w-5 h-5" />
          Matches for You
        </CardTitle>
      </CardHeader>
      <CardContent>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-6"
        >
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Complete your Synergy profile
          </h3>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
            Answer a few quick questions to unlock personalized job matches based on your work style and values.
          </p>
          <Button onClick={handleUnlock} className="gap-2">
            <Sparkles className="w-4 h-4" />
            Complete Quiz to Unlock
            <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>
      </CardContent>
    </Card>
  );
}
