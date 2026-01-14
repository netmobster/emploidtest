import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Hook to batch check match statuses for multiple user IDs
 * Returns a function to check if a specific ID is matched
 */
export function useBatchMatchStatus(userIds: string[]) {
  const { user, profile } = useAuth();
  const [matchedIds, setMatchedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  const fetchMatchStatuses = useCallback(async () => {
    if (!user?.id || userIds.length === 0) {
      setIsLoading(false);
      return;
    }

    try {
      // Fetch all active matches for the current user
      const { data: matches, error } = await supabase
        .from("matches")
        .select("employer_id, candidate_id")
        .eq("status", "active")
        .or(`employer_id.eq.${user.id},candidate_id.eq.${user.id}`);

      if (error) throw error;

      // Build a set of matched user IDs
      const matched = new Set<string>();
      matches?.forEach((match) => {
        // Add the "other" user in each match
        if (match.employer_id === user.id) {
          matched.add(match.candidate_id);
        } else {
          matched.add(match.employer_id);
        }
      });

      // Filter to only the IDs we care about
      const relevantMatched = new Set(
        userIds.filter((id) => matched.has(id))
      );

      setMatchedIds(relevantMatched);
    } catch (error) {
      console.error("Error fetching batch match statuses:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, userIds.join(",")]);

  useEffect(() => {
    fetchMatchStatuses();
  }, [fetchMatchStatuses]);

  // Function to check if a specific ID is matched
  const isMatched = useCallback(
    (id: string) => matchedIds.has(id),
    [matchedIds]
  );

  return {
    isMatched,
    matchedIds,
    isLoading,
    refetch: fetchMatchStatuses,
  };
}
