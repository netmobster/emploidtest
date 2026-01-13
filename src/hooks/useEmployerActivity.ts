import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Activity {
  id: string;
  matchId?: string;
  candidateId?: string;
  type: "match" | "message" | "like" | "super_like";
  description: string;
  timestamp: string;
  user?: {
    name: string;
    avatar?: string;
  };
}

interface UseEmployerActivityReturn {
  activities: Activity[];
  isLoading: boolean;
}

export function useEmployerActivity(): UseEmployerActivityReturn {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const fetchActivity = async () => {
      try {
        // Fetch recent matches with candidate profiles
        const { data: matchesData } = await supabase
          .from("matches")
          .select("id, matched_at, candidate_id")
          .eq("employer_id", user.id)
          .order("matched_at", { ascending: false })
          .limit(10);

        const activityList: Activity[] = [];

        // Process matches and get candidate info
        if (matchesData) {
          for (const match of matchesData) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("full_name, avatar_url")
              .eq("user_id", match.candidate_id)
              .maybeSingle();

            activityList.push({
              id: `match-${match.id}`,
              matchId: match.id,
              candidateId: match.candidate_id,
              type: "match",
              description: `New match with ${profile?.full_name || "a candidate"}`,
              timestamp: match.matched_at,
              user: profile ? {
                name: profile.full_name || "Unknown",
                avatar: profile.avatar_url || undefined,
              } : undefined,
            });
          }
        }

        // Sort by timestamp
        activityList.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        setActivities(activityList.slice(0, 5));
      } catch (error) {
        console.error("Error fetching activity:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivity();
  }, [user]);

  return { activities, isLoading };
}