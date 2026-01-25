import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Radar, Settings2, User, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { calculateSynergyCompatibility } from "@/lib/synergyUtils";
import { DiscoveryRefineModal } from "./DiscoveryRefineModal";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface DiscoveryCandidate {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  job_title: string | null;
  location: string | null;
  skills: string[] | null;
  synergy_scores: any;
  created_at: string;
  synergyScore: number;
  isNew: boolean;
}

export function DiscoverySectionEmployer() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [candidates, setCandidates] = useState<DiscoveryCandidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refineOpen, setRefineOpen] = useState(false);
  const [threshold, setThreshold] = useState(70);
  const [mustMatchMission, setMustMatchMission] = useState(false);

  useEffect(() => {
    const fetchDiscoveryCandidates = async () => {
      if (!profile?.synergy_scores) {
        setIsLoading(false);
        return;
      }

      try {
        const { data: candidatesData, error } = await supabase
          .from("profiles")
          .select(`
            id, user_id, full_name, avatar_url, job_title, 
            location, skills, synergy_scores, created_at
          `)
          .eq("user_type", "candidate")
          .not("synergy_scores", "is", null)
          .order("created_at", { ascending: false })
          .limit(30);

        if (error) throw error;

        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const enrichedCandidates: DiscoveryCandidate[] = (candidatesData || [])
          .map(candidate => {
            const synergyScore = calculateSynergyCompatibility(
              profile.synergy_scores as Record<string, number>,
              candidate.synergy_scores as Record<string, number>
            );
            const createdDate = new Date(candidate.created_at);
            
            return {
              ...candidate,
              synergyScore,
              isNew: createdDate > oneDayAgo,
            };
          })
          .filter(candidate => {
            // Filter by threshold
            if (candidate.synergyScore < threshold) return false;
            // Prioritize recent (within 7 days) but show all above threshold
            return true;
          })
          .sort((a, b) => {
            // Prioritize new candidates, then by synergy score
            if (a.isNew && !b.isNew) return -1;
            if (!a.isNew && b.isNew) return 1;
            return b.synergyScore - a.synergyScore;
          })
          .slice(0, 10);

        setCandidates(enrichedCandidates);
      } catch (error) {
        console.error("Error fetching discovery candidates:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDiscoveryCandidates();
  }, [profile, threshold]);

  const handleRefine = (newThreshold: number, newMustMatch: boolean) => {
    setThreshold(newThreshold);
    setMustMatchMission(newMustMatch);
    setRefineOpen(false);
  };

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
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl p-4 sm:p-6 shadow-card border border-border overflow-hidden"
      >
        <div className="flex items-center justify-between mb-4 gap-2">
          <div className="flex items-center gap-2">
            <Radar className="w-5 h-5 text-primary" />
            <h3 className="text-base sm:text-lg font-semibold text-foreground">Discovery Scout</h3>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setRefineOpen(true)}
            className="gap-1"
          >
            <Settings2 className="w-4 h-4" />
            Refine
          </Button>
        </div>

        {candidates.length === 0 ? (
          <div className="text-center py-8">
            <Radar className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground">No high-synergy candidates yet.</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              We're always scouting for your perfect hire.
            </p>
          </div>
        ) : (
          <ScrollArea className="w-full">
            <div className="flex gap-4 pb-4">
              {candidates.map((candidate) => (
                <motion.div
                  key={candidate.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => navigate("/swipe/employer")}
                  className={cn(
                    "min-w-[280px] p-4 bg-secondary/30 rounded-xl border border-border cursor-pointer transition-all hover:border-primary/50",
                    candidate.isNew && "ring-2 ring-primary/20"
                  )}
                >
                  {/* Header with Avatar and Badge */}
                  <div className="flex items-start justify-between mb-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={candidate.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {candidate.full_name?.slice(0, 2).toUpperCase() || "??"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex items-center gap-2">
                      <Badge 
                        className={cn(
                          "text-sm font-semibold",
                          candidate.isNew && "synergy-pulse"
                        )}
                      >
                        {candidate.synergyScore}% Match
                      </Badge>
                    </div>
                  </div>

                  {/* Candidate Info */}
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-foreground line-clamp-1">
                      {candidate.full_name || "Anonymous"}
                    </h4>
                    {candidate.isNew && (
                      <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600 border-green-500/30">
                        Day 14
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                    {candidate.job_title || "Professional"}
                  </p>

                  {/* Location */}
                  {candidate.location && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                      <MapPin className="w-3 h-3" />
                      <span>{candidate.location}</span>
                    </div>
                  )}

                  {/* Top Skill (Big Rock) */}
                  {candidate.skills && candidate.skills.length > 0 && (
                    <div className="pt-3 border-t border-border">
                      <p className="text-xs text-muted-foreground mb-1">Top Skill</p>
                      <Badge variant="secondary" className="text-xs">
                        {candidate.skills[0]}
                      </Badge>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        )}
      </motion.div>

      <DiscoveryRefineModal
        open={refineOpen}
        onOpenChange={setRefineOpen}
        threshold={threshold}
        mustMatchMission={mustMatchMission}
        onApply={handleRefine}
      />
    </>
  );
}