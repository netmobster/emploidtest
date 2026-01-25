import { useState } from "react";
import { motion } from "framer-motion";
import { Users, ArrowRight, Loader2, X, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface EmployerTeamStepProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function EmployerTeamStep({ onComplete, onSkip }: EmployerTeamStepProps) {
  const { profile, refreshProfile } = useAuth();
  const [teamDescription, setTeamDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          team_environment: teamDescription.trim() || null,
        })
        .eq("user_id", profile?.user_id);

      if (error) throw error;

      await refreshProfile();
      toast.success("Team profile saved!");
      onComplete();
    } catch (error) {
      console.error("Error saving team:", error);
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
          <Users className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Tell us about your team environment
        </h2>
        <p className="text-muted-foreground">
          Help candidates picture themselves working with your team.
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 space-y-6">
        {/* Coming Soon Notice */}
        <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg border border-border">
          <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">Coming Soon</p>
            <p className="text-xs text-muted-foreground">
              High-fidelity environment matching with team photos, office tours, and more.
            </p>
          </div>
        </div>

        {/* Team Description */}
        <div className="space-y-2">
          <Label htmlFor="teamDescription">Team Description</Label>
          <Textarea
            id="teamDescription"
            value={teamDescription}
            onChange={(e) => setTeamDescription(e.target.value)}
            placeholder="Describe your team dynamics, how you collaborate, what a typical day looks like..."
            rows={5}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground">
            Be authentic—candidates appreciate honesty over polish.
          </p>
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
              Complete Setup
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
}