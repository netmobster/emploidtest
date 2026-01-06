import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface CandidateStats {
  savedJobs: number;
  totalMatches: number;
  jobsViewed: number;
  matchRate: number;
  isLoading: boolean;
}

export function useCandidateStats(): CandidateStats {
  const { user } = useAuth();
  const [stats, setStats] = useState<Omit<CandidateStats, 'isLoading'>>({
    savedJobs: 0,
    totalMatches: 0,
    jobsViewed: 0,
    matchRate: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        // Fetch saved jobs count
        const { count: savedCount } = await supabase
          .from("saved_jobs")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id);

        // Fetch total matches
        const { count: matchesCount } = await supabase
          .from("matches")
          .select("*", { count: "exact", head: true })
          .eq("candidate_id", user.id);

        // Fetch total swipes (jobs viewed/liked)
        const { count: swipesCount } = await supabase
          .from("swipes")
          .select("*", { count: "exact", head: true })
          .eq("swiper_id", user.id);

        const saved = savedCount ?? 0;
        const matches = matchesCount ?? 0;
        const viewed = swipesCount ?? 0;

        // Calculate match rate (matches / total likes * 100)
        const { count: likesCount } = await supabase
          .from("swipes")
          .select("*", { count: "exact", head: true })
          .eq("swiper_id", user.id)
          .in("direction", ["like", "super_like"]);

        const likes = likesCount ?? 0;
        const matchRate = likes > 0 ? Math.round((matches / likes) * 100) : 0;

        setStats({
          savedJobs: saved,
          totalMatches: matches,
          jobsViewed: viewed,
          matchRate,
        });
      } catch (error) {
        console.error("Error fetching candidate stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  return { ...stats, isLoading };
}
