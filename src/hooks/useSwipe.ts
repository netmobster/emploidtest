import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface SwipeResult {
  swipeId: string;
  isMatch: boolean;
  matchId?: string;
}

export const useSwipe = (jobId?: string) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [latestMatch, setLatestMatch] = useState<{
    matchId: string;
    matchedUserId: string;
  } | null>(null);

  // Subscribe to new matches
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("matches-channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "matches",
          filter: `employer_id=eq.${user.id}`,
        },
        (payload) => {
          const match = payload.new as any;
          setLatestMatch({
            matchId: match.id,
            matchedUserId: match.candidate_id,
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "matches",
          filter: `candidate_id=eq.${user.id}`,
        },
        (payload) => {
          const match = payload.new as any;
          setLatestMatch({
            matchId: match.id,
            matchedUserId: match.employer_id,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const recordSwipe = useCallback(
    async (
      swipedUserId: string,
      direction: "like" | "pass" | "super_like"
    ): Promise<SwipeResult | null> => {
      if (!user) {
        toast.error("You must be logged in to swipe");
        return null;
      }

      setIsLoading(true);

      try {
        // Record the swipe
        const { data: swipe, error: swipeError } = await supabase
          .from("swipes")
          .insert({
            swiper_id: user.id,
            swiped_id: swipedUserId,
            job_id: jobId || null,
            direction,
          })
          .select()
          .single();

        if (swipeError) {
          // Handle duplicate swipe
          if (swipeError.code === "23505") {
            toast.error("You've already swiped on this profile");
            return null;
          }
          throw swipeError;
        }

        // Check if a match was created (by the trigger)
        const { data: match } = await supabase
          .from("matches")
          .select("id")
          .or(`employer_id.eq.${user.id},candidate_id.eq.${user.id}`)
          .or(`employer_id.eq.${swipedUserId},candidate_id.eq.${swipedUserId}`)
          .order("matched_at", { ascending: false })
          .limit(1)
          .single();

        const isMatch = !!match;

        if (isMatch) {
          setLatestMatch({
            matchId: match.id,
            matchedUserId: swipedUserId,
          });
        }

        return {
          swipeId: swipe.id,
          isMatch,
          matchId: match?.id,
        };
      } catch (error: any) {
        console.error("Error recording swipe:", error);
        toast.error("Failed to record swipe");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [user, jobId]
  );

  const clearLatestMatch = useCallback(() => {
    setLatestMatch(null);
  }, []);

  return {
    recordSwipe,
    isLoading,
    latestMatch,
    clearLatestMatch,
  };
};
