import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface PendingLike {
  id: string;
  swiped_id: string;
  direction: "like" | "super_like";
  created_at: string;
  profile: {
    user_id: string;
    full_name: string | null;
    avatar_url: string | null;
    job_title: string | null;
    user_type: string;
  } | null;
}

export const usePendingLikes = () => {
  const { user } = useAuth();
  const [pendingLikes, setPendingLikes] = useState<PendingLike[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setPendingLikes([]);
      setIsLoading(false);
      return;
    }

    const fetchPendingLikes = async () => {
      setIsLoading(true);
      try {
        // Get all likes made by the user
        const { data: swipes, error: swipesError } = await supabase
          .from("swipes")
          .select("id, swiped_id, direction, created_at")
          .eq("swiper_id", user.id)
          .in("direction", ["like", "super_like"])
          .order("created_at", { ascending: false });

        if (swipesError) throw swipesError;

        if (!swipes || swipes.length === 0) {
          setPendingLikes([]);
          setIsLoading(false);
          return;
        }

        // Get all matches for the user
        const { data: matches, error: matchesError } = await supabase
          .from("matches")
          .select("employer_id, candidate_id")
          .or(`employer_id.eq.${user.id},candidate_id.eq.${user.id}`);

        if (matchesError) throw matchesError;

        // Get matched user IDs
        const matchedUserIds = new Set(
          (matches || []).map((m) => 
            m.employer_id === user.id ? m.candidate_id : m.employer_id
          )
        );

        // Filter to only unmatched likes
        const unmatchedSwipes = swipes.filter(
          (s) => !matchedUserIds.has(s.swiped_id)
        );

        if (unmatchedSwipes.length === 0) {
          setPendingLikes([]);
          setIsLoading(false);
          return;
        }

        // Get profiles for pending likes
        const swipedIds = unmatchedSwipes.map((s) => s.swiped_id);
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("user_id, full_name, avatar_url, job_title, user_type")
          .in("user_id", swipedIds);

        if (profilesError) throw profilesError;

        // Map profiles to swipes
        const profileMap = new Map(
          (profiles || []).map((p) => [p.user_id, p])
        );

        const result: PendingLike[] = unmatchedSwipes.map((s) => ({
          id: s.id,
          swiped_id: s.swiped_id,
          direction: s.direction as "like" | "super_like",
          created_at: s.created_at,
          profile: profileMap.get(s.swiped_id) || null,
        }));

        setPendingLikes(result);
      } catch (error) {
        console.error("[usePendingLikes] Error:", error);
        setPendingLikes([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPendingLikes();
  }, [user]);

  return { pendingLikes, isLoading };
};
