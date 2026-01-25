import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Loader2, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { calculateSynergyCompatibility, getCompatibilityLabel } from "@/lib/synergyUtils";
import { cn } from "@/lib/utils";

interface HighSynergyCandidate {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  job_title: string | null;
  location: string | null;
  skills: string[] | null;
  synergyScore: number;
}

export function HighSynergyCandidatesSection() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [candidates, setCandidates] = useState<HighSynergyCandidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHighSynergyCandidates = async () => {
      if (!profile?.synergy_scores) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, user_id, full_name, avatar_url, job_title, location, skills, synergy_scores")
          .eq("user_type", "candidate")
          .not("synergy_scores", "is", null)
          .limit(20);

        if (error) throw error;

        const scoredCandidates = (data || [])
          .map(candidate => ({
            ...candidate,
            synergyScore: calculateSynergyCompatibility(
              profile.synergy_scores as Record<string, number>,
              candidate.synergy_scores as Record<string, number>
            ),
          }))
          .filter(c => c.synergyScore >= 70)
          .sort((a, b) => b.synergyScore - a.synergyScore)
          .slice(0, 5);

        setCandidates(scoredCandidates);
      } catch (error) {
        console.error("Error fetching candidates:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHighSynergyCandidates();
  }, [profile]);

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl p-6 shadow-card border border-border"
      >
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl p-4 sm:p-6 shadow-card border border-border overflow-hidden"
    >
      <div className="flex items-center justify-between mb-4 gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="text-base sm:text-lg font-semibold text-foreground">High-Synergy Candidates</h3>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate("/swipe/employer")}
          className="gap-1"
        >
          View All
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      {candidates.length === 0 ? (
        <div className="text-center py-8">
          <Users className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-muted-foreground">No high-synergy candidates found yet.</p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            Complete your culture profile to improve matching.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {candidates.map((candidate, index) => (
            <motion.div
              key={candidate.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => navigate(`/candidate/${candidate.user_id}`)}
              className="flex items-center gap-3 p-3 rounded-lg border border-border bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
            >
              <Avatar className="w-10 h-10 flex-shrink-0">
                <AvatarImage src={candidate.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                  {candidate.full_name?.slice(0, 2).toUpperCase() || "??"}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {candidate.full_name || "Anonymous"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {candidate.job_title || "Professional"}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge className={cn(
                  "text-xs",
                  candidate.synergyScore >= 90 ? "bg-green-500" :
                  candidate.synergyScore >= 80 ? "bg-emerald-500" :
                  "bg-primary"
                )}>
                  {candidate.synergyScore}%
                </Badge>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}