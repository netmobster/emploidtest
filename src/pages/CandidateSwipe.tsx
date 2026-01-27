import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, MessageCircle, Loader2, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import SwipeStack from "@/components/swipe/SwipeStack";
import MatchCelebration from "@/components/match/MatchCelebration";
import { useBatchMatchStatus } from "@/hooks/useBatchMatchStatus";
import { ROLES, CITIES, TEST_EMPLOYER_ID } from "@/lib/gameData";
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
  // Test role flag
  isTestRole?: boolean;
  // New role flag (non-sample, recently created)
  isNewRole?: boolean;
  createdAt?: string;
}

const CandidateSwipe = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const role = searchParams.get("role");
  const city = searchParams.get("city");

  // Guard: Redirect to preference flow if city or role is missing
  useEffect(() => {
    if (!city || !role) {
      console.log("[CandidateSwipe] Missing city/role params, redirecting to preference flow");
      navigate("/city?type=candidate", { replace: true });
    }
  }, [city, role, navigate]);

  const [jobs, setJobs] = useState<JobWithScore[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showMatch, setShowMatch] = useState(false);
  const [matchedJob, setMatchedJob] = useState<JobWithScore | null>(null);
  const [matchId, setMatchId] = useState<string | null>(null);
  const [hideTestRoles, setHideTestRoles] = useState(false);

  const roleInfo = ROLES.find((r) => r.id === role);

  // Get employer IDs for batch match status checking
  const employerIds = useMemo(
    () => jobs.map((j) => j.employerId).filter((id): id is string => !!id),
    [jobs]
  );
  const { isMatched: checkIsMatched } = useBatchMatchStatus(employerIds);

  // Fetch jobs with real match score calculations
  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);

      try {
        // Get already swiped jobs to exclude (by job_id)
        let swipedJobIds: string[] = [];
        let swipedEmployerIds: string[] = [];
        if (user) {
          const { data: swipes } = await supabase
            .from("swipes")
            .select("swiped_id, job_id")
            .eq("swiper_id", user.id);
          // Collect both job IDs and employer IDs that were swiped
          swipedJobIds = swipes?.filter(s => s.job_id).map((s) => s.job_id!) || [];
          swipedEmployerIds = swipes?.map((s) => s.swiped_id) || [];
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
        // Only show roles that have been published by the employer
        query = query.eq("is_complete", true);

        const { data: dbJobs, error: jobsError } = await query;
        if (jobsError) throw jobsError;

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

        const allJobs: JobWithScore[] = (dbJobs || [])
          .map((job) => {
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

            // Parse big_rocks from JSON (jsonb)
            const rawBigRocks = (job as any).big_rocks;
            const parsedBigRocks =
              typeof rawBigRocks === "string"
                ? (() => {
                    try {
                      return JSON.parse(rawBigRocks);
                    } catch {
                      return [];
                    }
                  })()
                : rawBigRocks;

            const bigRocks = Array.isArray(parsedBigRocks)
              ? (parsedBigRocks as { title: string; description?: string }[])
              : [];

            // Determine if this is a test role (from a known test employer)
            const isTestRole = job.user_id === TEST_EMPLOYER_ID;

            // Determine if this is a "new" role (non-test, created in last 7 days)
            const createdAt = job.created_at;
            const isNewRole = !isTestRole && 
              createdAt && 
              (Date.now() - new Date(createdAt).getTime()) < 7 * 24 * 60 * 60 * 1000;

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
              // Flags
              isTestRole,
              isNewRole,
              createdAt,
            };
          })
          // Exclude already-swiped jobs (by job_id OR employer_id)
          .filter((j) => {
            const alreadySwipedByJobId = swipedJobIds.includes(j.id);
            const alreadySwipedByEmployerId = j.employerId ? swipedEmployerIds.includes(j.employerId) : false;
            if (alreadySwipedByJobId || alreadySwipedByEmployerId) {
              console.log(`[Matching] Excluding already-swiped job: ${j.title}`);
              return false;
            }
            return true;
          })
          // Apply location dealbreaker filter
          .filter((job) => {
            if (!candidateLocationData) return true;
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

        if (allJobs.length === 0) {
          toast.message("No published roles yet", {
            description: "When employers publish a role, it will appear here with full details (Mission, Big Rocks, Daily Stack).",
          });
        }

        // Sort: Non-test roles first (prioritize new roles), then test roles (by match score)
        allJobs.sort((a, b) => {
          // Non-test roles come before test roles
          if (a.isTestRole && !b.isTestRole) return 1;
          if (!a.isTestRole && b.isTestRole) return -1;
          
          // Within non-test roles, prioritize "new" roles
          if (!a.isTestRole && !b.isTestRole) {
            if (a.isNewRole && !b.isNewRole) return -1;
            if (!a.isNewRole && b.isNewRole) return 1;
          }
          
          // Then sort by match score
          return b.matchScore - a.matchScore;
        });

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

  const handleSwipe = async (
    job: JobWithScore,
    direction: "like" | "pass" | "super_like"
  ) => {
    if (!job.employerId || !user) return;

    // Record swipe with job_id for proper exclusion on refresh
    const { error } = await supabase
      .from("swipes")
      .insert({
        swiper_id: user.id,
        swiped_id: job.employerId,
        job_id: job.id,
        direction,
      });

    if (error) {
      if (error.code === "23505") {
        console.warn("[CandidateSwipe] Duplicate swipe detected");
      } else {
        console.error("[CandidateSwipe] Error recording swipe:", error);
        toast.error("Failed to record swipe");
      }
      return;
    }

    console.log(`[CandidateSwipe] Recorded ${direction} on job ${job.id}`);

    // For likes/super_likes, show toast and check for a match
    if (direction !== "pass") {
      if (direction === "super_like") {
        toast.success("Super Like sent! ⭐", { duration: 2000 });
      } else {
        toast.success("Like sent! 💚", { duration: 1500 });
      }

      // Poll for match (the DB trigger may have created one)
      const { data: match } = await supabase
        .from("matches")
        .select("id")
        .or(
          `and(employer_id.eq.${user.id},candidate_id.eq.${job.employerId}),and(employer_id.eq.${job.employerId},candidate_id.eq.${user.id})`
        )
        .order("matched_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (match) {
        console.log("[CandidateSwipe] Match found:", match.id);
        setMatchedJob(job);
        setMatchId(match.id);
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

        {/* Test Role Filter + Admin Button */}
        <div className="px-4 pb-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Switch
              id="hide-test-roles"
              checked={hideTestRoles}
              onCheckedChange={setHideTestRoles}
            />
            <Label htmlFor="hide-test-roles" className="text-xs text-muted-foreground flex items-center gap-1">
              <FlaskConical className="w-3 h-3" />
              Hide test roles
            </Label>
          </div>
          <AdminMatchButton className="border-dashed border-amber-500/50 text-amber-600 hover:text-amber-700" />
        </div>
      </motion.header>

      {/* Swipe Stack */}
      <div className="flex-1 flex flex-col min-h-0">
        <SwipeStack
          items={hideTestRoles ? jobs.filter((j) => !j.isTestRole) : jobs}
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
