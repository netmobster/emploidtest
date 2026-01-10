import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Match {
  id: string;
  employer_id: string;
  candidate_id: string;
  job_id: string | null;
  matched_at: string;
  status?: string;
  other_user?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    user_type: string;
    has_completed_synergy_quiz?: boolean;
    synergy_scores?: Record<string, number>;
  };
  last_message?: {
    content: string;
    created_at: string;
    sender_id: string;
  };
  unread_count?: number;
}

export const useMatches = () => {
  const { user, profile } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || !profile) return;

    const fetchMatches = async () => {
      setIsLoading(true);

      try {
        const isEmployer = profile.user_type === "employer";
        const userIdField = isEmployer ? "employer_id" : "candidate_id";
        const otherIdField = isEmployer ? "candidate_id" : "employer_id";

        // Fetch active matches only (filter out unmatched)
        const { data: matchesData, error } = await supabase
          .from("matches")
          .select("*")
          .eq(userIdField, user.id)
          .or("status.eq.active,status.is.null")
          .order("matched_at", { ascending: false });

        if (error) throw error;

        // Get blocked user IDs to filter them out
        const { data: blockedData } = await supabase
          .from("blocked_users")
          .select("blocked_id")
          .eq("blocker_id", user.id);

        const blockedIds = new Set((blockedData || []).map((b) => b.blocked_id));

        // Fetch other user profiles and last messages, filtering out blocked users
        const enrichedMatches = await Promise.all(
          (matchesData || [])
            .filter((match) => !blockedIds.has(match[otherIdField]))
            .map(async (match) => {
            const otherUserId = match[otherIdField];

            // Get other user's profile
            const { data: otherProfile } = await supabase
              .from("profiles")
              .select("user_id, full_name, avatar_url, user_type, has_completed_synergy_quiz, synergy_scores")
              .eq("user_id", otherUserId)
              .single();

            // Get last message
            const { data: lastMessage } = await supabase
              .from("messages")
              .select("content, created_at, sender_id")
              .eq("match_id", match.id)
              .order("created_at", { ascending: false })
              .limit(1)
              .single();

            // Count unread messages
            const { count: unreadCount } = await supabase
              .from("messages")
              .select("*", { count: "exact", head: true })
              .eq("match_id", match.id)
              .neq("sender_id", user.id)
              .is("read_at", null);

            return {
              ...match,
              other_user: otherProfile
                ? {
                    id: otherProfile.user_id,
                    full_name: otherProfile.full_name || "Unknown",
                    avatar_url: otherProfile.avatar_url,
                    user_type: otherProfile.user_type,
                    has_completed_synergy_quiz: otherProfile.has_completed_synergy_quiz || false,
                    synergy_scores: otherProfile.synergy_scores as Record<string, number> | undefined,
                  }
                : undefined,
              last_message: lastMessage || undefined,
              unread_count: unreadCount || 0,
            };
          })
        );

        setMatches(enrichedMatches);
      } catch (error) {
        console.error("Error fetching matches:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMatches();

    // Subscribe to new matches
    const channel = supabase
      .channel("matches-updates")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "matches",
        },
        () => {
          fetchMatches();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, profile]);

  return { matches, isLoading };
};
