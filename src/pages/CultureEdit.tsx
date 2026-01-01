import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { EMPLOYER_CULTURE_QUESTIONS } from "@/lib/gameData";
import { toast } from "sonner";

const CultureEdit = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const returnUrl = searchParams.get("returnUrl") || "/city";
  const roleId = searchParams.get("role");
  const cityId = searchParams.get("city");

  useEffect(() => {
    const loadCulturePreferences = async () => {
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("culture_preferences")
        .eq("user_id", user.id)
        .single();

      if (profile?.culture_preferences) {
        setAnswers(profile.culture_preferences as Record<string, string>);
      }
      setIsLoading(false);
    };

    loadCulturePreferences();
  }, [user]);

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ culture_preferences: answers })
        .eq("user_id", user.id);

      if (error) throw error;

      toast.success("Culture preferences updated!");

      // Navigate back with context
      if (roleId && cityId) {
        navigate(`/game/culture?type=employer&role=${roleId}&city=${cityId}`);
      } else {
        navigate(returnUrl);
      }
    } catch (error) {
      console.error("Error saving culture preferences:", error);
      toast.error("Failed to save preferences");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (roleId && cityId) {
      navigate(`/game/culture?type=employer&role=${roleId}&city=${cityId}`);
    } else {
      navigate(returnUrl);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <h1 className="text-xl font-semibold">Edit Company Culture</h1>
          <div className="w-20" />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground text-center mb-8"
        >
          Update your company culture preferences to better match with candidates.
        </motion.p>

        <div className="space-y-4">
          {EMPLOYER_CULTURE_QUESTIONS.map((question, index) => (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="bg-card rounded-lg p-4 border border-border"
            >
              <label className="block text-sm font-medium text-foreground mb-2">
                {question.question}
              </label>
              <Select
                value={answers[question.id] || ""}
                onValueChange={(value) => handleAnswerChange(question.id, value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  {question.options.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex gap-3 mt-8 sticky bottom-4"
        >
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSaving}
            className="flex-1"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default CultureEdit;
