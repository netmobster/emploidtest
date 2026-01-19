import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface SidebarCounts {
  unreadMatches: number;
  unreadMessages: number;
  totalMatches: number;
}

export const useSidebarCounts = () => {
  const { user, profile } = useAuth();
  const [counts, setCounts] = useState<SidebarCounts>({
    unreadMatches: 0,
    unreadMessages: 0,
    totalMatches: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || !profile) {
      setCounts({ unreadMatches: 0, unreadMessages: 0, totalMatches: 0 });
      setIsLoading(false);
      return;
    }

    const fetchCounts = async () => {
      setIsLoading(true);
      try {
        const isEmployer = profile.user_type === "employer";
        const userIdField = isEmployer ? "employer_id" : "candidate_id";

        // Get all active matches
        const { data: matches } = await supabase
          .from("matches")
          .select("id")
          .eq(userIdField, user.id)
          .eq("status", "active");

        const matchIds = matches?.map((m) => m.id) || [];
        const totalMatches = matchIds.length;

        if (matchIds.length === 0) {
          setCounts({ unreadMatches: 0, unreadMessages: 0, totalMatches: 0 });
          setIsLoading(false);
          return;
        }

        // Get unread message count
        const { data: unreadMessages } = await supabase
          .from("messages")
          .select("id, match_id")
          .in("match_id", matchIds)
          .neq("sender_id", user.id)
          .is("read_at", null);

        // Count unique matches with unread messages
        const matchesWithUnread = new Set(unreadMessages?.map((m) => m.match_id) || []);
        
        setCounts({
          unreadMatches: matchesWithUnread.size,
          unreadMessages: unreadMessages?.length || 0,
          totalMatches,
        });
      } catch (error) {
        console.error("Error fetching sidebar counts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCounts();

    // Subscribe to new messages
    const channel = supabase
      .channel(`sidebar-counts-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        () => {
          fetchCounts();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
        },
        () => {
          fetchCounts();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "matches",
        },
        () => {
          fetchCounts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, profile]);

  return { counts, isLoading };
};
