import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface EmployerStats {
  totalJobs: number;
  totalMatches: number;
  totalSwipes: number;
  matchRate: number;
  isLoading: boolean;
}

export function useEmployerStats(): EmployerStats {
  const { user } = useAuth();
  const [stats, setStats] = useState<Omit<EmployerStats, 'isLoading'>>({
    totalJobs: 0,
    totalMatches: 0,
    totalSwipes: 0,
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
        // Fetch total jobs
        const { count: jobsCount } = await supabase
          .from("jobs")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id);

        // Fetch total matches
        const { count: matchesCount } = await supabase
          .from("matches")
          .select("*", { count: "exact", head: true })
          .eq("employer_id", user.id);

        // Fetch total swipes (likes and super_likes)
        const { count: swipesCount } = await supabase
          .from("swipes")
          .select("*", { count: "exact", head: true })
          .eq("swiper_id", user.id)
          .in("direction", ["like", "super_like"]);

        const jobs = jobsCount ?? 0;
        const matches = matchesCount ?? 0;
        const swipes = swipesCount ?? 0;

        // Calculate match rate (matches / total likes * 100)
        const matchRate = swipes > 0 ? Math.round((matches / swipes) * 100) : 0;

        setStats({
          totalJobs: jobs,
          totalMatches: matches,
          totalSwipes: swipes,
          matchRate,
        });
      } catch (error) {
        console.error("Error fetching employer stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  return { ...stats, isLoading };
}