import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { RealtimeChannel } from "@supabase/supabase-js";

interface Message {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  read_at: string | null;
  created_at: string;
}

type ChannelStatus = "connecting" | "connected" | "disconnected" | "error";

const FALLBACK_REFRESH_INTERVAL = 30000; // 30 seconds
const RECONNECT_DELAY = 3000; // 3 seconds

export const useChat = (matchId: string) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [channelStatus, setChannelStatus] = useState<ChannelStatus>("connecting");

  const channelRef = useRef<RealtimeChannel | null>(null);
  const fallbackIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    if (!matchId || !user) return;

    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("match_id", matchId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(data || []);

      // Mark unread messages as read
      await supabase
        .from("messages")
        .update({ read_at: new Date().toISOString() })
        .eq("match_id", matchId)
        .neq("sender_id", user.id)
        .is("read_at", null);
    } catch (error) {
      console.error("[useChat] Error fetching messages:", error);
    }
  }, [matchId, user]);

  // Start fallback polling
  const startFallbackPolling = useCallback(() => {
    if (fallbackIntervalRef.current) return;

    console.log("[useChat] Starting fallback polling");
    fallbackIntervalRef.current = setInterval(() => {
      console.log("[useChat] Fallback refresh triggered");
      fetchMessages();
    }, FALLBACK_REFRESH_INTERVAL);
  }, [fetchMessages]);

  // Schedule reconnection
  const scheduleReconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    reconnectTimeoutRef.current = setTimeout(() => {
      console.log("[useChat] Attempting reconnection...");
      setupSubscription();
    }, RECONNECT_DELAY);
  }, []);

  // Setup realtime subscription
  const setupSubscription = useCallback(() => {
    if (!matchId || !user) return;

    // Clean up existing
    if (channelRef.current) {
      console.log("[useChat] Removing existing channel");
      supabase.removeChannel(channelRef.current);
    }

    console.log("[useChat] Setting up realtime subscription for match:", matchId);
    setChannelStatus("connecting");

    const channel = supabase
      .channel(`chat-${matchId}-${Date.now()}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          console.log("[useChat] New message via realtime:", payload.new);
          const newMessage = payload.new as Message;
          
          setMessages((prev) => {
            // Avoid duplicates
            if (prev.some(m => m.id === newMessage.id)) {
              return prev;
            }
            return [...prev, newMessage];
          });

          // Mark as read if not sender
          if (newMessage.sender_id !== user.id) {
            supabase
              .from("messages")
              .update({ read_at: new Date().toISOString() })
              .eq("id", newMessage.id);
          }
        }
      )
      .subscribe((status, err) => {
        console.log("[useChat] Channel status:", status, err);

        switch (status) {
          case "SUBSCRIBED":
            setChannelStatus("connected");
            // Clear fallback when connected
            if (fallbackIntervalRef.current) {
              clearInterval(fallbackIntervalRef.current);
              fallbackIntervalRef.current = null;
            }
            break;
          case "CHANNEL_ERROR":
          case "TIMED_OUT":
            console.warn("[useChat] Channel error, starting fallback");
            setChannelStatus("error");
            startFallbackPolling();
            scheduleReconnect();
            break;
          case "CLOSED":
            console.warn("[useChat] Channel closed, starting fallback");
            setChannelStatus("disconnected");
            startFallbackPolling();
            scheduleReconnect();
            break;
        }
      });

    channelRef.current = channel;
  }, [matchId, user, startFallbackPolling, scheduleReconnect]);

  // Initial setup
  useEffect(() => {
    if (!matchId || !user) return;

    const init = async () => {
      setIsLoading(true);
      await fetchMessages();
      setIsLoading(false);
      setupSubscription();
    };

    init();

    return () => {
      console.log("[useChat] Cleanup");
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      if (fallbackIntervalRef.current) {
        clearInterval(fallbackIntervalRef.current);
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [matchId, user]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!user || !matchId || !content.trim()) return false;

      setIsSending(true);
      try {
        const { error } = await supabase.from("messages").insert({
          match_id: matchId,
          sender_id: user.id,
          content: content.trim(),
        });

        if (error) throw error;
        return true;
      } catch (error) {
        console.error("[useChat] Error sending message:", error);
        toast.error("Failed to send message");
        return false;
      } finally {
        setIsSending(false);
      }
    },
    [user, matchId]
  );

  // Manual refresh function
  const refresh = useCallback(() => {
    fetchMessages();
  }, [fetchMessages]);

  return {
    messages,
    isLoading,
    isSending,
    sendMessage,
    channelStatus,
    refresh,
  };
};
