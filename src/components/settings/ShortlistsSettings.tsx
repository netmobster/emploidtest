import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Star,
  Briefcase,
  Loader2,
  ChevronDown,
  ChevronRight,
  User,
  Trash2,
  MessageSquare,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ShortlistCandidate {
  id: string;
  candidate_id: string;
  notes: string | null;
  created_at: string;
  candidate?: {
    full_name: string | null;
    avatar_url: string | null;
    job_title: string | null;
  };
}

interface JobWithShortlist {
  id: string;
  title: string;
  company: string;
  shortlists: ShortlistCandidate[];
}

export function ShortlistsSettings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<JobWithShortlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedJobs, setExpandedJobs] = useState<Set<string>>(new Set());
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchShortlists = async () => {
      setIsLoading(true);
      try {
        // Fetch all jobs
        const { data: jobsData, error: jobsError } = await supabase
          .from("jobs")
          .select("id, title, company")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (jobsError) throw jobsError;

        // Fetch all shortlists
        const { data: shortlistsData, error: shortlistsError } = await supabase
          .from("shortlists")
          .select("*")
          .eq("employer_id", user.id);

        if (shortlistsError) throw shortlistsError;

        // Fetch candidate profiles for shortlisted candidates
        const candidateIds = [...new Set(shortlistsData?.map((s) => s.candidate_id) || [])];
        let candidateProfiles: Record<string, any> = {};

        if (candidateIds.length > 0) {
          const { data: profilesData } = await supabase
            .from("profiles")
            .select("user_id, full_name, avatar_url, job_title")
            .in("user_id", candidateIds);

          if (profilesData) {
            candidateProfiles = profilesData.reduce((acc, p) => {
              acc[p.user_id] = p;
              return acc;
            }, {} as Record<string, any>);
          }
        }

        // Combine jobs with their shortlists
        const jobsWithShortlists: JobWithShortlist[] = (jobsData || []).map((job) => ({
          ...job,
          shortlists: (shortlistsData || [])
            .filter((s) => s.job_id === job.id)
            .map((s) => ({
              ...s,
              candidate: candidateProfiles[s.candidate_id] || null,
            })),
        }));

        setJobs(jobsWithShortlists);

        // Auto-expand jobs with shortlists
        const jobsWithCandidates = jobsWithShortlists
          .filter((j) => j.shortlists.length > 0)
          .map((j) => j.id);
        setExpandedJobs(new Set(jobsWithCandidates));
      } catch (error) {
        console.error("Error fetching shortlists:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchShortlists();
  }, [user]);

  const toggleExpand = (jobId: string) => {
    setExpandedJobs((prev) => {
      const next = new Set(prev);
      if (next.has(jobId)) {
        next.delete(jobId);
      } else {
        next.add(jobId);
      }
      return next;
    });
  };

  const handleRemove = async (shortlistId: string) => {
    setRemovingId(shortlistId);
    try {
      const { error } = await supabase
        .from("shortlists")
        .delete()
        .eq("id", shortlistId);

      if (error) throw error;

      setJobs((prev) =>
        prev.map((job) => ({
          ...job,
          shortlists: job.shortlists.filter((s) => s.id !== shortlistId),
        }))
      );
      toast.success("Removed from shortlist");
    } catch (error) {
      console.error("Error removing from shortlist:", error);
      toast.error("Failed to remove");
    } finally {
      setRemovingId(null);
    }
  };

  const totalShortlisted = jobs.reduce((sum, job) => sum + job.shortlists.length, 0);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
          <Star className="w-5 h-5 text-primary" />
          Shortlists by Role
          {totalShortlisted > 0 && (
            <Badge variant="secondary" className="ml-2">
              {totalShortlisted} candidate{totalShortlisted !== 1 ? "s" : ""}
            </Badge>
          )}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          View and manage candidates you've shortlisted for each role
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {jobs.length === 0 ? (
          <div className="text-center py-8">
            <Briefcase className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No roles created yet</p>
            <p className="text-sm text-muted-foreground">
              Create a job posting to start building shortlists
            </p>
          </div>
        ) : (
          jobs.map((job) => (
            <Collapsible
              key={job.id}
              open={expandedJobs.has(job.id)}
              onOpenChange={() => toggleExpand(job.id)}
            >
              <CollapsibleTrigger asChild>
                <button
                  className={cn(
                    "w-full flex items-center justify-between p-3 rounded-lg",
                    "border border-border hover:bg-secondary/50 transition-colors",
                    expandedJobs.has(job.id) && "bg-secondary/30"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Briefcase className="w-4 h-4 text-muted-foreground" />
                    <div className="text-left">
                      <p className="font-medium text-sm">{job.title}</p>
                      <p className="text-xs text-muted-foreground">{job.company}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={job.shortlists.length > 0 ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {job.shortlists.length}
                    </Badge>
                    {expandedJobs.has(job.id) ? (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </button>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <div className="mt-2 ml-4 space-y-2">
                  {job.shortlists.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-2 pl-4">
                      No candidates shortlisted for this role yet
                    </p>
                  ) : (
                    job.shortlists.map((shortlist, index) => (
                      <motion.div
                        key={shortlist.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg",
                          "border border-border bg-background"
                        )}
                      >
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={shortlist.candidate?.avatar_url || undefined} />
                          <AvatarFallback>
                            {shortlist.candidate?.full_name?.charAt(0) || "?"}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {shortlist.candidate?.full_name || "Unknown"}
                          </p>
                          {shortlist.candidate?.job_title && (
                            <p className="text-xs text-muted-foreground truncate">
                              {shortlist.candidate.job_title}
                            </p>
                          )}
                          {shortlist.notes && (
                            <p className="text-xs text-muted-foreground/70 truncate mt-1">
                              "{shortlist.notes}"
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => navigate(`/candidate/${shortlist.candidate_id}`)}
                          >
                            <User className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleRemove(shortlist.id)}
                            disabled={removingId === shortlist.id}
                          >
                            {removingId === shortlist.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4 text-destructive" />
                            )}
                          </Button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))
        )}
      </CardContent>
    </Card>
  );
}
