import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, ArrowRight, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface EmployerCultureStepProps {
  onComplete: () => void;
  onSkip: () => void;
}

const WORK_PACE_OPTIONS = [
  { id: "fast", label: "Fast-paced", description: "Move quickly, iterate often" },
  { id: "balanced", label: "Balanced", description: "Steady pace with bursts" },
  { id: "methodical", label: "Methodical", description: "Thoughtful, deliberate" },
];

const VALUE_OPTIONS = [
  "Innovation", "Transparency", "Autonomy", "Collaboration", 
  "Work-Life Balance", "Growth", "Impact", "Diversity",
  "Sustainability", "Excellence", "Agility", "Trust"
];

export function EmployerCultureStep({ onComplete, onSkip }: EmployerCultureStepProps) {
  const { profile, refreshProfile } = useAuth();
  const [mission, setMission] = useState("");
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [workPace, setWorkPace] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const toggleValue = (value: string) => {
    if (selectedValues.includes(value)) {
      setSelectedValues(selectedValues.filter(v => v !== value));
    } else if (selectedValues.length < 5) {
      setSelectedValues([...selectedValues, value]);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const culturePreferences = {
        mission: mission.trim(),
        values: selectedValues,
        workPace,
      };

      const { error } = await supabase
        .from("profiles")
        .update({
          culture_preferences: culturePreferences,
          has_completed_culture_game: true,
        })
        .eq("user_id", profile?.user_id);

      if (error) throw error;

      await refreshProfile();
      toast.success("Culture profile saved!");
      onComplete();
    } catch (error) {
      console.error("Error saving culture:", error);
      toast.error("Failed to save. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-lg mx-auto"
    >
      <div className="flex justify-end mb-4">
        <Button variant="ghost" size="sm" onClick={onSkip} className="text-muted-foreground">
          Skip for Now
          <X className="w-4 h-4 ml-1" />
        </Button>
      </div>

      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
          <Heart className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Define what makes your team unique
        </h2>
        <p className="text-muted-foreground">
          Help candidates understand your company culture before they apply.
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 space-y-6">
        {/* Mission Statement */}
        <div className="space-y-2">
          <Label htmlFor="mission">Company Mission</Label>
          <Textarea
            id="mission"
            value={mission}
            onChange={(e) => setMission(e.target.value)}
            placeholder="What drives your company? What impact are you making?"
            rows={3}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground">
            A clear mission helps attract candidates who share your vision.
          </p>
        </div>

        {/* Core Values */}
        <div className="space-y-3">
          <Label>Core Values (select up to 5)</Label>
          <div className="flex flex-wrap gap-2">
            {VALUE_OPTIONS.map((value) => (
              <Badge
                key={value}
                variant={selectedValues.includes(value) ? "default" : "outline"}
                className={cn(
                  "cursor-pointer transition-all",
                  selectedValues.includes(value) 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-muted"
                )}
                onClick={() => toggleValue(value)}
              >
                {value}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            {selectedValues.length}/5 selected
          </p>
        </div>

        {/* Work Pace */}
        <div className="space-y-3">
          <Label>Work Pace</Label>
          <div className="grid gap-2">
            {WORK_PACE_OPTIONS.map((option) => (
              <div
                key={option.id}
                onClick={() => setWorkPace(option.id)}
                className={cn(
                  "p-3 rounded-lg border cursor-pointer transition-all",
                  workPace === option.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground/50"
                )}
              >
                <div className="font-medium text-foreground">{option.label}</div>
                <div className="text-sm text-muted-foreground">{option.description}</div>
              </div>
            ))}
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full gap-2"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              Continue
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
}