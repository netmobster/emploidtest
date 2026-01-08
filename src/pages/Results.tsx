import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { SAMPLE_JOBS, ROLES } from "@/lib/gameData";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles, Loader2, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import Logo from "@/components/Logo";
import ProfileHeader from "@/components/ProfileHeader";
import SwipeStack from "@/components/swipe/SwipeStack";
import MatchCelebration from "@/components/match/MatchCelebration";
import { useSwipe } from "@/hooks/useSwipe";

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

  // Fetch jobs
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

      // Fetch jobs
      const { data: jobsData, error: jobsError } = await supabase
        .from("jobs")
        .select("*")
        .eq("role_id", role)
        .eq("city_id", cityId);
      
      // Get sample jobs for this role
      const sampleJobs = SAMPLE_JOBS.filter((job) => job.roleId === role);

      // Combine database jobs and sample jobs
      const allJobs: JobWithScore[] = [
        // Database jobs first (real employer postings)
        ...(jobsData || []).map((job: DatabaseJob) => ({
          id: job.id,
          title: job.title,
          company: job.company,
          location: cityName,
          salary: job.salary || "Competitive",
          remote: job.remote || false,
          description: job.description || "",
          benefits: job.benefits || undefined,
          requirements: job.requirements || undefined,
          matchScore: Math.floor(Math.random() * 15) + 85,
          isFromDatabase: true,
          employerId: job.user_id || undefined,
        })),
        // Sample jobs
        ...sampleJobs.map((job) => ({
          id: job.id,
          title: job.title,
          company: job.company,
          location: job.location,
          salary: job.salary,
          remote: job.remote === "Remote",
          description: job.description,
          matchScore: Math.floor(Math.random() * 30) + 70,
          isFromDatabase: false,
          employerId: "sample",
        })),
      ]
        .filter((j) => !swipedIds.includes(j.id))
        .sort((a, b) => b.matchScore - a.matchScore);

      setJobs(allJobs);
      setIsLoading(false);
    };

    fetchData();
  }, [role, cityId, user, cityName]);

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
            onClick={() => navigate(`/roles?type=${userType}&city=${cityId}`)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <div className="text-center">
            <div className="inline-flex items-center gap-1.5 text-xs text-primary mb-0.5">
              <Sparkles className="w-3 h-3" />
              <span>Matches Ready</span>
            </div>
            <h1 className="font-bold text-foreground">
              {roleInfo?.title || "Jobs"}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/matches")}
            >
              <MessageCircle className="w-5 h-5" />
            </Button>
            <ProfileHeader />
          </div>
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

export default Results;