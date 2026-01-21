import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface ActivityDigest {
  // Employer metrics
  newCandidatesInCities: number;
  newCandidatesMatchingRoles: number;
  newMatches: number;
  unreadMessages: number;
  profileViews: number;
  pendingInterviews: number;
  
  // Candidate metrics
  newJobsMatchingProfile: number;
  employersViewedProfile: number;
  newJobsInCities: number;
  
  // Common
  lastLoginAt: Date | null;
  previousLoginAt: Date | null;
  daysSinceLastLogin: number;
  isFirstLogin: boolean;
}

const DEFAULT_DIGEST: ActivityDigest = {
  newCandidatesInCities: 0,
  newCandidatesMatchingRoles: 0,
  newMatches: 0,
  unreadMessages: 0,
  profileViews: 0,
  pendingInterviews: 0,
  newJobsMatchingProfile: 0,
  employersViewedProfile: 0,
  newJobsInCities: 0,
  lastLoginAt: null,
  previousLoginAt: null,
  daysSinceLastLogin: 0,
  isFirstLogin: true,
};

export function useActivityDigest() {
  const { user, profile } = useAuth();
  const [digest, setDigest] = useState<ActivityDigest>(DEFAULT_DIGEST);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDigest = useCallback(async () => {
    if (!user || !profile) {
      setDigest(DEFAULT_DIGEST);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Get current profile with login timestamps
      const { data: currentProfile } = await supabase
        .from("profiles")
        .select("last_login_at, previous_login_at")
        .eq("user_id", user.id)
        .single();

      const lastLoginAt = currentProfile?.previous_login_at 
        ? new Date(currentProfile.previous_login_at) 
        : null;
      
      const previousLoginAt = currentProfile?.last_login_at 
        ? new Date(currentProfile.last_login_at) 
        : null;

      const sinceDate = lastLoginAt || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // Default to 7 days ago
      const sinceDateISO = sinceDate.toISOString();

      const daysSinceLastLogin = lastLoginAt 
        ? Math.floor((Date.now() - lastLoginAt.getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      if (profile.user_type === "employer") {
        // Employer digest
        const [
          matchesResult,
          messagesResult,
          interviewsResult,
          jobsResult,
        ] = await Promise.all([
          // New matches since last login
          supabase
            .from("matches")
            .select("id", { count: "exact" })
            .eq("employer_id", user.id)
            .gte("matched_at", sinceDateISO),
          
          // Unread messages
          supabase
            .from("messages")
            .select("id, match_id", { count: "exact" })
            .is("read_at", null)
            .neq("sender_id", user.id)
            .in("match_id", (
              await supabase
                .from("matches")
                .select("id")
                .eq("employer_id", user.id)
            ).data?.map(m => m.id) || []),
          
          // Pending interviews
          supabase
            .from("interviews")
            .select("id", { count: "exact" })
            .eq("employer_id", user.id)
            .eq("status", "pending"),
          
          // Get employer's jobs for role matching
          supabase
            .from("jobs")
            .select("role_id, city_id")
            .eq("user_id", user.id),
        ]);

        const jobs = jobsResult.data || [];
        const roleIds = [...new Set(jobs.map(j => j.role_id))];
        const cityIds = [...new Set(jobs.map(j => j.city_id))];

        // New candidates matching roles (via swipes with those role/city combos)
        // This is a simplified version - in production you'd have a candidates table
        let newCandidatesCount = 0;
        if (roleIds.length > 0) {
          const { count } = await supabase
            .from("profiles")
            .select("id", { count: "exact" })
            .eq("user_type", "candidate")
            .gte("created_at", sinceDateISO);
          
          newCandidatesCount = count || 0;
        }

        setDigest({
          ...DEFAULT_DIGEST,
          newMatches: matchesResult.count || 0,
          unreadMessages: messagesResult.count || 0,
          pendingInterviews: interviewsResult.count || 0,
          newCandidatesMatchingRoles: newCandidatesCount,
          newCandidatesInCities: newCandidatesCount, // Same for now
          lastLoginAt,
          previousLoginAt,
          daysSinceLastLogin,
          isFirstLogin: !lastLoginAt,
        });
      } else {
        // Candidate digest
        const [
          matchesResult,
          messagesResult,
          interviewsResult,
          newJobsResult,
        ] = await Promise.all([
          // New matches since last login
          supabase
            .from("matches")
            .select("id", { count: "exact" })
            .eq("candidate_id", user.id)
            .gte("matched_at", sinceDateISO),
          
          // Unread messages
          supabase
            .from("messages")
            .select("id, match_id", { count: "exact" })
            .is("read_at", null)
            .neq("sender_id", user.id)
            .in("match_id", (
              await supabase
                .from("matches")
                .select("id")
                .eq("candidate_id", user.id)
            ).data?.map(m => m.id) || []),
          
          // Pending interviews
          supabase
            .from("interviews")
            .select("id", { count: "exact" })
            .eq("candidate_id", user.id)
            .in("status", ["pending", "confirmed"]),
          
          // New jobs since last login
          supabase
            .from("jobs")
            .select("id", { count: "exact" })
            .gte("created_at", sinceDateISO),
        ]);

        setDigest({
          ...DEFAULT_DIGEST,
          newMatches: matchesResult.count || 0,
          unreadMessages: messagesResult.count || 0,
          pendingInterviews: interviewsResult.count || 0,
          newJobsMatchingProfile: newJobsResult.count || 0,
          newJobsInCities: newJobsResult.count || 0,
          lastLoginAt,
          previousLoginAt,
          daysSinceLastLogin,
          isFirstLogin: !lastLoginAt,
        });
      }
    } catch (error) {
      console.error("Error fetching activity digest:", error);
      setDigest(DEFAULT_DIGEST);
    } finally {
      setIsLoading(false);
    }
  }, [user, profile]);

  // Update login timestamps on mount
  useEffect(() => {
    const updateLoginTimestamp = async () => {
      if (!user) return;

      try {
        // Get current last_login_at
        const { data: currentProfile } = await supabase
          .from("profiles")
          .select("last_login_at")
          .eq("user_id", user.id)
          .single();

        // Move current last_login_at to previous_login_at, set new last_login_at
        await supabase
          .from("profiles")
          .update({
            previous_login_at: currentProfile?.last_login_at || null,
            last_login_at: new Date().toISOString(),
          })
          .eq("user_id", user.id);
      } catch (error) {
        console.error("Error updating login timestamp:", error);
      }
    };

    if (user && profile) {
      updateLoginTimestamp();
      fetchDigest();
    }
  }, [user?.id, profile?.user_type]);

  return {
    digest,
    isLoading,
    refresh: fetchDigest,
  };
}
