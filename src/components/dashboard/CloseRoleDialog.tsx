import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, XCircle, Loader2, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface CloseRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  jobTitle: string;
  onSuccess?: () => void;
}

interface CandidateMatch {
  id: string;
  candidate_id: string;
  name: string;
  avatar?: string;
  job_title?: string;
}

const UNFILLED_REASONS = [
  { value: "hired_elsewhere", label: "Hired candidate from elsewhere" },
  { value: "budget_cut", label: "Budget cut / Role eliminated" },
  { value: "role_changed", label: "Role requirements changed" },
  { value: "internal_hire", label: "Internal hire" },
  { value: "on_hold", label: "Hiring put on hold" },
  { value: "other", label: "Other" },
];

export function CloseRoleDialog({
  open,
  onOpenChange,
  jobId,
  jobTitle,
  onSuccess,
}: CloseRoleDialogProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<"choice" | "select-candidate" | "select-reason">("choice");
  const [candidates, setCandidates] = useState<CandidateMatch[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open && step === "select-candidate") {
      fetchCandidates();
    }
  }, [open, step, jobId]);

  useEffect(() => {
    if (!open) {
      setStep("choice");
      setSelectedCandidate(null);
      setSelectedReason("");
    }
  }, [open]);

  const fetchCandidates = async () => {
    setIsLoading(true);
    try {
      // Get matches for this job where the employer has chatted with candidates
      const { data: matches, error } = await supabase
        .from("matches")
        .select(`
          id,
          candidate_id,
          first_message_sent
        `)
        .eq("job_id", jobId)
        .eq("status", "active");

      if (error) throw error;

      if (matches && matches.length > 0) {
        // Fetch candidate profiles
        const candidateIds = matches.map((m) => m.candidate_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name, avatar_url, job_title")
          .in("user_id", candidateIds);

        const candidateList: CandidateMatch[] = matches.map((match) => {
          const profile = profiles?.find((p) => p.user_id === match.candidate_id);
          return {
            id: match.id,
            candidate_id: match.candidate_id,
            name: profile?.full_name || "Unknown Candidate",
            avatar: profile?.avatar_url || undefined,
            job_title: profile?.job_title || undefined,
          };
        });

        setCandidates(candidateList);
      } else {
        setCandidates([]);
      }
    } catch (err) {
      console.error("Failed to fetch candidates:", err);
      toast.error("Failed to load candidates");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMatchFound = () => {
    setStep("select-candidate");
  };

  const handleCloseWithoutHiring = () => {
    setStep("select-reason");
  };

  const handleConfirmHire = async () => {
    if (!selectedCandidate || !user) return;

    setIsSubmitting(true);
    try {
      const selectedMatch = candidates.find((c) => c.candidate_id === selectedCandidate);

      // Update job status to filled
      const { error: jobError } = await supabase
        .from("jobs")
        .update({
          status: "filled" as any,
          hired_candidate_id: selectedCandidate,
        })
        .eq("id", jobId);

      if (jobError) throw jobError;

      // Create hire record
      const { error: hireError } = await supabase.from("hires").insert({
        job_id: jobId,
        employer_id: user.id,
        candidate_id: selectedCandidate,
        match_id: selectedMatch?.id || null,
        source: "emploid",
      });

      if (hireError) throw hireError;

      toast.success("Congratulations! Role marked as filled 🎉");
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      console.error("Failed to close role:", err);
      toast.error("Failed to close role");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmUnfilled = async () => {
    if (!selectedReason || !user) return;

    setIsSubmitting(true);
    try {
      // Update job status to unfilled
      const { error: jobError } = await supabase
        .from("jobs")
        .update({ status: "unfilled" as any })
        .eq("id", jobId);

      if (jobError) throw jobError;

      // Create role closure record
      const { error: closureError } = await supabase.from("role_closures").insert({
        job_id: jobId,
        employer_id: user.id,
        reason: selectedReason,
      });

      if (closureError) throw closureError;

      toast.success("Role closed successfully");
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      console.error("Failed to close role:", err);
      toast.error("Failed to close role");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Close Role: {jobTitle}</DialogTitle>
          <DialogDescription>
            {step === "choice" && "How would you like to close this role?"}
            {step === "select-candidate" && "Select the candidate you hired"}
            {step === "select-reason" && "Why is this role being closed?"}
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {step === "choice" && (
            <motion.div
              key="choice"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3 pt-4"
            >
              <Button
                variant="outline"
                className="w-full h-auto py-4 flex items-start gap-4 justify-start text-left"
                onClick={handleMatchFound}
              >
                <div className="p-2 rounded-full bg-success/10">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="font-medium">We found a match on Emploid</p>
                  <p className="text-sm text-muted-foreground">
                    Select the candidate you hired
                  </p>
                </div>
              </Button>

              <Button
                variant="outline"
                className="w-full h-auto py-4 flex items-start gap-4 justify-start text-left"
                onClick={handleCloseWithoutHiring}
              >
                <div className="p-2 rounded-full bg-muted">
                  <XCircle className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">Close without hiring</p>
                  <p className="text-sm text-muted-foreground">
                    The role was filled elsewhere or cancelled
                  </p>
                </div>
              </Button>
            </motion.div>
          )}

          {step === "select-candidate" && (
            <motion.div
              key="select-candidate"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4 pt-4"
            >
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : candidates.length === 0 ? (
                <div className="text-center py-6">
                  <User className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No candidates matched yet</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2"
                    onClick={() => setStep("choice")}
                  >
                    Go back
                  </Button>
                </div>
              ) : (
                <>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {candidates.map((candidate) => (
                      <div
                        key={candidate.candidate_id}
                        onClick={() => setSelectedCandidate(candidate.candidate_id)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedCandidate === candidate.candidate_id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={candidate.avatar} />
                            <AvatarFallback>
                              {candidate.name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{candidate.name}</p>
                            {candidate.job_title && (
                              <p className="text-sm text-muted-foreground">
                                {candidate.job_title}
                              </p>
                            )}
                          </div>
                          {selectedCandidate === candidate.candidate_id && (
                            <CheckCircle2 className="w-5 h-5 text-primary ml-auto" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setStep("choice")}
                    >
                      Back
                    </Button>
                    <Button
                      className="flex-1"
                      disabled={!selectedCandidate || isSubmitting}
                      onClick={handleConfirmHire}
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : null}
                      Confirm Hire
                    </Button>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {step === "select-reason" && (
            <motion.div
              key="select-reason"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4 pt-4"
            >
              <Select value={selectedReason} onValueChange={setSelectedReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  {UNFILLED_REASONS.map((reason) => (
                    <SelectItem key={reason.value} value={reason.value}>
                      {reason.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep("choice")}
                >
                  Back
                </Button>
                <Button
                  className="flex-1"
                  disabled={!selectedReason || isSubmitting}
                  onClick={handleConfirmUnfilled}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Close Role
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
