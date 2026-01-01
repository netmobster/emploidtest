import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Message {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  read_at: string | null;
  created_at: string;
}

export const useChat = (matchId: string) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  // Fetch messages
  useEffect(() => {
    if (!matchId || !user) return;

    const fetchMessages = async () => {
      setIsLoading(true);
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
        console.error("Error fetching messages:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`chat-${matchId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages((prev) => [...prev, newMessage]);

          // Mark as read if not sender
          if (newMessage.sender_id !== user.id) {
            supabase
              .from("messages")
              .update({ read_at: new Date().toISOString() })
              .eq("id", newMessage.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
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
        console.error("Error sending message:", error);
        toast.error("Failed to send message");
        return false;
      } finally {
        setIsSending(false);
      }
    },
    [user, matchId]
  );

  return {
    messages,
    isLoading,
    isSending,
    sendMessage,
  };
};
