import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, MessageCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { SidebarInterviewSection } from "./SidebarInterviewSection";
import { useInterviews, Interview } from "@/hooks/useInterviews";
import { useAuth } from "@/contexts/AuthContext";

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
  messages?: Array<{
    id: string;
    content: string;
    sender_id: string;
    created_at: string;
  }>;
  job?: {
    id: string;
    title: string;
    company: string;
  } | null;
  employer?: {
    full_name: string | null;
    avatar_url: string | null;
    company_name: string | null;
  } | null;
  hiringManager?: {
    name: string;
    title: string | null;
    avatar_url: string | null;
  } | null;
}

interface ChatSidebarProps {
  matches: ChatMatch[];
  currentMatchId?: string;
  isLoading?: boolean;
}

export function ChatSidebar({ matches, currentMatchId, isLoading }: ChatSidebarProps) {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [previewMatchId, setPreviewMatchId] = useState<string | null>(null);
  const { interviews } = useInterviews();

  const previewMatch = matches.find((m) => m.id === previewMatchId);
  const isCandidate = profile?.user_type === "candidate";

  // Get interviews for the preview match
  const previewInterviews = useMemo(() => {
    if (!previewMatchId) return [];
    return interviews.filter((i) => i.match_id === previewMatchId);
  }, [previewMatchId, interviews]);

  // Build match context for sidebar
  const matchContext = useMemo(() => {
    if (!previewMatch) return undefined;
    return {
      id: previewMatch.id,
      job: previewMatch.job,
      employer: previewMatch.employer,
      hiringManager: previewMatch.hiringManager,
    };
  }, [previewMatch]);

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

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <motion.div
      initial={false}
      animate={{ width: isCollapsed ? 56 : previewMatchId ? 480 : 280 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="h-full border-r border-border bg-sidebar flex"
    >
      {/* Chat List */}
      <div className={cn("flex flex-col", isCollapsed ? "w-14" : "w-[280px]")}>
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
            onClick={() => {
              setIsCollapsed(!isCollapsed);
              if (!isCollapsed) setPreviewMatchId(null);
            }}
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
                const isPreview = match.id === previewMatchId;

                return (
                  <motion.button
                    key={match.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    onClick={() => navigate(`/chat/${match.id}`)}
                    onMouseEnter={() => !isCollapsed && setPreviewMatchId(match.id)}
                    className={cn(
                      "w-full flex items-center gap-3 p-2 rounded-lg transition-colors",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : isPreview
                        ? "bg-sidebar-accent/50"
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
      </div>

      {/* Preview Panel */}
      <AnimatePresence>
        {previewMatchId && previewMatch && !isCollapsed && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 200 }}
            exit={{ opacity: 0, width: 0 }}
            className="border-l border-border flex flex-col bg-background overflow-hidden"
            onMouseLeave={() => setPreviewMatchId(null)}
          >
            {/* Preview Header */}
            <div className="p-3 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-primary overflow-hidden flex-shrink-0">
                  {previewMatch.other_user?.avatar_url ? (
                    <img
                      src={previewMatch.other_user.avatar_url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    previewMatch.other_user?.full_name?.charAt(0) || "?"
                  )}
                </div>
                <span className="text-sm font-medium truncate">
                  {previewMatch.other_user?.full_name || "Unknown"}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 flex-shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewMatchId(null);
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>

            {/* Context & Interviews Section */}
            {isCandidate && (matchContext || previewInterviews.length > 0) && (
              <>
                <SidebarInterviewSection
                  interviews={previewInterviews}
                  matchContext={matchContext}
                  isCandidate={isCandidate}
                />
                <Separator />
              </>
            )}

            {/* Recent Messages */}
            <ScrollArea className="flex-1 p-2">
              <div className="space-y-2">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  Recent Messages
                </p>
                {previewMatch.messages && previewMatch.messages.length > 0 ? (
                  previewMatch.messages.slice(-5).map((msg) => (
                    <div
                      key={msg.id}
                      className="text-xs p-2 rounded bg-muted/50"
                    >
                      <p className="text-muted-foreground line-clamp-2">
                        {msg.content}
                      </p>
                      <p className="text-[10px] text-muted-foreground/60 mt-1">
                        {formatMessageTime(msg.created_at)}
                      </p>
                    </div>
                  ))
                ) : previewMatch.last_message ? (
                  <div className="text-xs p-2 rounded bg-muted/50">
                    <p className="text-muted-foreground line-clamp-3">
                      {previewMatch.last_message.content}
                    </p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1">
                      {formatMessageTime(previewMatch.last_message.created_at)}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    No messages yet
                  </p>
                )}
              </div>
            </ScrollArea>

            {/* Open Chat Button */}
            <div className="p-2 border-t border-border">
              <Button
                size="sm"
                className="w-full text-xs"
                onClick={() => navigate(`/chat/${previewMatch.id}`)}
              >
                Open Chat
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
