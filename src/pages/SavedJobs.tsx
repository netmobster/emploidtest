import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Bookmark, Briefcase, MapPin, Clock, Trash2, Loader2, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Logo from "@/components/Logo";
import ProfileHeader from "@/components/ProfileHeader";
import { useJobApplication } from "@/hooks/useJobApplication";

interface SavedJob {
  id: string;
  saved_at: string;
  job: {
    id: string;
    title: string;
    company: string;
    description: string | null;
    salary: string | null;
    type: string | null;
    remote: boolean | null;
    city_id: string;
    requirements: string[] | null;
    benefits: string[] | null;
  };
  employer_profile?: {
    avatar_url: string | null;
    company_name: string | null;
  };
}

export default function SavedJobs() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteJobId, setDeleteJobId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { createApplication } = useJobApplication();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }

    if (user) {
      fetchSavedJobs();
    }
  }, [user, authLoading, navigate]);

  const fetchSavedJobs = async () => {
    if (!user) return;

    try {
      const { data: savedData, error } = await supabase
        .from("saved_jobs")
        .select(`
          id,
          created_at,
          job_id,
          jobs (
            id,
            title,
            company,
            description,
            salary,
            type,
            remote,
            city_id,
            requirements,
            benefits,
            user_id
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch employer profiles for each job
      const jobsWithProfiles: SavedJob[] = [];
      for (const saved of savedData || []) {
        const job = saved.jobs as any;
        if (!job) continue;

        let employerProfile = null;
        if (job.user_id) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("avatar_url, company_name")
            .eq("user_id", job.user_id)
            .maybeSingle();
          employerProfile = profile;
        }

        jobsWithProfiles.push({
          id: saved.id,
          saved_at: saved.created_at,
          job: {
            id: job.id,
            title: job.title,
            company: job.company,
            description: job.description,
            salary: job.salary,
            type: job.type,
            remote: job.remote,
            city_id: job.city_id,
            requirements: job.requirements,
            benefits: job.benefits,
          },
          employer_profile: employerProfile || undefined,
        });

        // Auto-create job application for saved jobs
        await createApplication({
          jobId: job.id,
          status: "saved",
        });
      }

      setSavedJobs(jobsWithProfiles);
    } catch (error) {
      console.error("Error fetching saved jobs:", error);
      toast.error("Failed to load saved jobs");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveJob = async () => {
    if (!deleteJobId) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("saved_jobs")
        .delete()
        .eq("id", deleteJobId);

      if (error) throw error;

      setSavedJobs(savedJobs.filter(j => j.id !== deleteJobId));
      toast.success("Job removed from saved list");
    } catch (error) {
      console.error("Error removing saved job:", error);
      toast.error("Failed to remove job");
    } finally {
      setIsDeleting(false);
      setDeleteJobId(null);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <Logo size="sm" />
              <h1 className="text-lg font-semibold text-foreground hidden sm:block">
                Saved Jobs
              </h1>
            </div>
            <ProfileHeader />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <Bookmark className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Your Saved Jobs</h2>
          </div>
          <p className="text-muted-foreground">
            {savedJobs.length} {savedJobs.length === 1 ? "job" : "jobs"} saved
          </p>
        </motion.div>

        {savedJobs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Bookmark className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No saved jobs yet</h3>
            <p className="text-muted-foreground mb-6">
              Start browsing jobs and save the ones you're interested in!
            </p>
            <Button onClick={() => navigate("/city?type=candidate")}>
              <Briefcase className="w-4 h-4 mr-2" />
              Browse Jobs
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {savedJobs.map((saved, index) => (
              <motion.div
                key={saved.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-card rounded-xl p-5 shadow-card border border-border hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <Avatar className="w-14 h-14 flex-shrink-0">
                    <AvatarImage src={saved.employer_profile?.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      <Building2 className="w-6 h-6" />
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-foreground text-lg truncate">
                          {saved.job.title}
                        </h3>
                        <p className="text-muted-foreground">
                          {saved.employer_profile?.company_name || saved.job.company}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="flex-shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={() => setDeleteJobId(saved.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      {saved.job.city_id && (
                        <Badge variant="secondary" className="gap-1">
                          <MapPin className="w-3 h-3" />
                          {saved.job.city_id}
                        </Badge>
                      )}
                      {saved.job.type && (
                        <Badge variant="secondary" className="gap-1">
                          <Clock className="w-3 h-3" />
                          {saved.job.type}
                        </Badge>
                      )}
                      {saved.job.remote && (
                        <Badge variant="outline">Remote</Badge>
                      )}
                      {saved.job.salary && (
                        <Badge variant="outline">{saved.job.salary}</Badge>
                      )}
                    </div>

                    {saved.job.description && (
                      <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                        {saved.job.description}
                      </p>
                    )}

                    {saved.job.requirements && saved.job.requirements.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {saved.job.requirements.slice(0, 4).map((req, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {req}
                          </Badge>
                        ))}
                        {saved.job.requirements.length > 4 && (
                          <Badge variant="secondary" className="text-xs">
                            +{saved.job.requirements.length - 4} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteJobId} onOpenChange={() => setDeleteJobId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove saved job?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the job from your saved list. You can always save it again later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveJob}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
