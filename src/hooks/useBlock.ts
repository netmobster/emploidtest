import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const useBlock = () => {
  const { user } = useAuth();
  const [isBlocking, setIsBlocking] = useState(false);
  const [blockedUserIds, setBlockedUserIds] = useState<string[]>([]);

  // Fetch blocked users on mount
  useEffect(() => {
    if (!user) return;

    const fetchBlockedUsers = async () => {
      const { data, error } = await supabase
        .from("blocked_users")
        .select("blocked_id")
        .eq("blocker_id", user.id);

      if (!error && data) {
        setBlockedUserIds(data.map((b) => b.blocked_id));
      }
    };

    fetchBlockedUsers();
  }, [user]);

  const blockUser = async (
    blockedId: string,
    matchId?: string
  ): Promise<boolean> => {
    if (!user) return false;

    setIsBlocking(true);
    try {
      // Insert block record
      const { error: blockError } = await supabase
        .from("blocked_users")
        .insert({
          blocker_id: user.id,
          blocked_id: blockedId,
        });

      if (blockError) throw blockError;

      // Also unmatch if there's an active match
      if (matchId) {
        await supabase
          .from("matches")
          .update({ status: "unmatched" })
          .eq("id", matchId);
      }

      setBlockedUserIds((prev) => [...prev, blockedId]);
      toast.success("User blocked");
      return true;
    } catch (error) {
      console.error("Error blocking user:", error);
      toast.error("Failed to block user");
      return false;
    } finally {
      setIsBlocking(false);
    }
  };

  const unblockUser = async (blockedId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("blocked_users")
        .delete()
        .eq("blocker_id", user.id)
        .eq("blocked_id", blockedId);

      if (error) throw error;

      setBlockedUserIds((prev) => prev.filter((id) => id !== blockedId));
      toast.success("User unblocked");
      return true;
    } catch (error) {
      console.error("Error unblocking user:", error);
      toast.error("Failed to unblock user");
      return false;
    }
  };

  const isBlocked = (userId: string) => blockedUserIds.includes(userId);

  return {
    blockUser,
    unblockUser,
    isBlocking,
    blockedUserIds,
    isBlocked,
  };
};
