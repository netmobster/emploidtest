import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface PresenceState {
  isOnline: boolean;
  isTyping: boolean;
  lastSeen?: string;
}

interface PresencePayload {
  user_id: string;
  is_typing: boolean;
  online_at: string;
}

export const useChatPresence = (matchId: string) => {
  const { user } = useAuth();
  const [otherUserPresence, setOtherUserPresence] = useState<PresenceState>({
    isOnline: false,
    isTyping: false,
  });
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!matchId || !user) return;

    const channel = supabase.channel(`chat-presence-${matchId}`);
    channelRef.current = channel;

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        
        // Find the other user's presence
        Object.entries(state).forEach(([, presences]) => {
          const presenceArray = presences as unknown as PresencePayload[];
          presenceArray.forEach((presence) => {
            if (presence.user_id !== user.id) {
              setOtherUserPresence({
                isOnline: true,
                isTyping: presence.is_typing || false,
              });
            }
          });
        });
      })
      .on("presence", { event: "join" }, ({ newPresences }) => {
        (newPresences as unknown as PresencePayload[]).forEach((presence) => {
          if (presence.user_id !== user.id) {
            setOtherUserPresence((prev) => ({
              ...prev,
              isOnline: true,
              isTyping: presence.is_typing || false,
            }));
          }
        });
      })
      .on("presence", { event: "leave" }, ({ leftPresences }) => {
        (leftPresences as unknown as PresencePayload[]).forEach((presence) => {
          if (presence.user_id !== user.id) {
            setOtherUserPresence({
              isOnline: false,
              isTyping: false,
              lastSeen: new Date().toISOString(),
            });
          }
        });
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            user_id: user.id,
            is_typing: false,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      supabase.removeChannel(channel);
    };
  }, [matchId, user]);

  const setTyping = useCallback(
    async (isTyping: boolean) => {
      if (!channelRef.current || !user) return;

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      await channelRef.current.track({
        user_id: user.id,
        is_typing: isTyping,
        online_at: new Date().toISOString(),
      });

      // Auto-clear typing after 3 seconds
      if (isTyping) {
        typingTimeoutRef.current = setTimeout(() => {
          channelRef.current?.track({
            user_id: user.id,
            is_typing: false,
            online_at: new Date().toISOString(),
          });
        }, 3000);
      }
    },
    [user]
  );

  return {
    isOtherUserOnline: otherUserPresence.isOnline,
    isOtherUserTyping: otherUserPresence.isTyping,
    lastSeen: otherUserPresence.lastSeen,
    setTyping,
  };
};
