import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState, useMemo } from "react";
import { SAMPLE_JOBS, ROLES } from "@/lib/gameData";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles, Loader2, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import ProfileHeader from "@/components/ProfileHeader";
import SwipeStack from "@/components/swipe/SwipeStack";
import MatchCelebration from "@/components/match/MatchCelebration";
import { useSwipe } from "@/hooks/useSwipe";
import { useBatchMatchStatus } from "@/hooks/useBatchMatchStatus";
import { calculateMatchScore, MatchScoreBreakdown } from "@/lib/matchScoreUtils";

interface DatabaseJob {
  id: string;
  title: string;
  company: string;
  role_id: string;
  city_id: string;
  description: string | null;
  salary: string | null;
  type: string | null;
  remote: boolean | null;
  benefits: string[] | null;
  requirements: string[] | null;
  culture_preferences: unknown;
  skills_preferences: unknown;
  user_id: string | null;
}

interface JobWithScore {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  remote: boolean;
  description: string;
  benefits?: string[];
  requirements?: string[];
  matchScore: number;
  matchBreakdown?: MatchScoreBreakdown;
  cultureCompatibility?: number;
  isFromDatabase: boolean;
  employerId?: string;
}

const Results = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const role = searchParams.get("role") || "";
  const cityId = searchParams.get("city") || "new-york";
  const userType = searchParams.get("type") || "candidate";

  const [jobs, setJobs] = useState<JobWithScore[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showMatch, setShowMatch] = useState(false);
  const [matchedJob, setMatchedJob] = useState<JobWithScore | null>(null);
  const [matchId, setMatchId] = useState<string | null>(null);

  const { recordSwipe, latestMatch, clearLatestMatch } = useSwipe();

  const roleInfo = ROLES.find((r) => r.id === role);
  const cityName = cityId === "toronto" ? "Toronto, ON" : "New York, NY";

  // Get employer IDs for batch match status checking
  const employerIds = useMemo(
    () => jobs.map((j) => j.employerId).filter((id): id is string => !!id && id !== "sample"),
    [jobs]
  );
  const { isMatched: checkIsMatched } = useBatchMatchStatus(employerIds);

  // Fetch jobs with real match calculations
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      // Get already swiped jobs to exclude
      let swipedIds: string[] = [];
      if (user) {
        const { data: swipes } = await supabase
          .from("swipes")
          .select("swiped_id")
          .eq("swiper_id", user.id);
        swipedIds = swipes?.map((s) => s.swiped_id) || [];
      }

      // Get candidate's profile for match calculation
      const candidateProfile = profile
        ? {
            skills: profile.skills as string[] | null,
            culture_preferences: (profile.culture_preferences as unknown) as Record<string, number> | null,
            synergy_scores: (profile.synergy_scores as unknown) as Record<string, number> | null,
          }
        : null;

      // Fetch jobs
      const { data: jobsData } = await supabase
        .from("jobs")
        .select("*")
        .eq("role_id", role)
        .eq("city_id", cityId);

      // Fetch employer profiles for synergy comparison
      const employerUserIds = [...new Set((jobsData || []).map((j) => j.user_id).filter(Boolean))];
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

      // Get sample jobs for this role
      const sampleJobs = SAMPLE_JOBS.filter((job) => job.roleId === role);

      // Combine database jobs and sample jobs with real calculations
      const allJobs: JobWithScore[] = [
        // Database jobs first (real employer postings)
        ...(jobsData || []).map((job) => {
          const typedJob = job as unknown as DatabaseJob;
          const employerProfile = typedJob.user_id ? employerProfiles[typedJob.user_id] : null;

          const matchBreakdown = calculateMatchScore(
            candidateProfile,
            employerProfile
              ? {
                  culture_preferences: (employerProfile.culture_preferences as unknown) as Record<string, number> | null,
                  synergy_scores: (employerProfile.synergy_scores as unknown) as Record<string, number> | null,
                }
              : null,
            {
              requirements: typedJob.requirements as string[] | null,
              culture_preferences: (typedJob.culture_preferences as unknown) as Record<string, number> | null,
              skills_preferences: (typedJob.skills_preferences as unknown) as Record<string, number> | null,
            }
          );

          return {
            id: typedJob.id,
            title: typedJob.title,
            company: typedJob.company,
            location: cityName,
            salary: typedJob.salary || "Competitive",
            remote: typedJob.remote || false,
            description: typedJob.description || "",
            benefits: typedJob.benefits || undefined,
            requirements: typedJob.requirements || undefined,
            matchScore: matchBreakdown.totalScore,
            matchBreakdown,
            cultureCompatibility: matchBreakdown.cultureScore,
            isFromDatabase: true,
            employerId: typedJob.user_id || undefined,
          };
        }),
        // Sample jobs with estimated scores
        ...sampleJobs.map((job) => {
          const estimatedScore = Math.floor(Math.random() * 30) + 70;
          return {
            id: job.id,
            title: job.title,
            company: job.company,
            location: job.location,
            salary: job.salary,
            remote: job.remote === "Remote",
            description: job.description,
            matchScore: estimatedScore,
            matchBreakdown: {
              skillScore: estimatedScore + Math.floor(Math.random() * 10) - 5,
              cultureScore: estimatedScore + Math.floor(Math.random() * 10) - 5,
              synergyScore: estimatedScore + Math.floor(Math.random() * 10) - 5,
              totalScore: estimatedScore,
            },
            cultureCompatibility: estimatedScore,
            isFromDatabase: false,
            employerId: "sample",
          };
        }),
      ]
        .filter((j) => !swipedIds.includes(j.id))
        .sort((a, b) => b.matchScore - a.matchScore);

      setJobs(allJobs);
      setIsLoading(false);
    };

    fetchData();
  }, [role, cityId, user, profile, cityName]);

  // Handle match detection
  useEffect(() => {
    if (latestMatch) {
      const matched = jobs.find((j) => j.employerId === latestMatch.matchedUserId);
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

      // Demo: Show match celebration randomly
      if (result && Math.random() < 0.3) {
        setMatchedJob(job);
        setMatchId(result.matchId || "demo-match");
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
    <div className="min-h-screen bg-background flex flex-col">
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
            onClick={() => navigate(`/roles?type=${userType}&city=${cityId}`)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <div className="text-center">
            <div className="inline-flex items-center gap-1.5 text-xs text-primary mb-0.5">
              <Sparkles className="w-3 h-3" />
              <span>Matches Ready</span>
            </div>
            <h1 className="font-bold text-foreground">{roleInfo?.title || "Jobs"}</h1>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate("/matches")}>
              <MessageCircle className="w-5 h-5" />
            </Button>
            <ProfileHeader />
          </div>
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

export default Results;
