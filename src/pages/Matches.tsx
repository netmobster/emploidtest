import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, MessageCircle, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMatches } from "@/hooks/useMatches";
import { cn } from "@/lib/utils";
import ProfileHeader from "@/components/ProfileHeader";
import { getPrimaryBadge } from "@/lib/badgeUtils";
import { SynergyScoreModal } from "@/components/SynergyScoreModal";

const Matches = () => {
  const navigate = useNavigate();
  const { matches, isLoading } = useMatches();
  const [synergyModal, setSynergyModal] = useState<{
    isOpen: boolean;
    userName: string;
    scores: Record<string, number>;
  }>({ isOpen: false, userName: "", scores: {} });

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border"
      >
        <div className="flex items-center justify-between px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <h1 className="font-bold text-foreground">Messages</h1>

          <ProfileHeader />
        </div>
      </motion.header>

      {/* Content */}
      <div className="flex-1 p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : matches.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageCircle className="w-16 h-16 text-muted-foreground/30 mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">No matches yet</h2>
            <p className="text-muted-foreground mb-6">
              Keep swiping to find your perfect match!
            </p>
            <Button onClick={() => navigate(-1)}>
              Continue Swiping
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {matches.map((match, index) => (
              <motion.button
                key={match.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => navigate(`/chat/${match.id}`)}
                className={cn(
                  "w-full flex items-center gap-4 p-4 rounded-2xl transition-all",
                  "bg-card hover:bg-secondary/50 border border-border",
                  match.unread_count && match.unread_count > 0 && "bg-primary/5"
                )}
              >
                {/* Avatar */}
                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center text-xl font-bold text-primary overflow-hidden">
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
                  {/* Synergy Score Badge */}
                  {match.other_user?.has_completed_synergy_quiz && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (match.other_user?.synergy_scores) {
                          setSynergyModal({
                            isOpen: true,
                            userName: match.other_user.full_name || "User",
                            scores: match.other_user.synergy_scores,
                          });
                        }
                      }}
                      className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                    >
                      <Sparkles className="w-3 h-3" />
                    </button>
                  )}
                  {/* Unread Count Badge */}
                  {match.unread_count && match.unread_count > 0 && (
                    <span className="absolute -top-1 -left-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs font-bold rounded-full flex items-center justify-center">
                      {match.unread_count > 9 ? "9+" : match.unread_count}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground truncate">
                      {match.other_user?.full_name || "Unknown"}
                    </span>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      {match.other_user?.user_type === "employer" ? "Employer" : "Candidate"}
                    </Badge>
                    {/* Archetype Badge */}
                    {match.other_user?.synergy_scores && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        {getPrimaryBadge(match.other_user.synergy_scores)?.title}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {match.last_message
                      ? match.last_message.content
                      : "Start the conversation!"}
                  </p>
                </div>

                {/* Time */}
                <span className="text-xs text-muted-foreground flex-shrink-0">
                  {match.last_message
                    ? formatTime(match.last_message.created_at)
                    : formatTime(match.matched_at)}
                </span>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* Synergy Score Modal */}
      <SynergyScoreModal
        isOpen={synergyModal.isOpen}
        onClose={() => setSynergyModal({ isOpen: false, userName: "", scores: {} })}
        userName={synergyModal.userName}
        scores={synergyModal.scores}
      />
    </div>
  );
};

export default Matches;
