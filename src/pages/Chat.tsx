import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, MoreVertical, Loader2, UserX, Ban, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useChat } from "@/hooks/useChat";
import { useUnmatch } from "@/hooks/useUnmatch";
import { useBlock } from "@/hooks/useBlock";
import { useChatPresence } from "@/hooks/useChatPresence";
import ChatInterface from "@/components/chat/ChatInterface";
import ProfileHeader from "@/components/ProfileHeader";

interface MatchDetails {
  id: string;
  employer_id: string;
  candidate_id: string;
  job_id: string | null;
  matched_at: string;
}

interface OtherUser {
  id: string;
  name: string;
  avatar?: string;
  type: string;
}

const Chat = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [match, setMatch] = useState<MatchDetails | null>(null);
  const [otherUser, setOtherUser] = useState<OtherUser | null>(null);
  const [isLoadingMatch, setIsLoadingMatch] = useState(true);
  const [showUnmatchDialog, setShowUnmatchDialog] = useState(false);
  const [showBlockDialog, setShowBlockDialog] = useState(false);

  const { messages, isLoading, isSending, sendMessage } = useChat(matchId || "");
  const { unmatch, isUnmatching } = useUnmatch();
  const { blockUser, isBlocking } = useBlock();
  const { isOtherUserOnline, isOtherUserTyping, setTyping } = useChatPresence(matchId || "");

  // Fetch match and other user details
  useEffect(() => {
    const fetchMatchDetails = async () => {
      if (!matchId || !user || !profile) return;

      setIsLoadingMatch(true);
      try {
        // Get match details
        const { data: matchData, error: matchError } = await supabase
          .from("matches")
          .select("*")
          .eq("id", matchId)
          .single();

        if (matchError) throw matchError;
        setMatch(matchData);

        // Determine other user
        const isEmployer = profile.user_type === "employer";
        const otherUserId = isEmployer
          ? matchData.candidate_id
          : matchData.employer_id;

        // Get other user's profile
        const { data: otherProfile } = await supabase
          .from("profiles")
          .select("user_id, full_name, avatar_url, user_type")
          .eq("user_id", otherUserId)
          .single();

        if (otherProfile) {
          setOtherUser({
            id: otherProfile.user_id,
            name: otherProfile.full_name || "Unknown",
            avatar: otherProfile.avatar_url || undefined,
            type: otherProfile.user_type,
          });
        }
      } catch (error) {
        console.error("Error fetching match details:", error);
      } finally {
        setIsLoadingMatch(false);
      }
    };

    fetchMatchDetails();
  }, [matchId, user, profile]);

  const handleUnmatch = async () => {
    if (!matchId) return;
    const success = await unmatch(matchId);
    if (success) {
      navigate("/matches");
    }
    setShowUnmatchDialog(false);
  };

  const handleBlock = async () => {
    if (!otherUser || !matchId) return;
    const success = await blockUser(otherUser.id, matchId);
    if (success) {
      navigate("/matches");
    }
    setShowBlockDialog(false);
  };

  if (isLoadingMatch) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-xl font-bold text-foreground mb-2">Match not found</h2>
          <Button onClick={() => navigate("/matches")}>Go to Messages</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border"
      >
        <div className="flex items-center gap-3 px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/matches")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          {/* User info */}
          <div
            className="flex items-center gap-3 flex-1 cursor-pointer"
            onClick={() => {
              // Could open a profile view here
            }}
          >
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-lg font-bold text-primary overflow-hidden">
              {otherUser?.avatar ? (
                <img
                  src={otherUser.avatar}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                otherUser?.name?.charAt(0) || "?"
              )}
            </div>
            <div>
              <h1 className="font-semibold text-foreground">
                {otherUser?.name || "Unknown"}
              </h1>
              <p className="text-xs text-muted-foreground capitalize">
                {otherUser?.type}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    // View profile functionality
                  }}
                >
                  <User className="w-4 h-4 mr-2" />
                  View Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setShowUnmatchDialog(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <UserX className="w-4 h-4 mr-2" />
                  Unmatch
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setShowBlockDialog(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <Ban className="w-4 h-4 mr-2" />
                  Block User
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <ProfileHeader />
          </div>
        </div>
      </motion.header>

      {/* Chat */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <ChatInterface
          messages={messages}
          onSendMessage={sendMessage}
          isSending={isSending}
          isLoading={isLoading}
          otherUser={otherUser ? { name: otherUser.name, avatar: otherUser.avatar } : undefined}
          isOtherUserOnline={isOtherUserOnline}
          isOtherUserTyping={isOtherUserTyping}
          onTyping={setTyping}
        />
      </div>

      {/* Unmatch Confirmation Dialog */}
      <AlertDialog open={showUnmatchDialog} onOpenChange={setShowUnmatchDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unmatch with {otherUser?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove this match and you won't be able to message each other anymore. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUnmatch}
              disabled={isUnmatching}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isUnmatching ? "Unmatching..." : "Unmatch"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Block Confirmation Dialog */}
      <AlertDialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Block {otherUser?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Blocking will unmatch you and prevent this person from appearing in your results 
              or contacting you. You can unblock them later from settings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBlock}
              disabled={isBlocking}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isBlocking ? "Blocking..." : "Block User"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Chat;
