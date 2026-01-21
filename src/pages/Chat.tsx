import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, MoreVertical, Loader2, UserX, Ban, User, Heart, Briefcase, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useChat } from "@/hooks/useChat";
import { useUnmatch } from "@/hooks/useUnmatch";
import { useBlock } from "@/hooks/useBlock";
import { useChatPresence } from "@/hooks/useChatPresence";
import { useShortlist } from "@/hooks/useShortlist";
import ChatInterface from "@/components/chat/ChatInterface";
import ProfileHeader from "@/components/ProfileHeader";
import Logo from "@/components/Logo";
import { calculateSynergyCompatibility, getCompatibilityLabel } from "@/lib/synergyUtils";
import { CalendlyScheduler } from "@/components/interviews/CalendlyScheduler";
import { QuickQuestionsDialog } from "@/components/chat/QuickQuestionsDialog";
import { RequestDocumentDialog } from "@/components/chat/RequestDocumentDialog";
import { AddNoteDialog } from "@/components/chat/AddNoteDialog";
import { AddToShortlistDialog } from "@/components/chat/AddToShortlistDialog";
import { CalendlyPromptDialog } from "@/components/chat/CalendlyPromptDialog";

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
  synergy_scores?: Record<string, number>;
}

interface JobInfo {
  id: string;
  title: string;
  roleId: string;
}

const Chat = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [match, setMatch] = useState<MatchDetails | null>(null);
  const [otherUser, setOtherUser] = useState<OtherUser | null>(null);
  const [jobInfo, setJobInfo] = useState<JobInfo | null>(null);
  const [isLoadingMatch, setIsLoadingMatch] = useState(true);
  const [showUnmatchDialog, setShowUnmatchDialog] = useState(false);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showQuickQuestionsDialog, setShowQuickQuestionsDialog] = useState(false);
  const [showDocumentDialog, setShowDocumentDialog] = useState(false);
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [showShortlistDialog, setShowShortlistDialog] = useState(false);
  const [showCalendlyPrompt, setShowCalendlyPrompt] = useState(false);
  const [hasCalendly, setHasCalendly] = useState(false);
  const [isInShortlist, setIsInShortlist] = useState(false);
  const [synergyCompatibility, setSynergyCompatibility] = useState<number | null>(null);

  const { messages, isLoading, isSending, sendMessage } = useChat(matchId || "");
  const { unmatch, isUnmatching } = useUnmatch();
  const { blockUser, isBlocking } = useBlock();
  const { isOtherUserOnline, isOtherUserTyping, setTyping } = useChatPresence(matchId || "");
  const { isInShortlist: checkShortlist } = useShortlist();

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

        // Get other user's profile with synergy scores
        const { data: otherProfile } = await supabase
          .from("profiles")
          .select("user_id, full_name, avatar_url, user_type, synergy_scores")
          .eq("user_id", otherUserId)
          .single();

        if (otherProfile) {
          const otherSynergyScores = otherProfile.synergy_scores as Record<string, number> | null;
          setOtherUser({
            id: otherProfile.user_id,
            name: otherProfile.full_name || "Unknown",
            avatar: otherProfile.avatar_url || undefined,
            type: otherProfile.user_type,
            synergy_scores: otherSynergyScores || undefined,
          });

          // Calculate synergy compatibility
          const userSynergyScores = profile.synergy_scores as Record<string, number> | null;
          if (userSynergyScores && otherSynergyScores) {
            const compatibility = calculateSynergyCompatibility(userSynergyScores, otherSynergyScores);
            setSynergyCompatibility(compatibility > 0 ? compatibility : null);
          }
        }

        // Fetch job info if there's a job_id
        if (matchData.job_id) {
          const { data: jobData } = await supabase
            .from("jobs")
            .select("id, title, role_id")
            .eq("id", matchData.job_id)
            .single();
          
          if (jobData) {
            setJobInfo({
              id: jobData.id,
              title: jobData.title,
              roleId: jobData.role_id,
            });

            // Check if candidate is in shortlist for this job (employer only)
            if (isEmployer && otherUserId) {
              const inShortlist = await checkShortlist(jobData.id, otherUserId);
              setIsInShortlist(inShortlist);
            }
          }
        }

        // Check if employer has Calendly configured
        if (isEmployer) {
          const { data: myProfile } = await supabase
            .from("profiles")
            .select("calendly_url")
            .eq("user_id", user.id)
            .single();
          setHasCalendly(!!myProfile?.calendly_url);
        } else {
          // For candidates, check employer's Calendly
          const { data: employerProfile } = await supabase
            .from("profiles")
            .select("calendly_url")
            .eq("user_id", matchData.employer_id)
            .single();
          setHasCalendly(!!employerProfile?.calendly_url);
        }
      } catch (error) {
        console.error("Error fetching match details:", error);
      } finally {
        setIsLoadingMatch(false);
      }
    };

    fetchMatchDetails();
  }, [matchId, user, profile, checkShortlist]);

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
            className="flex items-center gap-3 flex-1 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => {
              if (otherUser) {
                const profilePath = otherUser.type === 'employer' 
                  ? `/company/${otherUser.id}` 
                  : `/candidate/${otherUser.id}`;
                navigate(profilePath);
              }
            }}
          >
            <div className="relative">
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
              {/* Online Status Indicator */}
              <span
                className={cn(
                  "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background",
                  isOtherUserOnline ? "bg-green-500" : "bg-muted-foreground"
                )}
              />
            </div>
            <div>
              <h1 className="font-semibold text-foreground">
                {otherUser?.name || "Unknown"}
              </h1>
              <p className="text-xs text-muted-foreground">
                {isOtherUserTyping ? (
                  <span className="text-primary">Typing...</span>
                ) : isOtherUserOnline ? (
                  <span className="text-green-500">Online</span>
                ) : (
                  <span className="capitalize">{otherUser?.type}</span>
                )}
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
                    if (otherUser) {
                      const profilePath = otherUser.type === 'employer' 
                        ? `/company/${otherUser.id}` 
                        : `/candidate/${otherUser.id}`;
                      navigate(profilePath);
                    }
                  }}
                >
                  <User className="w-4 h-4 mr-2" />
                  View Profile
                </DropdownMenuItem>
                {jobInfo && (
                  <DropdownMenuItem
                    onClick={() => navigate(`/results?role=${jobInfo.roleId}`)}
                  >
                    <Briefcase className="w-4 h-4 mr-2" />
                    View Role: {jobInfo.title}
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => setShowScheduleDialog(true)}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Interview
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

        {/* Synergy Compatibility Banner */}
        {synergyCompatibility && synergyCompatibility > 0 && (
          <div className="px-4 pb-2">
            <div className="flex items-center justify-center gap-2 py-1.5 px-3 bg-primary/10 rounded-full">
              <Heart className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-medium text-primary">
                {synergyCompatibility}% Synergy Compatibility • {getCompatibilityLabel(synergyCompatibility)}
              </span>
            </div>
          </div>
        )}
      </motion.header>

      {/* Chat */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <ChatInterface
          messages={messages}
          onSendMessage={sendMessage}
          isSending={isSending}
          isLoading={isLoading}
          otherUser={otherUser ? { id: otherUser.id, name: otherUser.name, avatar: otherUser.avatar, type: otherUser.type } : undefined}
          jobInfo={jobInfo ? { id: jobInfo.id, title: jobInfo.title } : undefined}
          matchId={matchId}
          isOtherUserOnline={isOtherUserOnline}
          isOtherUserTyping={isOtherUserTyping}
          onTyping={setTyping}
          onUnmatch={() => setShowUnmatchDialog(true)}
          onScheduleInterview={() => hasCalendly ? setShowScheduleDialog(true) : setShowCalendlyPrompt(true)}
          onQuickQuestion={() => setShowQuickQuestionsDialog(true)}
          onRequestDocument={() => setShowDocumentDialog(true)}
          onAddToShortlist={() => setShowShortlistDialog(true)}
          onAddNote={() => setShowNoteDialog(true)}
          hasCalendly={hasCalendly}
          isInShortlist={isInShortlist}
        />
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-background/80 backdrop-blur-sm py-2">
        <div className="flex items-center justify-center gap-2">
          <Logo size="sm" />
        </div>
      </footer>

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

      {/* Schedule Interview Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Schedule Interview with {otherUser?.name}</DialogTitle>
          </DialogHeader>
          {match && otherUser && (
            <CalendlyScheduler
              matchId={match.id}
              jobId={jobInfo?.id}
              employerId={match.employer_id}
              candidateId={match.candidate_id}
              onScheduled={() => setShowScheduleDialog(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Calendly Prompt Dialog */}
      <CalendlyPromptDialog
        isOpen={showCalendlyPrompt}
        onClose={() => setShowCalendlyPrompt(false)}
        onSuccess={() => {
          setShowCalendlyPrompt(false);
          setHasCalendly(true);
          setShowScheduleDialog(true);
        }}
      />

      {/* Quick Questions Dialog */}
      <QuickQuestionsDialog
        isOpen={showQuickQuestionsDialog}
        onClose={() => setShowQuickQuestionsDialog(false)}
        onSelectQuestion={(question) => sendMessage(question)}
      />

      {/* Request Document Dialog */}
      {matchId && (
        <RequestDocumentDialog
          isOpen={showDocumentDialog}
          onClose={() => setShowDocumentDialog(false)}
          matchId={matchId}
          candidateName={otherUser?.name}
        />
      )}

      {/* Add Note Dialog */}
      {matchId && (
        <AddNoteDialog
          isOpen={showNoteDialog}
          onClose={() => setShowNoteDialog(false)}
          matchId={matchId}
          candidateName={otherUser?.name}
        />
      )}

      {/* Add to Shortlist Dialog */}
      {otherUser && (
        <AddToShortlistDialog
          isOpen={showShortlistDialog}
          onClose={() => setShowShortlistDialog(false)}
          candidateId={otherUser.id}
          candidateName={otherUser.name}
          defaultJobId={jobInfo?.id}
        />
      )}
    </div>
  );
};

export default Chat;
