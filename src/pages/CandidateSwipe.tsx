import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, MessageCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import SwipeStack from "@/components/swipe/SwipeStack";
import MatchCelebration from "@/components/match/MatchCelebration";
import { useSwipe } from "@/hooks/useSwipe";
import { ROLES, SAMPLE_JOBS } from "@/lib/gameData";
import { calculateJobMatchScore } from "@/lib/matchUtils";
import { toast } from "sonner";

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
  employerId?: string;
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

  // Fetch jobs
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

        // Get candidate's preferences for match calculation
        const candidatePrefs = profile?.culture_preferences 
          ? { culture_preferences: profile.culture_preferences }
          : null;

        // Fetch real jobs from database with preferences
        let query = supabase.from("jobs").select("*");
        if (role) query = query.eq("role_id", role);
        if (city) query = query.eq("city_id", city);

        const { data: dbJobs } = await query;

        // Combine with sample jobs (sample jobs don't have cityId, so only filter by role)
        const sampleJobs = SAMPLE_JOBS.filter(
          (j) => !role || j.roleId === role
        );

        const allJobs: JobWithScore[] = [
          ...(dbJobs || []).map((job) => {
            // Calculate match score based on preferences
            const matchScore = calculateJobMatchScore(
              candidatePrefs,
              {
                culture_preferences: job.culture_preferences as Record<string, string> | null,
                skills_preferences: job.skills_preferences as Record<string, string> | null,
              }
            );

            return {
              id: job.id,
              title: job.title,
              company: job.company,
              description: job.description || "",
              location: `${job.city_id}`,
              salary: job.salary || "Competitive",
              remote: job.remote || false,
              benefits: job.benefits as string[] | undefined,
              requirements: job.requirements as string[] | undefined,
              matchScore,
              employerId: job.user_id || undefined,
            };
          }),
          ...sampleJobs.map((job) => ({
            id: job.id,
            title: job.title,
            company: job.company,
            description: job.description,
            location: job.location,
            salary: job.salary,
            remote: job.remote === "Remote",
            // Sample jobs don't have preferences, so use base score with slight randomization
            matchScore: 65 + Math.floor(Math.random() * 15),
            employerId: "sample",
          })),
        ]
          .filter((j) => !swipedIds.includes(j.id))
          .sort((a, b) => b.matchScore - a.matchScore);

        setJobs(allJobs);
      } catch (error) {
        console.error("Error fetching jobs:", error);
        toast.error("Failed to load jobs");
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, [user, role, city]);

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
      </motion.header>

      {/* Swipe Stack */}
      <div className="flex-1 flex flex-col">
        <SwipeStack
          items={jobs}
          type="job"
          onSwipe={handleSwipe}
          onEmpty={() => {
            toast.success("You've reviewed all jobs!");
          }}
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
