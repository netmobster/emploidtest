import { useState, useCallback, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useJobApplication } from "./useJobApplication";
import { useToastNotifications } from "./useToastNotifications";

interface SwipeResult {
  swipeId: string;
  isMatch: boolean;
  matchId?: string;
}

const MATCH_POLL_ATTEMPTS = 3;
const MATCH_POLL_DELAY_MS = 300;

export const useSwipe = (jobId?: string) => {
  const { user, profile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [latestMatch, setLatestMatch] = useState<{
    matchId: string;
    matchedUserId: string;
  } | null>(null);
  const { createApplication } = useJobApplication();
  const { showToast } = useToastNotifications();
  const swipeCountRef = useRef(0);

  // Subscribe to new matches
  useEffect(() => {
    if (!user) return;

    console.log("[useSwipe] Setting up realtime subscription for user:", user.id);

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
          console.log("[useSwipe] Realtime match detected (employer):", payload.new);
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
          console.log("[useSwipe] Realtime match detected (candidate):", payload.new);
          const match = payload.new as any;
          setLatestMatch({
            matchId: match.id,
            matchedUserId: match.employer_id,
          });
        }
      )
      .subscribe((status) => {
        console.log("[useSwipe] Realtime subscription status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Helper: poll for match with retries
  const pollForMatch = useCallback(
    async (swipedUserId: string): Promise<{ id: string } | null> => {
      for (let attempt = 1; attempt <= MATCH_POLL_ATTEMPTS; attempt++) {
        console.log(`[useSwipe] Polling for match, attempt ${attempt}/${MATCH_POLL_ATTEMPTS}`);
        
        const { data: match, error } = await supabase
          .from("matches")
          .select("id")
          .or(
            `and(employer_id.eq.${user!.id},candidate_id.eq.${swipedUserId}),and(employer_id.eq.${swipedUserId},candidate_id.eq.${user!.id})`
          )
          .order("matched_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error("[useSwipe] Poll error:", error);
        }

        if (match) {
          console.log("[useSwipe] Match found on attempt", attempt, ":", match);
          return match;
        }

        if (attempt < MATCH_POLL_ATTEMPTS) {
          await new Promise((resolve) => setTimeout(resolve, MATCH_POLL_DELAY_MS));
        }
      }

      console.log("[useSwipe] No match found after polling");
      return null;
    },
    [user]
  );

  const recordSwipe = useCallback(
    async (
      swipedUserId: string,
      direction: "like" | "pass" | "super_like"
    ): Promise<SwipeResult | null> => {
      if (!user) {
        toast.error("You must be logged in to swipe");
        return null;
      }

      const swipeNum = ++swipeCountRef.current;
      console.log(`[useSwipe] #${swipeNum} Recording swipe:`, { swipedUserId, direction, jobId });

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
            console.warn(`[useSwipe] #${swipeNum} Duplicate swipe detected`);
            toast.error("You've already swiped on this profile");
            return null;
          }
          throw swipeError;
        }

        console.log(`[useSwipe] #${swipeNum} Swipe recorded:`, swipe.id);

        // Poll for match with retries (trigger may have slight delay)
        const match = await pollForMatch(swipedUserId);
        const isMatch = !!match;

        console.log(`[useSwipe] #${swipeNum} Match result:`, { isMatch, matchId: match?.id });

        if (isMatch && match) {
          setLatestMatch({
            matchId: match.id,
            matchedUserId: swipedUserId,
          });

          // Auto-create job application for candidates when match is created
          if (profile?.user_type === "candidate" && jobId) {
            await createApplication({
              jobId,
              matchId: match.id,
              status: "applied",
            });
          }
        }

        // Show appropriate toast based on swipe direction
        if (isMatch) {
          showToast("new_match");
        } else if (direction === "super_like") {
          toast.success("Super Like sent! ⭐", { duration: 2000 });
        } else if (direction === "like") {
          toast.success("Like sent! 💚", { duration: 1500 });
        }

        return {
          swipeId: swipe.id,
          isMatch,
          matchId: match?.id,
        };
      } catch (error: any) {
        console.error(`[useSwipe] #${swipeNum} Error recording swipe:`, error);
        toast.error("Failed to record swipe");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, jobId, showToast, pollForMatch]
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
