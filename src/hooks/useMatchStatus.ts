import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface MatchInfo {
  isMatched: boolean;
  matchId: string | null;
  jobId: string | null;
}

export function useMatchStatus(otherUserId?: string) {
  const { user, profile } = useAuth();
  const [matchInfo, setMatchInfo] = useState<MatchInfo>({
    isMatched: false,
    matchId: null,
    jobId: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  const checkMatchStatus = useCallback(async () => {
    if (!user?.id || !otherUserId) {
      setIsLoading(false);
      return;
    }

    try {
      // Check if there's an active match between the two users
      const { data, error } = await supabase
        .from("matches")
        .select("id, job_id, status")
        .or(
          `and(employer_id.eq.${user.id},candidate_id.eq.${otherUserId}),and(employer_id.eq.${otherUserId},candidate_id.eq.${user.id})`
        )
        .eq("status", "active")
        .maybeSingle();

      if (error) throw error;

      setMatchInfo({
        isMatched: !!data,
        matchId: data?.id || null,
        jobId: data?.job_id || null,
      });
    } catch (error) {
      console.error("Error checking match status:", error);
      setMatchInfo({ isMatched: false, matchId: null, jobId: null });
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, otherUserId]);

  useEffect(() => {
    checkMatchStatus();
  }, [checkMatchStatus]);

  return {
    ...matchInfo,
    isLoading,
    refetch: checkMatchStatus,
  };
}

export function useMatchStatusByEmployer(employerId?: string) {
  const { user } = useAuth();
  const [isMatched, setIsMatched] = useState(false);
  const [matchId, setMatchId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkMatch = async () => {
      if (!user?.id || !employerId) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("matches")
          .select("id")
          .eq("employer_id", employerId)
          .eq("candidate_id", user.id)
          .eq("status", "active")
          .maybeSingle();

        if (error) throw error;

        setIsMatched(!!data);
        setMatchId(data?.id || null);
      } catch (error) {
        console.error("Error checking match status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkMatch();
  }, [user?.id, employerId]);

  return { isMatched, matchId, isLoading };
}
