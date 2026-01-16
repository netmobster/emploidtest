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
import { ROLES, SAMPLE_CANDIDATES, TEST_EMPLOYER_ID, TEST_CANDIDATE_ID } from "@/lib/gameData";
import { calculateMatchScore, MatchScoreBreakdown } from "@/lib/matchScoreUtils";
import { getPrimaryBadge } from "@/lib/badgeUtils";
import { toast } from "sonner";

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
  matchBreakdown?: MatchScoreBreakdown;
  cultureCompatibility?: number;
  userId?: string;
  // Extended profile fields
  linkedinUrl?: string;
  websiteUrl?: string;
  portfolioUrl?: string;
  remotePreference?: string;
  resumeUrl?: string;
  coverImageUrl?: string;
  // Synergy score fields
  hasSynergyScore?: boolean;
  synergyBadge?: string;
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

  // Get candidate IDs for batch match status checking
  const candidateIds = useMemo(
    () => candidates.map((c) => c.userId || c.id).filter((id): id is string => !!id),
    [candidates]
  );
  const { isMatched: checkIsMatched } = useBatchMatchStatus(candidateIds);

  // Fetch candidates with real match score calculations
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
        let jobData: {
          requirements: string[] | null;
          culture_preferences: Record<string, number> | null;
          skills_preferences: Record<string, number> | null;
        } | null = null;

        if (user && role) {
          const { data: jobResult } = await supabase
            .from("jobs")
            .select("requirements, culture_preferences, skills_preferences")
            .eq("user_id", user.id)
            .eq("role_id", role)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          if (jobResult) {
            jobData = {
              requirements: jobResult.requirements as string[] | null,
              culture_preferences: jobResult.culture_preferences as Record<string, number> | null,
              skills_preferences: jobResult.skills_preferences as Record<string, number> | null,
            };
          }
        }

        // Get employer's profile for synergy comparison
        const employerProfile = profile
          ? {
              culture_preferences: (profile.culture_preferences as unknown) as Record<string, number> | null,
              synergy_scores: (profile.synergy_scores as unknown) as Record<string, number> | null,
            }
          : null;

        // Fetch real candidate profiles from database
        const { data: dbProfiles } = await supabase
          .from("profiles")
          .select(
            "user_id, full_name, avatar_url, bio, culture_preferences, synergy_scores, job_title, skills, location, years_of_experience, availability, remote_preference, linkedin_url, website_url, portfolio_url, resume_url, cover_image_url, has_completed_synergy_quiz"
          )
          .eq("user_type", "candidate");

        // Get sample candidates filtered by role
        const roleCandidates = SAMPLE_CANDIDATES.filter(
          (c) => !role || c.roleId === role
        );

        // Build candidates with real match scores
        const candidatesWithScores: CandidateWithScore[] = roleCandidates
          .filter((c) => !swipedIds.includes(c.id))
          .map((candidate) => {
            // Check if we have a real profile for this candidate
            const realProfile = dbProfiles?.find((p) => p.user_id === candidate.id);

            // Build candidate profile for match calculation
            const candidateProfile = realProfile
              ? {
                  skills: realProfile.skills as string[] | null,
                  culture_preferences: realProfile.culture_preferences as Record<string, number> | null,
                  synergy_scores: realProfile.synergy_scores as Record<string, number> | null,
                }
              : null;

            // Calculate real match breakdown
            const matchBreakdown = calculateMatchScore(
              candidateProfile,
              employerProfile,
              jobData
            );

            return {
              id: candidate.id,
              name: realProfile?.full_name || candidate.name,
              title: realProfile?.job_title || candidate.title,
              avatar: realProfile?.avatar_url || candidate.avatar,
              bio: realProfile?.bio || candidate.bio,
              skills: (realProfile?.skills as string[]) || candidate.skills,
              location: realProfile?.location || candidate.location,
              experience: realProfile?.years_of_experience || candidate.experience,
              availability: realProfile?.availability || candidate.availability,
              remote:
                realProfile?.remote_preference === "remote" ||
                realProfile?.remote_preference === "flexible" ||
                candidate.remote === "Remote" ||
                candidate.remote === "Flexible",
              matchScore: matchBreakdown.totalScore,
              matchBreakdown,
              cultureCompatibility: matchBreakdown.cultureScore,
              userId: candidate.id,
              // Extended profile fields
              linkedinUrl: realProfile?.linkedin_url || undefined,
              websiteUrl: realProfile?.website_url || undefined,
              portfolioUrl: realProfile?.portfolio_url || undefined,
              remotePreference: realProfile?.remote_preference || undefined,
              resumeUrl: realProfile?.resume_url || undefined,
              coverImageUrl: realProfile?.cover_image_url || undefined,
              // Synergy score fields
              hasSynergyScore: realProfile?.has_completed_synergy_quiz || false,
              synergyBadge: realProfile?.synergy_scores
                ? getPrimaryBadge(realProfile.synergy_scores as Record<string, number>)?.title
                : undefined,
            };
          });

        // Also add real DB candidates that aren't in sample data
        const sampleIds = new Set(roleCandidates.map((c) => c.id));
        const additionalCandidates =
          dbProfiles
            ?.filter((p) => !sampleIds.has(p.user_id) && !swipedIds.includes(p.user_id))
            .map((realProfile) => {
              const candidateProfile = {
                skills: realProfile.skills as string[] | null,
                culture_preferences: realProfile.culture_preferences as Record<string, number> | null,
                synergy_scores: realProfile.synergy_scores as Record<string, number> | null,
              };

              const matchBreakdown = calculateMatchScore(
                candidateProfile,
                employerProfile,
                jobData
              );

              return {
                id: realProfile.user_id,
                name: realProfile.full_name || "Candidate",
                title: realProfile.job_title || "Professional",
                avatar: realProfile.avatar_url || "",
                bio: realProfile.bio || "",
                skills: (realProfile.skills as string[]) || [],
                location: realProfile.location || "",
                experience: realProfile.years_of_experience || "",
                availability: realProfile.availability || "Flexible",
                remote:
                  realProfile.remote_preference === "remote" ||
                  realProfile.remote_preference === "flexible",
                matchScore: matchBreakdown.totalScore,
                matchBreakdown,
                cultureCompatibility: matchBreakdown.cultureScore,
                userId: realProfile.user_id,
                linkedinUrl: realProfile.linkedin_url || undefined,
                websiteUrl: realProfile.website_url || undefined,
                portfolioUrl: realProfile.portfolio_url || undefined,
                remotePreference: realProfile.remote_preference || undefined,
                resumeUrl: realProfile.resume_url || undefined,
                coverImageUrl: realProfile.cover_image_url || undefined,
                hasSynergyScore: realProfile.has_completed_synergy_quiz || false,
                synergyBadge: realProfile.synergy_scores
                  ? getPrimaryBadge(realProfile.synergy_scores as Record<string, number>)?.title
                  : undefined,
              };
            }) || [];

        const allCandidates = [...candidatesWithScores, ...additionalCandidates];

        // Prioritize test candidate for test employer
        if (user?.id === TEST_EMPLOYER_ID) {
          allCandidates.sort((a, b) => {
            if (a.userId === TEST_CANDIDATE_ID) return -1;
            if (b.userId === TEST_CANDIDATE_ID) return 1;
            return b.matchScore - a.matchScore;
          });
        } else {
          allCandidates.sort((a, b) => b.matchScore - a.matchScore);
        }

        setCandidates(allCandidates);
      } catch (error) {
        console.error("Error fetching candidates:", error);
        toast.error("Failed to load candidates");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCandidates();
  }, [user, profile, role]);

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

  // Create isMatchedFn for SwipeStack
  const isMatchedFn = (candidateId: string) => {
    const candidate = candidates.find((c) => c.id === candidateId);
    return checkIsMatched(candidate?.userId || candidateId);
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
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <div className="text-center">
            <h1 className="font-bold text-foreground">{roleInfo?.title || "Candidates"}</h1>
            <p className="text-xs text-muted-foreground">Swipe to find your match</p>
          </div>

          <Button variant="ghost" size="icon" onClick={() => navigate("/matches")}>
            <MessageCircle className="w-5 h-5" />
          </Button>
        </div>
      </motion.header>

      {/* Swipe Stack */}
      <div className="flex-1 flex flex-col min-h-0">
        <SwipeStack
          items={candidates}
          type="candidate"
          onSwipe={handleSwipe}
          onEmpty={() => {
            toast.success("You've reviewed all candidates!");
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
