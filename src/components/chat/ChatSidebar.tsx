import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface ChatMatch {
  id: string;
  other_user?: {
    full_name: string | null;
    avatar_url: string | null;
    user_type: string;
  };
  last_message?: {
    content: string;
    created_at: string;
  };
  unread_count?: number;
}

interface ChatSidebarProps {
  matches: ChatMatch[];
  currentMatchId?: string;
  isLoading?: boolean;
}

export function ChatSidebar({ matches, currentMatchId, isLoading }: ChatSidebarProps) {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Now";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString();
  };

  return (
    <motion.div
      initial={false}
      animate={{ width: isCollapsed ? 56 : 280 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="h-full border-r border-border bg-sidebar flex flex-col"
    >
      {/* Header */}
      <div className="p-3 border-b border-border flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            <span className="font-semibold text-sidebar-foreground">Chats</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          <AnimatePresence mode="popLayout">
            {matches.map((match) => {
              const isActive = match.id === currentMatchId;
              const hasUnread = (match.unread_count || 0) > 0;

              return (
                <motion.button
                  key={match.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onClick={() => navigate(`/chat/${match.id}`)}
                  className={cn(
                    "w-full flex items-center gap-3 p-2 rounded-lg transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "hover:bg-sidebar-accent/50"
                  )}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-sm font-bold text-primary overflow-hidden">
                      {match.other_user?.avatar_url ? (
                        <img
                          src={match.other_user.avatar_url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        match.other_user?.full_name?.charAt(0) || "?"
                      )}
                    </div>
                    {hasUnread && (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                        {match.unread_count! > 9 ? "9+" : match.unread_count}
                      </span>
                    )}
                  </div>

                  {/* Info - hidden when collapsed */}
                  {!isCollapsed && (
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center justify-between">
                        <span className={cn(
                          "font-medium truncate text-sm",
                          hasUnread && "font-semibold"
                        )}>
                          {match.other_user?.full_name || "Unknown"}
                        </span>
                        {match.last_message && (
                          <span className="text-xs text-muted-foreground flex-shrink-0">
                            {formatTime(match.last_message.created_at)}
                          </span>
                        )}
                      </div>
                      <p className={cn(
                        "text-xs truncate mt-0.5",
                        hasUnread ? "text-foreground font-medium" : "text-muted-foreground"
                      )}>
                        {match.last_message?.content || "Start chatting!"}
                      </p>
                    </div>
                  )}
                </motion.button>
              );
            })}
          </AnimatePresence>

          {matches.length === 0 && !isLoading && !isCollapsed && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No chats yet
            </div>
          )}
        </div>
      </ScrollArea>
    </motion.div>
  );
}
