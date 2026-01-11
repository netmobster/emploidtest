import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Zap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { TEST_EMPLOYER_ID } from "@/lib/gameData";
import { toast } from "sonner";

interface AdminMatchButtonProps {
  className?: string;
}

export function AdminMatchButton({ className }: AdminMatchButtonProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isMatching, setIsMatching] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [matchId, setMatchId] = useState<string | null>(null);

  const handleForceMatch = async () => {
    if (!user) {
      toast.error("You must be logged in");
      return;
    }

    setIsMatching(true);

    try {
      // Check if already matched with admin
      const { data: existingMatch } = await supabase
        .from("matches")
        .select("id")
        .eq("candidate_id", user.id)
        .eq("employer_id", TEST_EMPLOYER_ID)
        .maybeSingle();

      if (existingMatch) {
        toast.info("You're already matched with Admin!");
        setMatchId(existingMatch.id);
        setShowSuccessDialog(true);
        setIsMatching(false);
        return;
      }

      // Create mutual swipes first
      // Candidate swipe on employer
      await supabase.from("swipes").upsert({
        swiper_id: user.id,
        swiped_id: TEST_EMPLOYER_ID,
        direction: "like",
      }, { onConflict: "swiper_id,swiped_id" });

      // Employer swipe on candidate (this should trigger the match via database trigger)
      await supabase.from("swipes").upsert({
        swiper_id: TEST_EMPLOYER_ID,
        swiped_id: user.id,
        direction: "like",
      }, { onConflict: "swiper_id,swiped_id" });

      // Wait a moment for the trigger to execute
      await new Promise(resolve => setTimeout(resolve, 500));

      // Check if match was created
      const { data: newMatch } = await supabase
        .from("matches")
        .select("id")
        .eq("candidate_id", user.id)
        .eq("employer_id", TEST_EMPLOYER_ID)
        .maybeSingle();

      if (newMatch) {
        setMatchId(newMatch.id);
        toast.success("🎉 You matched with Admin!");
        setShowSuccessDialog(true);
      } else {
        // Force create the match if trigger didn't work
        const { data: forcedMatch, error } = await supabase
          .from("matches")
          .insert({
            candidate_id: user.id,
            employer_id: TEST_EMPLOYER_ID,
            status: "active",
          })
          .select("id")
          .single();

        if (error) {
          throw error;
        }

        setMatchId(forcedMatch.id);
        toast.success("🎉 You matched with Admin!");
        setShowSuccessDialog(true);
      }
    } catch (error) {
      console.error("Error creating match:", error);
      toast.error("Failed to create match");
    } finally {
      setIsMatching(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className={className}
        onClick={handleForceMatch}
        disabled={isMatching}
      >
        {isMatching ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Zap className="w-4 h-4 mr-2" />
        )}
        Match with Admin
      </Button>

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              🎉 It's a Match!
            </DialogTitle>
            <DialogDescription>
              You've successfully matched with Admin for testing. You can now start chatting or continue browsing.
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
                if (matchId) {
                  navigate(`/chat/${matchId}`);
                } else {
                  navigate("/matches");
                }
              }}
            >
              Start Chatting
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
