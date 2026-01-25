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

interface UseChatRealtimeOptions {
  matchId: string;
  onNewMessage?: (message: Message) => void;
}

type ChannelStatus = "connecting" | "connected" | "disconnected" | "error";

const FALLBACK_REFRESH_INTERVAL = 30000; // 30 seconds fallback refresh
const RECONNECT_DELAY = 3000; // 3 seconds delay before reconnecting

export const useChatRealtime = ({ matchId, onNewMessage }: UseChatRealtimeOptions) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [channelStatus, setChannelStatus] = useState<ChannelStatus>("connecting");
  
  const channelRef = useRef<RealtimeChannel | null>(null);
  const fallbackIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch messages from database
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
      console.error("[useChatRealtime] Error fetching messages:", error);
    }
  }, [matchId, user]);

  // Subscribe to realtime updates
  const subscribe = useCallback(() => {
    if (!matchId || !user) return;

    // Clean up existing subscription
    if (channelRef.current) {
      console.log("[useChatRealtime] Removing existing channel");
      supabase.removeChannel(channelRef.current);
    }

    console.log("[useChatRealtime] Setting up realtime subscription for match:", matchId);
    setChannelStatus("connecting");

    const channel = supabase
      .channel(`chat-realtime-${matchId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          console.log("[useChatRealtime] New message received:", payload.new);
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
            
            onNewMessage?.(newMessage);
          }
        }
      )
      .subscribe((status, err) => {
        console.log("[useChatRealtime] Channel status:", status, err);
        
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
            setChannelStatus("error");
            startFallbackPolling();
            scheduleReconnect();
            break;
          case "CLOSED":
            setChannelStatus("disconnected");
            startFallbackPolling();
            scheduleReconnect();
            break;
        }
      });

    channelRef.current = channel;
  }, [matchId, user, onNewMessage, fetchMessages]);

  // Start fallback polling when realtime fails
  const startFallbackPolling = useCallback(() => {
    if (fallbackIntervalRef.current) return;
    
    console.log("[useChatRealtime] Starting fallback polling");
    fallbackIntervalRef.current = setInterval(() => {
      console.log("[useChatRealtime] Fallback refresh triggered");
      fetchMessages();
    }, FALLBACK_REFRESH_INTERVAL);
  }, [fetchMessages]);

  // Schedule reconnection attempt
  const scheduleReconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    reconnectTimeoutRef.current = setTimeout(() => {
      console.log("[useChatRealtime] Attempting reconnection");
      subscribe();
    }, RECONNECT_DELAY);
  }, [subscribe]);

  // Send a message
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
        console.error("[useChatRealtime] Error sending message:", error);
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

  // Initial fetch and subscription
  useEffect(() => {
    if (!matchId || !user) return;

    const init = async () => {
      setIsLoading(true);
      await fetchMessages();
      setIsLoading(false);
      subscribe();
    };

    init();

    return () => {
      console.log("[useChatRealtime] Cleanup");
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

  return {
    messages,
    isLoading,
    isSending,
    sendMessage,
    channelStatus,
    refresh,
  };
};
