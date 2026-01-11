import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, Loader2, Users, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface UnmatchedCandidate {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  job_title: string | null;
}

export function QuickMatchPanel() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [candidates, setCandidates] = useState<UnmatchedCandidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [matchingUserId, setMatchingUserId] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successMatchId, setSuccessMatchId] = useState<string | null>(null);
  const [matchedUserName, setMatchedUserName] = useState<string>("");

  useEffect(() => {
    fetchUnmatchedCandidates();
  }, [user]);

  const fetchUnmatchedCandidates = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Get existing matches for this employer
      const { data: existingMatches } = await supabase
        .from("matches")
        .select("candidate_id")
        .eq("employer_id", user.id);

      const matchedIds = existingMatches?.map(m => m.candidate_id) || [];

      // Get all candidate profiles that are not sample data (have user_id that looks like a real UUID)
      const { data: allCandidates } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url, job_title")
        .eq("user_type", "candidate")
        .neq("user_id", user.id); // Exclude self

      // Filter out already matched candidates and sample users
      const unmatched = (allCandidates || []).filter(
        c => !matchedIds.includes(c.user_id) && 
             // Only include real users (UUIDs have specific format)
             c.user_id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
      );

      setCandidates(unmatched);
    } catch (error) {
      console.error("Error fetching candidates:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickMatch = async (candidate: UnmatchedCandidate) => {
    if (!user) return;

    setMatchingUserId(candidate.user_id);

    try {
      // Create mutual swipes
      await supabase.from("swipes").upsert({
        swiper_id: user.id,
        swiped_id: candidate.user_id,
        direction: "like",
      }, { onConflict: "swiper_id,swiped_id" });

      await supabase.from("swipes").upsert({
        swiper_id: candidate.user_id,
        swiped_id: user.id,
        direction: "like",
      }, { onConflict: "swiper_id,swiped_id" });

      // Wait for trigger
      await new Promise(resolve => setTimeout(resolve, 500));

      // Check for match
      const { data: newMatch } = await supabase
        .from("matches")
        .select("id")
        .eq("candidate_id", candidate.user_id)
        .eq("employer_id", user.id)
        .maybeSingle();

      if (newMatch) {
        setSuccessMatchId(newMatch.id);
        setMatchedUserName(candidate.full_name || "Candidate");
        toast.success(`🎉 Matched with ${candidate.full_name || "Candidate"}!`);
        setShowSuccessDialog(true);
        fetchUnmatchedCandidates(); // Refresh list
      } else {
        // Force create
        const { data: forcedMatch, error } = await supabase
          .from("matches")
          .insert({
            candidate_id: candidate.user_id,
            employer_id: user.id,
            status: "active",
          })
          .select("id")
          .single();

        if (error) throw error;

        setSuccessMatchId(forcedMatch.id);
        setMatchedUserName(candidate.full_name || "Candidate");
        toast.success(`🎉 Matched with ${candidate.full_name || "Candidate"}!`);
        setShowSuccessDialog(true);
        fetchUnmatchedCandidates();
      }
    } catch (error) {
      console.error("Error creating match:", error);
      toast.error("Failed to create match");
    } finally {
      setMatchingUserId(null);
    }
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-card rounded-xl p-5 shadow-card border border-border"
      >
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-yellow-500" />
          <h3 className="font-semibold text-foreground">Quick Match (Testing)</h3>
        </div>
        <div className="flex justify-center py-4">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-card rounded-xl p-5 shadow-card border border-border border-dashed border-yellow-500/50"
      >
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-yellow-500" />
          <h3 className="font-semibold text-foreground">Quick Match (Testing)</h3>
        </div>

        {candidates.length === 0 ? (
          <div className="text-center py-4">
            <Users className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No unmatched candidates</p>
          </div>
        ) : (
          <div className="space-y-3">
            {candidates.slice(0, 5).map((candidate) => (
              <div
                key={candidate.user_id}
                className="flex items-center gap-3 p-2 rounded-lg bg-secondary/30"
              >
                <Avatar className="w-10 h-10">
                  <AvatarImage src={candidate.avatar_url || undefined} />
                  <AvatarFallback className="text-xs">
                    {candidate.full_name?.slice(0, 2).toUpperCase() || "??"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {candidate.full_name || "Unknown"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {candidate.job_title || "Candidate"}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleQuickMatch(candidate)}
                  disabled={matchingUserId === candidate.user_id}
                >
                  {matchingUserId === candidate.user_id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Zap className="w-4 h-4" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              🎉 It's a Match!
            </DialogTitle>
            <DialogDescription>
              You've successfully matched with {matchedUserName}. You can now start chatting or continue browsing.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowSuccessDialog(false)}
            >
              Keep Browsing
            </Button>
            <Button
              onClick={() => {
                setShowSuccessDialog(false);
                if (successMatchId) {
                  navigate(`/chat/${successMatchId}`);
                } else {
                  navigate("/matches");
                }
              }}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Start Chatting
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
