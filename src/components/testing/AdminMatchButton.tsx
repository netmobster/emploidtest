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
  const [alreadyExisted, setAlreadyExisted] = useState(false);

  const handleForceMatch = async () => {
    if (!user) {
      toast.error("You must be logged in");
      return;
    }

    setIsMatching(true);
    const loadingToast = toast.loading("Creating match with Admin...");

    try {
      const { data, error } = await supabase.functions.invoke("force-admin-match", {
        method: "POST",
      });

      toast.dismiss(loadingToast);

      if (error) {
        console.error("[AdminMatchButton] Edge function error:", error);
        toast.error("Failed to create match", {
          description: error.message || "Please try again",
        });
        return;
      }

      if (!data?.matchId) {
        console.error("[AdminMatchButton] No matchId returned:", data);
        toast.error("Match creation failed", {
          description: "No match ID returned from server",
        });
        return;
      }

      setMatchId(data.matchId);
      setAlreadyExisted(data.alreadyExisted || false);

      if (data.alreadyExisted) {
        toast.info("You're already matched with Admin!");
      } else {
        toast.success("🎉 Matched with Admin!");
      }

      setShowSuccessDialog(true);
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error("[AdminMatchButton] Unexpected error:", error);
      toast.error("Something went wrong");
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
              {alreadyExisted ? "📬 Already Matched!" : "🎉 It's a Match!"}
            </DialogTitle>
            <DialogDescription>
              {alreadyExisted
                ? "You're already matched with Admin. You can continue chatting or keep browsing."
                : "You've successfully matched with Admin for testing. You can now start chatting or continue browsing."}
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
              {alreadyExisted ? "Open Chat" : "Start Chatting"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
