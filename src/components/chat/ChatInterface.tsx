import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, User, Briefcase, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { ChatActionsMenu } from "./ChatActionsMenu";
import { DocumentRequestBanner } from "./DocumentRequestBanner";
import { DocumentReceivedCard } from "./DocumentReceivedCard";
import { QuizMessageCard } from "./QuizMessageCard";
import { QuizSummaryCard } from "./QuizSummaryCard";
import { ChatSeeds } from "./ChatSeeds";
import { useDocumentRequests } from "@/hooks/useDocumentRequests";
import { VerifiedProfessionalBadge } from "@/components/verification/VerifiedProfessionalBadge";
import { VerifiedDomainBadge } from "@/components/verification/VerifiedDomainBadge";

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

interface QuizRequest {
  id: string;
  match_id: string;
  candidate_id: string;
  employer_id: string;
  employer_name: string;
  questions: { id: string; question: string; category: string }[];
  status: "pending" | "completed";
  created_at: string;
}

interface InsightResponse {
  questionId: string;
  question: string;
  answer: string;
}

interface InterviewInsight {
  id: string;
  match_id: string;
  candidate_id: string;
  employer_id: string;
  responses: InsightResponse[];
  completed_at: string;
}

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (content: string) => Promise<boolean>;
  isSending: boolean;
  isLoading: boolean;
  otherUser?: {
    id: string;
    name: string;
    avatar?: string;
    type: string;
    isVerified?: boolean;
    verifiedDomain?: string;
  };
  jobInfo?: {
    id: string;
    title: string;
    mission_statement?: string | null;
    big_rocks?: { title: string }[] | null;
  };
  matchId?: string;
  isOtherUserOnline?: boolean;
  isOtherUserTyping?: boolean;
  onTyping?: (isTyping: boolean) => void;
  onUnmatch?: () => void;
  onScheduleInterview?: () => void;
  onQuickQuestion?: () => void;
  onRequestDocument?: () => void;
  onAddToShortlist?: () => void;
  onAddNote?: () => void;
  onGetToKnow?: () => void;
  hasCalendly?: boolean;
  isInShortlist?: boolean;
  pendingQuizzes?: QuizRequest[];
  completedInsights?: InterviewInsight[];
  onStartQuiz?: (quiz: QuizRequest) => void;
  candidateName?: string;
  // For ChatSeeds
  currentUserProfile?: {
    skills?: string[] | null;
    synergy_scores?: Record<string, number> | null;
    culture_preferences?: Record<string, number> | null;
  };
  otherUserProfile?: {
    skills?: string[] | null;
    synergy_scores?: Record<string, number> | null;
    culture_preferences?: Record<string, number> | null;
    full_name?: string;
  };
  firstMessageSent?: boolean;
  onSetInputValue?: (value: string) => void;
}

const TypingIndicator = () => (
  <div className="flex items-center gap-1 px-3 py-2">
    <motion.span
      className="w-2 h-2 bg-muted-foreground rounded-full"
      animate={{ opacity: [0.4, 1, 0.4] }}
      transition={{ duration: 1, repeat: Infinity, delay: 0 }}
    />
    <motion.span
      className="w-2 h-2 bg-muted-foreground rounded-full"
      animate={{ opacity: [0.4, 1, 0.4] }}
      transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
    />
    <motion.span
      className="w-2 h-2 bg-muted-foreground rounded-full"
      animate={{ opacity: [0.4, 1, 0.4] }}
      transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
    />
  </div>
);

interface AvatarWithPopoverProps {
  user?: {
    id: string;
    name: string;
    avatar?: string;
    type: string;
  };
  jobInfo?: {
    id: string;
    title: string;
  };
  onUnmatch?: () => void;
}

const AvatarWithPopover = ({ user, jobInfo, onUnmatch }: AvatarWithPopoverProps) => {
  const navigate = useNavigate();

  if (!user) return null;

  const handleViewProfile = () => {
    const profilePath = user.type === "employer"
      ? `/company/${user.id}`
      : `/candidate/${user.id}`;
    navigate(profilePath);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-sm font-medium flex-shrink-0 hover:ring-2 hover:ring-primary/50 transition-all cursor-pointer">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt=""
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            user.name?.charAt(0) || "?"
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-48 p-1">
        <div className="flex flex-col">
          <Button
            variant="ghost"
            size="sm"
            className="justify-start"
            onClick={handleViewProfile}
          >
            <User className="w-4 h-4 mr-2" />
            View Profile
          </Button>
          {jobInfo && (
            <Button
              variant="ghost"
              size="sm"
              className="justify-start"
              onClick={() => navigate(`/results?role=${jobInfo.id}`)}
            >
              <Briefcase className="w-4 h-4 mr-2" />
              View Role Info
            </Button>
          )}
          {onUnmatch && (
            <Button
              variant="ghost"
              size="sm"
              className="justify-start text-destructive hover:text-destructive"
              onClick={onUnmatch}
            >
              <UserX className="w-4 h-4 mr-2" />
              Unmatch
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

const ChatInterface = ({
  messages,
  onSendMessage,
  isSending,
  isLoading,
  otherUser,
  jobInfo,
  matchId,
  isOtherUserOnline = false,
  isOtherUserTyping = false,
  onTyping,
  onUnmatch,
  onScheduleInterview,
  onQuickQuestion,
  onRequestDocument,
  onAddToShortlist,
  onAddNote,
  onGetToKnow,
  hasCalendly = false,
  isInShortlist = false,
  pendingQuizzes = [],
  completedInsights = [],
  onStartQuiz,
  candidateName,
  currentUserProfile,
  otherUserProfile,
  firstMessageSent = false,
}: ChatInterfaceProps) => {
  const { user, profile } = useAuth();
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch document requests to show received documents (employer side)
  const { requests: documentRequests } = useDocumentRequests(matchId || "");
  const isEmployer = profile?.user_type === "employer";
  
  // Filter for uploaded documents (employer can see these)
  const uploadedDocuments = documentRequests.filter(
    (req) => req.status === "uploaded" && req.requester_id === user?.id
  );

  // Show ChatSeeds only if first message hasn't been sent
  const showChatSeeds = !firstMessageSent && messages.length === 0 && currentUserProfile && otherUserProfile;

  const handleSeedSelect = (message: string) => {
    setInputValue(message);
    inputRef.current?.focus();
  };

  // Scroll to bottom on new messages or typing
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOtherUserTyping]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);

    // Notify typing
    if (onTyping && e.target.value.length > 0) {
      onTyping(true);

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set timeout to stop typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        onTyping(false);
      }, 2000);
    } else if (onTyping && e.target.value.length === 0) {
      onTyping(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isSending) return;

    // Stop typing indicator
    if (onTyping) {
      onTyping(false);
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

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
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      {/* Document Request Banner for Candidates */}
      {matchId && (
        <DocumentRequestBanner
          matchId={matchId}
          currentUserId={user?.id || ""}
        />
      )}

      {/* Online Status Bar with Verification Badges */}
      <div className="px-4 py-2 border-b border-border flex items-center gap-2">
        <span
          className={cn(
            "w-2 h-2 rounded-full",
            isOtherUserOnline ? "bg-emerald-500" : "bg-muted-foreground"
          )}
        />
        <span className="text-sm text-muted-foreground">
          {isOtherUserOnline ? "Online" : "Offline"}
        </span>
        {/* Verification badges */}
        {otherUser?.type === "candidate" && otherUser?.isVerified && (
          <VerifiedProfessionalBadge isVerified={true} size="sm" />
        )}
        {otherUser?.type === "employer" && otherUser?.isVerified && (
          <VerifiedDomainBadge domain={otherUser.verifiedDomain} isVerified={true} size="sm" />
        )}
      </div>

      {/* ChatSeeds - Icebreakers for new conversations */}
      {showChatSeeds && currentUserProfile && otherUserProfile && (
        <ChatSeeds
          currentUserProfile={currentUserProfile}
          otherUserProfile={{
            ...otherUserProfile,
            full_name: otherUser?.name,
          }}
          jobInfo={jobInfo}
          onSelectSeed={handleSeedSelect}
          isVisible={true}
        />
      )}

      {/* Messages */}
      <ScrollArea ref={scrollRef} className="flex-1 min-h-0 p-4">
        {messages.length === 0 && pendingQuizzes.length === 0 && completedInsights.length === 0 ? (
          <div className="flex-1 flex items-center justify-center h-full min-h-[200px]">
            <div className="text-center text-muted-foreground">
              <p className="text-lg mb-1">No messages yet</p>
              <p className="text-sm">Say hello to start the conversation!</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Pending Quiz Cards for Candidates */}
            {pendingQuizzes.length > 0 && (
              <div className="space-y-3">
                {pendingQuizzes.map((quiz) => (
                  <motion.div
                    key={quiz.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <QuizMessageCard
                      employerName={quiz.employer_name}
                      questionCount={quiz.questions.length}
                      onStart={() => onStartQuiz?.(quiz)}
                      isCompleted={false}
                    />
                  </motion.div>
                ))}
              </div>
            )}

            {/* Completed Quiz Summary Cards */}
            {completedInsights.length > 0 && (
              <div className="space-y-3">
                {completedInsights.map((insight) => (
                  <motion.div
                    key={insight.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <QuizSummaryCard
                      candidateName={candidateName || "Candidate"}
                      responses={insight.responses}
                      completedAt={insight.completed_at}
                    />
                  </motion.div>
                ))}
              </div>
            )}

            {/* Uploaded Documents (visible to employer who requested them) */}
            {isEmployer && uploadedDocuments.length > 0 && (
              <div className="space-y-3">
                {uploadedDocuments.map((doc) => (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <DocumentReceivedCard
                      documentType={doc.document_type}
                      customLabel={doc.custom_label}
                      fileUrl={doc.file_url}
                      uploadedAt={doc.updated_at}
                      candidateName={candidateName}
                    />
                  </motion.div>
                ))}
              </div>
            )}

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
                          <AvatarWithPopover
                            user={otherUser}
                            jobInfo={jobInfo}
                            onUnmatch={onUnmatch}
                          />
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

            {/* Typing Indicator */}
            <AnimatePresence>
              {isOtherUserTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-end gap-2"
                >
                  <AvatarWithPopover
                    user={otherUser}
                    jobInfo={jobInfo}
                    onUnmatch={onUnmatch}
                  />
                  <div className="bg-secondary rounded-2xl rounded-bl-md">
                    <TypingIndicator />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </ScrollArea>

      {/* Input - Pinned to bottom */}
      <form onSubmit={handleSubmit} className="flex-shrink-0 p-4 border-t border-border bg-background">
        <div className="flex gap-2 items-center">
          {/* Actions Menu */}
          {onScheduleInterview && (
            <ChatActionsMenu
              onScheduleInterview={onScheduleInterview}
              onQuickQuestion={onQuickQuestion || (() => {})}
              onRequestDocument={onRequestDocument || (() => {})}
              onAddToShortlist={onAddToShortlist || (() => {})}
              onAddNote={onAddNote || (() => {})}
              onGetToKnow={onGetToKnow || (() => {})}
              hasCalendly={hasCalendly}
              isInShortlist={isInShortlist}
              jobId={jobInfo?.id}
            />
          )}
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
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
