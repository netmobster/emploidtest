import { useState, useEffect } from "react";
import { Star, Loader2, Briefcase } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useShortlist } from "@/hooks/useShortlist";

interface Job {
  id: string;
  title: string;
  company: string;
}

interface AddToShortlistDialogProps {
  isOpen: boolean;
  onClose: () => void;
  candidateId: string;
  candidateName?: string;
  defaultJobId?: string;
}

export function AddToShortlistDialog({
  isOpen,
  onClose,
  candidateId,
  candidateName,
  defaultJobId,
}: AddToShortlistDialogProps) {
  const { user } = useAuth();
  const { addToShortlist, isLoading: isAdding } = useShortlist();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [selectedJobId, setSelectedJobId] = useState<string>(defaultJobId || "");
  const [notes, setNotes] = useState("");

  // Fetch employer's jobs
  useEffect(() => {
    if (!user || !isOpen) return;

    const fetchJobs = async () => {
      setIsLoadingJobs(true);
      try {
        const { data, error } = await supabase
          .from("jobs")
          .select("id, title, company")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setJobs(data || []);

        // Auto-select default or first job
        if (data && data.length > 0) {
          setSelectedJobId(defaultJobId || data[0].id);
        }
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setIsLoadingJobs(false);
      }
    };

    fetchJobs();
  }, [user, isOpen, defaultJobId]);

  const handleSubmit = async () => {
    if (!selectedJobId) return;

    const success = await addToShortlist(selectedJobId, candidateId, notes);
    if (success) {
      setNotes("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-primary" />
            Add to Shortlist
            {candidateName && (
              <span className="text-muted-foreground font-normal">
                - {candidateName}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        {isLoadingJobs ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-8">
            <Briefcase className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No roles found</p>
            <p className="text-sm text-muted-foreground">
              Create a job posting first to add candidates to shortlists.
            </p>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <div className="space-y-3">
              <Label>Select Role</Label>
              <RadioGroup
                value={selectedJobId}
                onValueChange={setSelectedJobId}
                className="space-y-2"
              >
                {jobs.map((job) => (
                  <label
                    key={job.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-secondary/50 cursor-pointer transition-colors"
                  >
                    <RadioGroupItem value={job.id} />
                    <div>
                      <p className="font-medium text-sm">{job.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {job.company}
                      </p>
                    </div>
                  </label>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Why are they a good fit for this role?"
                rows={3}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isAdding || !selectedJobId || jobs.length === 0}
          >
            {isAdding ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              "Add to Shortlist"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
