import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (content: string) => Promise<boolean>;
  isSending: boolean;
  isLoading: boolean;
  otherUser?: {
    name: string;
    avatar?: string;
  };
}

const ChatInterface = ({
  messages,
  onSendMessage,
  isSending,
  isLoading,
  otherUser,
}: ChatInterfaceProps) => {
  const { user } = useAuth();
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isSending) return;

    const success = await onSendMessage(inputValue);
    if (success) {
      setInputValue("");
      inputRef.current?.focus();
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" });
    }
  };

  // Group messages by date
  const groupedMessages = messages.reduce((acc, message) => {
    const date = formatDate(message.created_at);
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(message);
    return acc;
  }, {} as Record<string, Message[]>);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center h-full min-h-[200px]">
            <div className="text-center text-muted-foreground">
              <p className="text-lg mb-1">No messages yet</p>
              <p className="text-sm">Say hello to start the conversation!</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedMessages).map(([date, dateMessages]) => (
              <div key={date}>
                {/* Date separator */}
                <div className="flex items-center justify-center mb-4">
                  <span className="text-xs text-muted-foreground bg-secondary px-3 py-1 rounded-full">
                    {date}
                  </span>
                </div>

                {/* Messages for this date */}
                <div className="space-y-2">
                  {dateMessages.map((message, index) => {
                    const isOwn = message.sender_id === user?.id;
                    const showAvatar =
                      !isOwn &&
                      (index === 0 || dateMessages[index - 1].sender_id !== message.sender_id);

                    return (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn("flex items-end gap-2", isOwn ? "justify-end" : "justify-start")}
                      >
                        {!isOwn && showAvatar && (
                          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-sm font-medium flex-shrink-0">
                            {otherUser?.avatar ? (
                              <img
                                src={otherUser.avatar}
                                alt=""
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              otherUser?.name?.charAt(0) || "?"
                            )}
                          </div>
                        )}
                        {!isOwn && !showAvatar && <div className="w-8" />}

                        <div
                          className={cn(
                            "max-w-[75%] rounded-2xl px-4 py-2",
                            isOwn
                              ? "bg-primary text-primary-foreground rounded-br-md"
                              : "bg-secondary text-foreground rounded-bl-md"
                          )}
                        >
                          <p className="break-words">{message.content}</p>
                          <p
                            className={cn(
                              "text-[10px] mt-1",
                              isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                            )}
                          >
                            {formatTime(message.created_at)}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-full px-4"
            disabled={isSending}
          />
          <Button
            type="submit"
            size="icon"
            className="rounded-full w-10 h-10"
            disabled={!inputValue.trim() || isSending}
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;
