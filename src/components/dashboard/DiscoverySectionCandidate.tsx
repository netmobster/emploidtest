import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Radar, Settings2, MapPin, Loader2, ExternalLink, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { calculateSynergyCompatibility } from "@/lib/synergyUtils";
import { DiscoveryRefineModal, DiscoveryFilters, DEFAULT_FILTERS } from "./DiscoveryRefineModal";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface DiscoveryJob {
  id: string;
  title: string;
  company: string;
  location_text: string | null;
  work_mode: string | null;
  culture_preferences: any;
  synergy_scores: any;
  created_at: string;
  user_id: string | null;
  requirements: string[] | null;
  synergyScore: number;
  isNew: boolean;
}

export function DiscoverySectionCandidate() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [jobs, setJobs] = useState<DiscoveryJob[]>([]);
  const [allJobs, setAllJobs] = useState<DiscoveryJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refineOpen, setRefineOpen] = useState(false);
  const [filters, setFilters] = useState<DiscoveryFilters>(DEFAULT_FILTERS);

  // Extract popular skills from all jobs' requirements
  const suggestedSkills = useMemo(() => {
    const skillCounts = new Map<string, number>();
    allJobs.forEach(job => {
      job.requirements?.forEach(req => {
        const normalized = req.trim();
        if (normalized) {
          skillCounts.set(normalized, (skillCounts.get(normalized) || 0) + 1);
        }
      });
    });
    return Array.from(skillCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 30)
      .map(([skill]) => skill);
  }, [allJobs]);

  useEffect(() => {
    const fetchDiscoveryJobs = async () => {
      if (!profile?.synergy_scores) {
        setIsLoading(false);
        return;
      }

      try {
        const { data: jobsData, error } = await supabase
          .from("jobs")
          .select(`
            id, title, company, location_text, work_mode, 
            culture_preferences, created_at, user_id, status, requirements
          `)
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(50);

        if (error) throw error;

        const employerIds = [...new Set(jobsData?.map(j => j.user_id).filter(Boolean))];
        const { data: employerProfiles } = await supabase
          .from("profiles")
          .select("user_id, synergy_scores, culture_preferences")
          .in("user_id", employerIds);

        const employerMap = new Map(employerProfiles?.map(p => [p.user_id, p]));

        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        const enrichedJobs: DiscoveryJob[] = (jobsData || []).map(job => {
          const employer = employerMap.get(job.user_id);
          const synergyScore = calculateSynergyCompatibility(
            profile.synergy_scores as Record<string, number>,
            employer?.synergy_scores as Record<string, number>
          );
          const createdDate = new Date(job.created_at);
          
          return {
            ...job,
            synergy_scores: employer?.synergy_scores,
            synergyScore,
            isNew: createdDate > oneDayAgo,
          };
        });

        setAllJobs(enrichedJobs);
      } catch (error) {
        console.error("Error fetching discovery jobs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDiscoveryJobs();
  }, [profile]);

  // Filter and sort jobs based on current filters
  useEffect(() => {
    const filtered = allJobs
      .filter(job => {
        if (job.synergyScore < filters.threshold) return false;
        
        if (filters.location.trim()) {
          const locationMatch = job.location_text?.toLowerCase().includes(filters.location.toLowerCase());
          if (!locationMatch) return false;
        }
        
        if (filters.workModes.length > 0) {
          const jobWorkMode = job.work_mode?.toLowerCase() || "remote";
          if (!filters.workModes.includes(jobWorkMode)) return false;
        }
        
        if (filters.skills.length > 0) {
          const jobRequirements = job.requirements?.map(r => r.toLowerCase()) || [];
          const hasMatchingSkill = filters.skills.some(skill =>
            jobRequirements.some(req => req.includes(skill.toLowerCase()))
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

    setJobs(filtered);
  }, [allJobs, filters]);

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

        {jobs.length === 0 ? (
          <div className="text-center py-8">
            <Radar className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground">No high-synergy matches yet.</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              {activeFilterCount > 0 
                ? "Try adjusting your filters to see more results."
                : "We're always scouting for your perfect role."}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            {jobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "p-4 bg-secondary/30 rounded-xl border border-border transition-all hover:border-primary/50 cursor-pointer",
                  job.isNew && "ring-2 ring-primary/20"
                )}
                onClick={() => {
                  if (job.user_id) {
                    navigate(`/company/${job.user_id}`);
                  }
                }}
              >
                {/* Synergy Badge */}
                <div className="flex items-center justify-between mb-3">
                  <Badge 
                    className={cn(
                      "text-sm font-semibold",
                      job.isNew && "synergy-pulse"
                    )}
                  >
                    {job.synergyScore}% Match
                  </Badge>
                  {job.isNew && (
                    <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/30">
                      New
                    </Badge>
                  )}
                </div>

                {/* Job Info */}
                <h4 className="font-semibold text-foreground mb-1 line-clamp-1">
                  {job.title}
                </h4>
                <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                  {job.company}
                </p>

                {/* Location & Work Mode */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                  <MapPin className="w-3 h-3" />
                  <span>{job.location_text || "Remote"}</span>
                  {job.work_mode && (
                    <Badge variant="outline" className="text-xs capitalize">
                      {job.work_mode}
                    </Badge>
                  )}
                </div>

                {/* Team Vibe */}
                {job.culture_preferences?.workPace && (
                  <p className="text-xs text-muted-foreground mb-3 pb-3 border-b border-border">
                    <span className="font-medium">Vibe:</span> {job.culture_preferences.workPace}
                  </p>
                )}

                {/* View Profile Button */}
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full gap-1.5"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (job.user_id) {
                      navigate(`/company/${job.user_id}`);
                    }
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
        userType="candidate"
        suggestedSkills={suggestedSkills}
      />
    </>
  );
}
