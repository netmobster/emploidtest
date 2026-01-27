import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Radar, Settings2, MapPin, Loader2, ExternalLink, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { calculateSynergyCompatibility } from "@/lib/synergyUtils";
import { DiscoveryRefineModal, DiscoveryFilters, DEFAULT_FILTERS } from "./DiscoveryRefineModal";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface DiscoveryCandidate {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  job_title: string | null;
  location: string | null;
  work_mode: string | null;
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
  const [allCandidates, setAllCandidates] = useState<DiscoveryCandidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refineOpen, setRefineOpen] = useState(false);
  const [filters, setFilters] = useState<DiscoveryFilters>(DEFAULT_FILTERS);

  // Extract popular skills from all candidates
  const suggestedSkills = useMemo(() => {
    const skillCounts = new Map<string, number>();
    allCandidates.forEach(candidate => {
      candidate.skills?.forEach(skill => {
        const normalized = skill.trim();
        if (normalized) {
          skillCounts.set(normalized, (skillCounts.get(normalized) || 0) + 1);
        }
      });
    });
    return Array.from(skillCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 30)
      .map(([skill]) => skill);
  }, [allCandidates]);

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
            location, work_mode, skills, synergy_scores, created_at
          `)
          .eq("user_type", "candidate")
          .not("synergy_scores", "is", null)
          .order("created_at", { ascending: false })
          .limit(50);

        if (error) throw error;

        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        const enrichedCandidates: DiscoveryCandidate[] = (candidatesData || []).map(candidate => {
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
        });

        setAllCandidates(enrichedCandidates);
      } catch (error) {
        console.error("Error fetching discovery candidates:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDiscoveryCandidates();
  }, [profile]);

  // Filter and sort candidates based on current filters
  useEffect(() => {
    const filtered = allCandidates
      .filter(candidate => {
        if (candidate.synergyScore < filters.threshold) return false;
        
        if (filters.location.trim()) {
          const locationMatch = candidate.location?.toLowerCase().includes(filters.location.toLowerCase());
          if (!locationMatch) return false;
        }
        
        if (filters.workModes.length > 0) {
          const candidateWorkMode = candidate.work_mode?.toLowerCase() || "remote";
          if (!filters.workModes.includes(candidateWorkMode)) return false;
        }
        
        if (filters.skills.length > 0) {
          const candidateSkills = candidate.skills?.map(s => s.toLowerCase()) || [];
          const hasMatchingSkill = filters.skills.some(skill =>
            candidateSkills.some(cs => cs.includes(skill.toLowerCase()))
          );
          if (!hasMatchingSkill) return false;
        }
        
        return true;
      })
      .sort((a, b) => {
        if (a.isNew && !b.isNew) return -1;
        if (!a.isNew && b.isNew) return 1;
        return b.synergyScore - a.synergyScore;
      })
      .slice(0, 3);

    setCandidates(filtered);
  }, [allCandidates, filters]);

  const handleApplyFilters = (newFilters: DiscoveryFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const activeFilterCount = [
    filters.location.trim() ? 1 : 0,
    filters.workModes.length > 0 ? 1 : 0,
    filters.skills.length > 0 ? 1 : 0,
    filters.threshold !== 70 ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

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
            <Badge variant="secondary" className="text-xs">Top 3</Badge>
          </div>
          <div className="flex items-center gap-1">
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="gap-1 text-muted-foreground hover:text-foreground h-8 px-2"
              >
                <X className="w-3 h-3" />
                Clear
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setRefineOpen(true)}
              className="gap-1"
            >
              <Settings2 className="w-4 h-4" />
              Refine
              {activeFilterCount > 0 && (
                <Badge variant="default" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {candidates.length === 0 ? (
          <div className="text-center py-8">
            <Radar className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground">No high-synergy candidates yet.</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              {activeFilterCount > 0 
                ? "Try adjusting your filters to see more results."
                : "We're always scouting for your perfect hire."}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            {candidates.map((candidate, index) => (
              <motion.div
                key={candidate.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "p-4 bg-secondary/30 rounded-xl border border-border transition-all hover:border-primary/50 cursor-pointer",
                  candidate.isNew && "ring-2 ring-primary/20"
                )}
                onClick={() => navigate(`/candidate/${candidate.user_id}`)}
              >
                {/* Header with Avatar */}
                <div className="flex items-start justify-between mb-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={candidate.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {candidate.full_name?.slice(0, 2).toUpperCase() || "??"}
                    </AvatarFallback>
                  </Avatar>
                  <Badge 
                    className={cn(
                      "text-sm font-semibold",
                      candidate.isNew && "synergy-pulse"
                    )}
                  >
                    {candidate.synergyScore}% Match
                  </Badge>
                </div>

                {/* Candidate Info */}
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-foreground line-clamp-1">
                    {candidate.full_name || "Anonymous"}
                  </h4>
                  {candidate.isNew && (
                    <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/30">
                      Day 14
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                  {candidate.job_title || "Professional"}
                </p>

                {/* Location & Work Mode */}
                {(candidate.location || candidate.work_mode) && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                    <MapPin className="w-3 h-3" />
                    <span>{candidate.location || "Remote"}</span>
                    {candidate.work_mode && (
                      <Badge variant="outline" className="text-xs capitalize">
                        {candidate.work_mode}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Top Skill */}
                {candidate.skills && candidate.skills.length > 0 && (
                  <div className="mb-3 pb-3 border-b border-border">
                    <p className="text-xs text-muted-foreground mb-1">Top Skill</p>
                    <Badge variant="secondary" className="text-xs">
                      {candidate.skills[0]}
                    </Badge>
                  </div>
                )}

                {/* View Profile Button */}
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full gap-1.5"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/candidate/${candidate.user_id}`);
                  }}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View Profile
                </Button>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      <DiscoveryRefineModal
        open={refineOpen}
        onOpenChange={setRefineOpen}
        filters={filters}
        onApply={handleApplyFilters}
        userType="employer"
        suggestedSkills={suggestedSkills}
      />
    </>
  );
}
