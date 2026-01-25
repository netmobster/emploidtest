import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, MessageCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import SwipeStack from "@/components/swipe/SwipeStack";
import MatchCelebration from "@/components/match/MatchCelebration";
import { useSwipe } from "@/hooks/useSwipe";
import { useBatchMatchStatus } from "@/hooks/useBatchMatchStatus";
import { ROLES, SAMPLE_JOBS, CITIES, TEST_EMPLOYER_ID, TEST_CANDIDATE_ID } from "@/lib/gameData";
import { calculateMatchScore, MatchScoreBreakdown } from "@/lib/matchScoreUtils";
import { isJobLocationMatch } from "@/lib/locationMatchingUtils";
import { toast } from "sonner";
import { AdminMatchButton } from "@/components/testing/AdminMatchButton";

interface JobWithScore {
  id: string;
  title: string;
  company: string;
  description: string;
  location: string;
  salary: string;
  remote: boolean;
  benefits?: string[];
  requirements?: string[];
  matchScore: number;
  matchBreakdown?: MatchScoreBreakdown;
  cultureCompatibility?: number;
  employerId?: string;
  hiringManagerName?: string;
  hiringManagerAvatar?: string;
  hasTimezoneSynergy?: boolean;
  work_mode?: string;
  location_text?: string;
  geographic_restriction?: string;
  // Role definition fields
  missionStatement?: string;
  bigRocks?: { title: string; description?: string }[];
  dailyStack?: string[];
  vibeMode?: string;
}

const CandidateSwipe = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const role = searchParams.get("role");
  const city = searchParams.get("city");

  const [jobs, setJobs] = useState<JobWithScore[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showMatch, setShowMatch] = useState(false);
  const [matchedJob, setMatchedJob] = useState<JobWithScore | null>(null);
  const [matchId, setMatchId] = useState<string | null>(null);

  const { recordSwipe, latestMatch, clearLatestMatch } = useSwipe();

  const roleInfo = ROLES.find((r) => r.id === role);

  // Get employer IDs for batch match status checking
  const employerIds = useMemo(
    () => jobs.map((j) => j.employerId).filter((id): id is string => !!id && id !== "sample"),
    [jobs]
  );
  const { isMatched: checkIsMatched } = useBatchMatchStatus(employerIds);

  // Fetch jobs with real match score calculations
  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);

      try {
        // Get already swiped jobs to exclude
        let swipedIds: string[] = [];
        if (user) {
          const { data: swipes } = await supabase
            .from("swipes")
            .select("swiped_id")
            .eq("swiper_id", user.id);
          swipedIds = swipes?.map((s) => s.swiped_id) || [];
        }

        // Get candidate's profile data for match calculation
        const candidateProfile = profile
          ? {
              skills: profile.skills as string[] | null,
              culture_preferences: (profile.culture_preferences as unknown) as Record<string, number> | null,
              synergy_scores: (profile.synergy_scores as unknown) as Record<string, number> | null,
            }
          : null;

        // Fetch real jobs from database with employer profiles and role definition fields
        let query = supabase.from("jobs").select(`
          *,
          hiring_manager:hiring_team_members(id, name, avatar_url)
        `);
        if (role) query = query.eq("role_id", role);
        if (city) query = query.eq("city_id", city);

        const { data: dbJobs } = await query;

        // Get candidate location data for filtering
        const candidateLocationData = profile ? {
          work_mode: (profile as any).work_mode,
          city_hub: (profile as any).city_hub,
        } : null;

        // Fetch employer profiles for synergy comparison
        const employerUserIds = [...new Set((dbJobs || []).map((j) => j.user_id).filter(Boolean))];
        let employerProfiles: Record<string, any> = {};

        if (employerUserIds.length > 0) {
          const { data: profiles } = await supabase
            .from("profiles")
            .select("user_id, culture_preferences, synergy_scores")
            .in("user_id", employerUserIds);

          profiles?.forEach((p) => {
            employerProfiles[p.user_id] = p;
          });
        }

        // Combine with sample jobs
        const sampleJobs = SAMPLE_JOBS.filter(
          (j) => !role || j.roleId === role
        );

        const allJobs: JobWithScore[] = [
          ...(dbJobs || []).map((job) => {
            const employerProfile = job.user_id ? employerProfiles[job.user_id] : null;

            // Calculate real match breakdown
            const matchBreakdown = calculateMatchScore(
              candidateProfile,
              employerProfile
                ? {
                    culture_preferences: employerProfile.culture_preferences as Record<string, number> | null,
                    synergy_scores: employerProfile.synergy_scores as Record<string, number> | null,
                  }
                : null,
              {
                requirements: job.requirements as string[] | null,
                culture_preferences: job.culture_preferences as Record<string, number> | null,
                skills_preferences: job.skills_preferences as Record<string, number> | null,
              }
            );

            const cityInfo = CITIES.find((c) => c.id === job.city_id);
            const hiringManager = Array.isArray(job.hiring_manager) ? job.hiring_manager[0] : job.hiring_manager;

            // Check for timezone synergy
            const locationResult = candidateLocationData ? isJobLocationMatch(
              candidateLocationData,
              { work_mode: job.work_mode, location_text: job.location_text, geographic_restriction: job.geographic_restriction }
            ) : { isMatch: true, hasTimezoneSynergy: false };

            // Parse big_rocks from JSON
            const bigRocks = Array.isArray(job.big_rocks) 
              ? (job.big_rocks as { title: string; description?: string }[])
              : [];

            return {
              id: job.id,
              title: job.title,
              company: job.company,
              description: job.description || "",
              location: cityInfo?.name || job.city_id,
              salary: job.salary || "Competitive",
              remote: job.remote || false,
              benefits: job.benefits as string[] | undefined,
              requirements: job.requirements as string[] | undefined,
              matchScore: matchBreakdown.totalScore,
              matchBreakdown,
              cultureCompatibility: matchBreakdown.cultureScore,
              employerId: job.user_id || undefined,
              hiringManagerName: hiringManager?.name,
              hiringManagerAvatar: hiringManager?.avatar_url,
              hasTimezoneSynergy: locationResult.hasTimezoneSynergy,
              work_mode: job.work_mode || undefined,
              location_text: job.location_text || undefined,
              geographic_restriction: job.geographic_restriction || undefined,
              // Role definition fields
              missionStatement: job.mission_statement || undefined,
              bigRocks: bigRocks.length > 0 ? bigRocks : undefined,
              dailyStack: job.daily_stack as string[] | undefined,
              vibeMode: job.vibe_mode || undefined,
            };
          }),
          ...sampleJobs.map((job) => {
            // Sample jobs get estimated scores
            const estimatedScore = 65 + Math.floor(Math.random() * 15);
            return {
              id: job.id,
              title: job.title,
              company: job.company,
              description: job.description,
              location: job.location,
              salary: job.salary,
              remote: job.remote === "Remote",
              matchScore: estimatedScore,
              matchBreakdown: {
                skillScore: estimatedScore + Math.floor(Math.random() * 10) - 5,
                cultureScore: estimatedScore + Math.floor(Math.random() * 10) - 5,
                synergyScore: estimatedScore + Math.floor(Math.random() * 10) - 5,
                totalScore: estimatedScore,
              },
              cultureCompatibility: estimatedScore + Math.floor(Math.random() * 10) - 5,
              employerId: "sample",
            };
          }),
        ]
        .filter((j) => !swipedIds.includes(j.id))
        // Apply location dealbreaker filter for DB jobs
        .filter((job) => {
          if (!candidateLocationData || job.employerId === "sample") return true;
          const jobLocationData = {
            work_mode: (job as any).work_mode,
            location_text: (job as any).location_text,
            geographic_restriction: (job as any).geographic_restriction,
          };
          const result = isJobLocationMatch(candidateLocationData, jobLocationData);
          if (!result.isMatch) {
            console.log(`[Matching] Excluded job ${job.title}: ${result.reason}`);
          }
          return result.isMatch;
        });

        // Prioritize test employer jobs for test candidate
        if (user?.id === TEST_CANDIDATE_ID) {
          allJobs.sort((a, b) => {
            if (a.employerId === TEST_EMPLOYER_ID) return -1;
            if (b.employerId === TEST_EMPLOYER_ID) return 1;
            return b.matchScore - a.matchScore;
          });
        } else {
          allJobs.sort((a, b) => b.matchScore - a.matchScore);
        }

        setJobs(allJobs);
      } catch (error) {
        console.error("Error fetching jobs:", error);
        toast.error("Failed to load jobs");
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, [user, profile, role, city]);

  // Handle match detection
  useEffect(() => {
    if (latestMatch) {
      const matched = jobs.find(
        (j) => j.employerId === latestMatch.matchedUserId
      );
      if (matched) {
        setMatchedJob(matched);
        setMatchId(latestMatch.matchId);
        setShowMatch(true);
      }
      clearLatestMatch();
    }
  }, [latestMatch, jobs, clearLatestMatch]);

  const handleSwipe = async (
    job: JobWithScore,
    direction: "like" | "pass" | "super_like"
  ) => {
    if (direction !== "pass" && job.employerId && job.employerId !== "sample") {
      const result = await recordSwipe(job.employerId, direction);

      // Only show match celebration for REAL matches (mutual likes)
      if (result?.isMatch && result.matchId) {
        setMatchedJob(job);
        setMatchId(result.matchId);
        setShowMatch(true);
      }
    }
  };

  const handleStartChat = () => {
    setShowMatch(false);
    if (matchId) {
      navigate(`/chat/${matchId}`);
    } else {
      navigate("/matches");
    }
  };

  // Create isMatchedFn for SwipeStack
  const isMatchedFn = (jobId: string) => {
    const job = jobs.find((j) => j.id === jobId);
    return job?.employerId ? checkIsMatched(job.employerId) : false;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border"
      >
        <div className="flex items-center justify-between px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <div className="text-center">
            <h1 className="font-bold text-foreground">
              {roleInfo?.title || "Jobs"}
            </h1>
            <p className="text-xs text-muted-foreground">
              Swipe to find your dream job
            </p>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/matches")}
          >
            <MessageCircle className="w-5 h-5" />
          </Button>
        </div>

        {/* Testing Button */}
        <div className="px-4 pb-2">
          <AdminMatchButton className="w-full border-dashed border-yellow-500/50 text-yellow-600 hover:text-yellow-700" />
        </div>
      </motion.header>

      {/* Swipe Stack */}
      <div className="flex-1 flex flex-col min-h-0">
        <SwipeStack
          items={jobs}
          type="job"
          onSwipe={handleSwipe}
          onEmpty={() => {
            toast.success("You've reviewed all jobs!");
          }}
          isMatchedFn={isMatchedFn}
        />
      </div>

      {/* Match Celebration */}
      <MatchCelebration
        isOpen={showMatch}
        onClose={() => setShowMatch(false)}
        onStartChat={handleStartChat}
        matchedProfile={{
          name: matchedJob?.company || "",
          title: matchedJob?.title,
        }}
        currentUser={{
          name: profile?.full_name || "You",
          avatar: profile?.avatar_url || undefined,
        }}
        matchScore={matchedJob?.matchScore}
      />
    </div>
  );
};

export default CandidateSwipe;
