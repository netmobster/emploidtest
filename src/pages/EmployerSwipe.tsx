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
import { ROLES, SAMPLE_CANDIDATES } from "@/lib/gameData";
import { calculateCandidateMatchScore } from "@/lib/matchUtils";
import { toast } from "sonner";
import ProfileHeader from "@/components/ProfileHeader";

interface CandidateWithScore {
  id: string;
  name: string;
  title: string;
  avatar: string;
  bio: string;
  skills: string[];
  location: string;
  experience: string;
  availability: string;
  remote: boolean;
  matchScore: number;
  userId?: string;
}

const EmployerSwipe = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const role = searchParams.get("role");
  const jobId = searchParams.get("jobId") || undefined;

  const [candidates, setCandidates] = useState<CandidateWithScore[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showMatch, setShowMatch] = useState(false);
  const [matchedCandidate, setMatchedCandidate] = useState<CandidateWithScore | null>(null);
  const [matchId, setMatchId] = useState<string | null>(null);

  const { recordSwipe, latestMatch, clearLatestMatch } = useSwipe(jobId);

  const roleInfo = ROLES.find((r) => r.id === role);

  // Fetch candidates
  useEffect(() => {
    const fetchCandidates = async () => {
      setIsLoading(true);

      try {
        // Get already swiped candidates to exclude
        let swipedIds: string[] = [];
        if (user) {
          const { data: swipes } = await supabase
            .from("swipes")
            .select("swiped_id")
            .eq("swiper_id", user.id);
          swipedIds = swipes?.map((s) => s.swiped_id) || [];
        }

        // Get employer's job preferences for match calculation
        let employerPrefs: { culture_preferences: any; skills_preferences: any } | null = null;
        if (user && role) {
          // Get the employer's most recent job for this role to use its preferences
          const { data: jobData } = await supabase
            .from("jobs")
            .select("culture_preferences, skills_preferences")
            .eq("user_id", user.id)
            .eq("role_id", role)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();
          
          employerPrefs = jobData;
        }

        // Fetch real candidate profiles from database
        const { data: dbProfiles } = await supabase
          .from("profiles")
          .select("user_id, full_name, avatar_url, bio, culture_preferences")
          .eq("user_type", "candidate");

        // For now, use sample candidates (filtered by role)
        const roleCandidates = SAMPLE_CANDIDATES.filter(
          (c) => !role || c.roleId === role
        );

        // Add match scores and filter out already swiped
        const candidatesWithScores: CandidateWithScore[] = roleCandidates
          .filter((c) => !swipedIds.includes(c.id))
          .map((candidate) => {
            // Check if we have a real profile for this candidate
            const realProfile = dbProfiles?.find(p => p.user_id === candidate.id);
            
            // Calculate match score based on preferences
            const matchScore = calculateCandidateMatchScore(
              realProfile ? { culture_preferences: realProfile.culture_preferences as Record<string, string> | null } : null,
              employerPrefs as { culture_preferences?: Record<string, string> | null; skills_preferences?: Record<string, string> | null } | null
            );

            return {
              id: candidate.id,
              name: realProfile?.full_name || candidate.name,
              title: candidate.title,
              avatar: realProfile?.avatar_url || candidate.avatar,
              bio: realProfile?.bio || candidate.bio,
              skills: candidate.skills,
              location: candidate.location,
              experience: candidate.experience,
              availability: candidate.availability,
              remote: candidate.remote === "Remote" || candidate.remote === "Flexible",
              matchScore,
              userId: candidate.id,
            };
          })
          .sort((a, b) => b.matchScore - a.matchScore);

        setCandidates(candidatesWithScores);
      } catch (error) {
        console.error("Error fetching candidates:", error);
        toast.error("Failed to load candidates");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCandidates();
  }, [user, role]);

  // Handle match detection from hook
  useEffect(() => {
    if (latestMatch) {
      const matched = candidates.find(
        (c) => c.userId === latestMatch.matchedUserId || c.id === latestMatch.matchedUserId
      );
      if (matched) {
        setMatchedCandidate(matched);
        setMatchId(latestMatch.matchId);
        setShowMatch(true);
      }
      clearLatestMatch();
    }
  }, [latestMatch, candidates, clearLatestMatch]);

  const handleSwipe = async (
    candidate: CandidateWithScore,
    direction: "like" | "pass" | "super_like"
  ) => {
    // For demo purposes, we'll just show a match randomly on likes
    // In production, this would use the actual user IDs
    if (direction !== "pass") {
      const result = await recordSwipe(candidate.userId || candidate.id, direction);
      
      // Demo: Show match celebration randomly (30% chance on like)
      if (result && Math.random() < 0.3) {
        setMatchedCandidate(candidate);
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
              {roleInfo?.title || "Candidates"}
            </h1>
            <p className="text-xs text-muted-foreground">
              Swipe to find your match
            </p>
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
          items={candidates}
          type="candidate"
          onSwipe={handleSwipe}
          onEmpty={() => {
            toast.success("You've reviewed all candidates!");
          }}
        />
      </div>

      {/* Match Celebration */}
      <MatchCelebration
        isOpen={showMatch}
        onClose={() => setShowMatch(false)}
        onStartChat={handleStartChat}
        matchedProfile={{
          name: matchedCandidate?.name || "",
          avatar: matchedCandidate?.avatar,
          title: matchedCandidate?.title,
        }}
        currentUser={{
          name: profile?.full_name || "You",
          avatar: profile?.avatar_url || undefined,
        }}
        matchScore={matchedCandidate?.matchScore}
      />
    </div>
  );
};

export default EmployerSwipe;
