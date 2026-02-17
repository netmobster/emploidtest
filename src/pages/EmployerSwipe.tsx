import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, MessageCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import SwipeStack from "@/components/swipe/SwipeStack";
import MatchCelebration from "@/components/match/MatchCelebration";
import { AddToShortlistDialog } from "@/components/chat/AddToShortlistDialog";
import { useSwipe } from "@/hooks/useSwipe";
import { useBatchMatchStatus } from "@/hooks/useBatchMatchStatus";
import { useShortlistStatus } from "@/hooks/useShortlistStatus";
import { useShortlist } from "@/hooks/useShortlist";
import { useEmployerJobs } from "@/hooks/useEmployerJobs";
import { ROLES, SAMPLE_CANDIDATES, TEST_EMPLOYER_ID, TEST_CANDIDATE_ID } from "@/lib/gameData";
import { calculateMatchScore, MatchScoreBreakdown } from "@/lib/matchScoreUtils";
import { getPrimaryBadge } from "@/lib/badgeUtils";
import { isLocationMatch } from "@/lib/locationMatchingUtils";
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
  hasTimezoneSynergy?: boolean;
  // Location fields for filtering
  work_mode?: string;
  city_hub?: string;
  // Non-sample detection
  isRealCandidate?: boolean;
  isNewCandidate?: boolean;
  createdAt?: string;
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
  
  // Shortlist dialog state
  const [shortlistDialogOpen, setShortlistDialogOpen] = useState(false);
  const [shortlistCandidate, setShortlistCandidate] = useState<CandidateWithScore | null>(null);

  const { recordSwipe, latestMatch, clearLatestMatch } = useSwipe(jobId);
  const { isShortlisted, getShortlistsForCandidate, refetch: refetchShortlistStatus } = useShortlistStatus();
  const { addToShortlist, isLoading: isAddingToShortlist } = useShortlist();
  const { jobs: employerJobs, isLoading: isLoadingJobs } = useEmployerJobs();

  const roleInfo = ROLES.find((r) => r.id === role);

  // Get candidate IDs for batch match status checking
  const candidateIds = useMemo(
    () => candidates.map((c) => c.userId || c.id).filter((id): id is string => !!id),
    [candidates]
  );
  const { isMatched: checkIsMatched } = useBatchMatchStatus(candidateIds);

  // Auth guard - redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate("/auth?type=employer", { replace: true });
    }
  }, [user, navigate]);

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
          work_mode?: string | null;
          location_text?: string | null;
          geographic_restriction?: string | null;
        } | null = null;

        if (user && role) {
          const { data: jobResult } = await supabase
            .from("jobs")
            .select("requirements, culture_preferences, skills_preferences, work_mode, location_text, geographic_restriction")
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
              work_mode: jobResult.work_mode,
              location_text: jobResult.location_text,
              geographic_restriction: jobResult.geographic_restriction,
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

        // Fetch real candidate profiles from database (including location fields)
        const { data: dbProfiles } = await supabase
          .from("profiles")
          .select(
            "user_id, full_name, avatar_url, bio, culture_preferences, synergy_scores, job_title, skills, location, years_of_experience, availability, remote_preference, linkedin_url, website_url, portfolio_url, resume_url, cover_image_url, has_completed_synergy_quiz, work_mode, city_hub, is_verified_identity, created_at"
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

            // Check location match for timezone synergy
            const locationResult = jobData ? isLocationMatch(
              { work_mode: realProfile?.work_mode, city_hub: realProfile?.city_hub },
              jobData
            ) : { isMatch: true, hasTimezoneSynergy: false };

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
              // Location fields
              hasTimezoneSynergy: locationResult.hasTimezoneSynergy,
              work_mode: realProfile?.work_mode || undefined,
              city_hub: realProfile?.city_hub || undefined,
            };
          })
          // Apply location dealbreaker filter
          .filter((candidate) => {
            if (!jobData) return true;
            const result = isLocationMatch(
              { work_mode: candidate.work_mode, city_hub: candidate.city_hub },
              jobData
            );
            if (!result.isMatch) {
              console.log(`[Matching] Excluded ${candidate.name}: ${result.reason}`);
            }
            return result.isMatch;
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
                isRealCandidate: true,
                createdAt: realProfile.created_at,
              };
            }) || [];

        // Mark additional candidates with new flag
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        const additionalCandidatesWithFlags = additionalCandidates.map(c => ({
          ...c,
          isNewCandidate: c.createdAt ? new Date(c.createdAt) > sevenDaysAgo : false,
        }));

        const allCandidates = [...candidatesWithScores, ...additionalCandidatesWithFlags];

        // Prioritize non-sample/real candidates first, then by match score
        // Test candidate gets priority for test employer
        if (user?.id === TEST_EMPLOYER_ID) {
          allCandidates.sort((a, b) => {
            if (a.userId === TEST_CANDIDATE_ID) return -1;
            if (b.userId === TEST_CANDIDATE_ID) return 1;
            return b.matchScore - a.matchScore;
          });
        } else {
          allCandidates.sort((a, b) => {
            // Real candidates come first
            const aReal = a.isRealCandidate ? 1 : 0;
            const bReal = b.isRealCandidate ? 1 : 0;
            if (aReal !== bReal) return bReal - aReal;
            
            // New candidates come before older ones
            const aNew = a.isNewCandidate ? 1 : 0;
            const bNew = b.isNewCandidate ? 1 : 0;
            if (aNew !== bNew) return bNew - aNew;
            
            // Finally sort by match score
            return b.matchScore - a.matchScore;
          });
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

      // Only show match celebration for REAL matches (mutual likes)
      if (result?.isMatch && result.matchId) {
        setMatchedCandidate(candidate);
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
  const isMatchedFn = useCallback((candidateId: string) => {
    const candidate = candidates.find((c) => c.id === candidateId);
    return checkIsMatched(candidate?.userId || candidateId);
  }, [candidates, checkIsMatched]);

  // Create isShortlistedFn for SwipeStack
  const isShortlistedFn = useCallback((candidateId: string) => {
    const candidate = candidates.find((c) => c.id === candidateId);
    return isShortlisted(candidate?.userId || candidateId);
  }, [candidates, isShortlisted]);

  // Create getShortlistedRolesFn for SwipeStack to show in tooltip
  const getShortlistedRolesFn = useCallback((candidateId: string) => {
    const candidate = candidates.find((c) => c.id === candidateId);
    const shortlists = getShortlistsForCandidate(candidate?.userId || candidateId);
    return shortlists.map(s => s.jobTitle);
  }, [candidates, getShortlistsForCandidate]);

  // Handle shortlist button click - quick add if only one job, otherwise open dialog
  const handleShortlist = useCallback(async (candidate: CandidateWithScore) => {
    const candidateId = candidate.userId || candidate.id;
    
    // If only one job exists, bypass dialog and add directly
    if (employerJobs.length === 1) {
      const singleJob = employerJobs[0];
      const success = await addToShortlist(singleJob.id, candidateId);
      if (success) {
        refetchShortlistStatus();
      }
      return;
    }
    
    // If current job context exists and employer wants quick add for that job
    if (jobId && employerJobs.find(j => j.id === jobId)) {
      // Could also quick-add here, but dialog allows notes - let user choose
    }
    
    // Multiple jobs - open dialog for selection
    setShortlistCandidate(candidate);
    setShortlistDialogOpen(true);
  }, [employerJobs, jobId, addToShortlist, refetchShortlistStatus]);

  // Handle shortlist dialog close
  const handleShortlistDialogClose = useCallback(() => {
    setShortlistDialogOpen(false);
    setShortlistCandidate(null);
    refetchShortlistStatus();
  }, [refetchShortlistStatus]);

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
          onShortlist={handleShortlist}
          isShortlistedFn={isShortlistedFn}
          getShortlistedRolesFn={getShortlistedRolesFn}
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

      {/* Shortlist Dialog */}
      <AddToShortlistDialog
        isOpen={shortlistDialogOpen}
        onClose={handleShortlistDialogClose}
        candidateId={shortlistCandidate?.userId || shortlistCandidate?.id || ""}
        candidateName={shortlistCandidate?.name}
        defaultJobId={jobId}
      />
    </div>
  );
};

export default EmployerSwipe;
