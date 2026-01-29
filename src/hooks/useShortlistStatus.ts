import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ShortlistEntry {
  jobId: string;
  jobTitle: string;
}

export type ShortlistMap = Map<string, ShortlistEntry[]>;

export const useShortlistStatus = () => {
  const { user, profile } = useAuth();
  const [shortlistMap, setShortlistMap] = useState<ShortlistMap>(new Map());
  const [isLoading, setIsLoading] = useState(false);

  const fetchShortlistStatus = useCallback(async () => {
    if (!user || profile?.user_type !== "employer") {
      setShortlistMap(new Map());
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("shortlists")
        .select(`
          candidate_id,
          job_id,
          jobs:job_id (title)
        `)
        .eq("employer_id", user.id);

      if (error) throw error;

      const map = new Map<string, ShortlistEntry[]>();
      
      data?.forEach((entry) => {
        const candidateId = entry.candidate_id;
        const jobTitle = (entry.jobs as { title: string } | null)?.title || "Unknown Role";
        
        const existing = map.get(candidateId) || [];
        existing.push({
          jobId: entry.job_id,
          jobTitle,
        });
        map.set(candidateId, existing);
      });

      setShortlistMap(map);
    } catch (error) {
      console.error("Error fetching shortlist status:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user, profile?.user_type]);

  useEffect(() => {
    fetchShortlistStatus();
  }, [fetchShortlistStatus]);

  const isShortlisted = useCallback(
    (candidateId: string): boolean => {
      return shortlistMap.has(candidateId);
    },
    [shortlistMap]
  );

  const getShortlistsForCandidate = useCallback(
    (candidateId: string): ShortlistEntry[] => {
      return shortlistMap.get(candidateId) || [];
    },
    [shortlistMap]
  );

  return {
    shortlistMap,
    isShortlisted,
    getShortlistsForCandidate,
    isLoading,
    refetch: fetchShortlistStatus,
  };
};
