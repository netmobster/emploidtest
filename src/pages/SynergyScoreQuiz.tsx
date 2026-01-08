import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { questions, Category } from '@/data/questions';
import QuestionCard from '@/components/QuestionCard';
import ResultsScreen from '@/components/ResultsScreen';
import { Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function SynergyScoreQuiz() {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scores, setScores] = useState<Record<Category, number>>({
    autonomy: 0,
    impact: 0,
    collaboration: 0,
    security: 0,
    recognition: 0,
  });
  const [isComplete, setIsComplete] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSelect = (option: 'A' | 'B') => {
    const question = questions[currentIndex];
    const category = option === 'A' ? question.optionA.category : question.optionB.category;
    
    setScores(prev => ({
      ...prev,
      [category]: prev[category] + 1,
    }));

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsComplete(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setScores({
      autonomy: 0,
      impact: 0,
      collaboration: 0,
      security: 0,
      recognition: 0,
    });
    setIsComplete(false);
  };

  // Normalize scores to 0-10 scale for storage
  const normalizedScores = useMemo(() => {
    return Object.fromEntries(
      Object.entries(scores).map(([key, value]) => [key, value * 2])
    ) as Record<Category, number>;
  }, [scores]);

  const handleSaveAndContinue = async () => {
    if (!user) {
      toast({
        title: "Not logged in",
        description: "Please log in to save your results.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          synergy_scores: normalizedScores,
          has_completed_synergy_quiz: true,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      await refreshProfile();
      
      toast({
        title: "Results saved!",
        description: "Your Synergy Score has been recorded.",
      });

      // Navigate back to dashboard based on user type
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('user_id', user.id)
        .single();

      if (profile?.user_type === 'employer') {
        navigate('/employer-dashboard');
      } else {
        navigate('/candidate-dashboard');
      }
    } catch (error) {
      console.error('Error saving synergy scores:', error);
      toast({
        title: "Error saving results",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isSaving) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Saving your results...</p>
        </div>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="min-h-screen bg-background">
        <ResultsScreen 
          scores={scores} 
          onRestart={handleRestart}
        />
        <div className="fixed bottom-6 left-0 right-0 flex justify-center px-4">
          <button
            onClick={handleSaveAndContinue}
            className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-medium shadow-lg hover:opacity-90 transition-opacity"
          >
            Save & Continue to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <QuestionCard
        question={questions[currentIndex]}
        currentIndex={currentIndex}
        totalQuestions={questions.length}
        onSelect={handleSelect}
      />
    </div>
  );
}
