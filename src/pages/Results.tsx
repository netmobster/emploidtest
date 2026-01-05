import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { SAMPLE_JOBS, ROLES } from "@/lib/gameData";
import { Button } from "@/components/ui/button";
import { MapPin, DollarSign, Briefcase, ArrowLeft, Sparkles, Loader2, Heart, HeartOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import Logo from "@/components/Logo";
import ProfileHeader from "@/components/ProfileHeader";

interface DatabaseJob {
  id: string;
  title: string;
  company: string;
  role_id: string;
  city_id: string;
  description: string | null;
  salary: string | null;
  type: string | null;
  remote: boolean | null;
}

interface JobWithScore {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  remote: string;
  description: string;
  logo: string;
  matchScore: number;
  isFromDatabase: boolean;
}

const Results = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = searchParams.get("role") || "";
  const cityId = searchParams.get("city") || "new-york";
  const userType = searchParams.get("type") || "candidate";

  const [databaseJobs, setDatabaseJobs] = useState<DatabaseJob[]>([]);
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [savingJobId, setSavingJobId] = useState<string | null>(null);

  const roleInfo = ROLES.find((r) => r.id === role);
  const cityName = cityId === "toronto" ? "Toronto, ON" : "New York, NY";

  // Fetch jobs and saved jobs from database
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      // Fetch jobs
      const { data: jobsData, error: jobsError } = await supabase
        .from("jobs")
        .select("*")
        .eq("role_id", role)
        .eq("city_id", cityId);

      if (!jobsError && jobsData) {
        setDatabaseJobs(jobsData);
      }

      // Fetch saved jobs if user is logged in
      if (user) {
        const { data: savedData, error: savedError } = await supabase
          .from("saved_jobs")
          .select("job_id")
          .eq("user_id", user.id);

        if (!savedError && savedData) {
          setSavedJobIds(new Set(savedData.map(s => s.job_id)));
        }
      }
      
      setIsLoading(false);
    };

    fetchData();
  }, [role, cityId, user]);

  const handleSaveJob = async (jobId: string, isFromDatabase: boolean) => {
    if (!user) {
      toast.error("Please sign in to save jobs");
      navigate(`/auth?type=${userType}`);
      return;
    }

    if (!isFromDatabase) {
      toast.info("This is a sample job. You can save real employer-posted jobs!");
      return;
    }

    setSavingJobId(jobId);
    
    const isSaved = savedJobIds.has(jobId);

    if (isSaved) {
      // Unsave
      const { error } = await supabase
        .from("saved_jobs")
        .delete()
        .eq("user_id", user.id)
        .eq("job_id", jobId);

      if (error) {
        toast.error("Failed to unsave job");
      } else {
        setSavedJobIds(prev => {
          const next = new Set(prev);
          next.delete(jobId);
          return next;
        });
        toast.success("Job removed from saved");
      }
    } else {
      // Save
      const { error } = await supabase
        .from("saved_jobs")
        .insert({ user_id: user.id, job_id: jobId });

      if (error) {
        toast.error("Failed to save job");
      } else {
        setSavedJobIds(prev => new Set(prev).add(jobId));
        toast.success("Job saved!");
      }
    }

    setSavingJobId(null);
  };

  // Get sample jobs for this role
  const sampleJobs = SAMPLE_JOBS.filter((job) => job.roleId === role);

  // Combine database jobs and sample jobs
  const allJobs: JobWithScore[] = [
    // Database jobs first (real employer postings)
    ...databaseJobs.map((job) => ({
      id: job.id,
      title: job.title,
      company: job.company,
      location: cityName,
      salary: job.salary || "Competitive",
      type: job.type || "Full-time",
      remote: job.remote ? "Remote" : "Onsite",
      description: job.description || "",
      logo: "🏢",
      matchScore: Math.floor(Math.random() * 15) + 85,
      isFromDatabase: true,
    })),
    // Sample jobs
    ...sampleJobs.map((job) => ({
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      salary: job.salary,
      type: job.type,
      remote: job.remote,
      description: job.description,
      logo: job.logo,
      matchScore: Math.floor(Math.random() * 30) + 70,
      isFromDatabase: false,
    })),
  ].sort((a, b) => b.matchScore - a.matchScore);

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      {/* Profile Header */}
      <div className="absolute top-4 right-4 z-10">
        <ProfileHeader />
      </div>
      
      <div className="container max-w-2xl mx-auto">
        <Logo size="sm" className="mx-auto mb-6" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => navigate(`/roles?type=${userType}&city=${cityId}`)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Roles
          </Button>
          
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
            <Sparkles className="w-4 h-4" />
            <span className="font-medium">Your Matches Are Ready!</span>
          </div>
          
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {roleInfo?.title} Opportunities
          </h1>
          <p className="text-muted-foreground">
            Based on your preferences, here are your top matches in {cityId === "toronto" ? "Toronto" : "New York"}
          </p>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            {allJobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-2xl p-6 shadow-card hover:shadow-elegant transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{job.logo}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-foreground">
                          {job.title}
                        </h3>
                        {job.isFromDatabase && (
                          <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full">
                            New
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 bg-accent/20 text-accent px-3 py-1 rounded-full">
                        <span className="text-sm font-bold">{job.matchScore}%</span>
                        <span className="text-xs">match</span>
                      </div>
                    </div>
                    
                    <p className="text-primary font-medium mb-2">{job.company}</p>
                    <p className="text-muted-foreground text-sm mb-3">{job.description}</p>
                    
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {job.salary}
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        {job.remote}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-border flex gap-3">
                  <Button className="flex-1" variant="default">
                    Apply Now
                  </Button>
                  <Button 
                    variant={savedJobIds.has(job.id) ? "default" : "outline"}
                    onClick={() => handleSaveJob(job.id, job.isFromDatabase)}
                    disabled={savingJobId === job.id}
                  >
                    {savingJobId === job.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : savedJobIds.has(job.id) ? (
                      <Heart className="w-4 h-4 fill-current" />
                    ) : (
                      <HeartOff className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {!isLoading && allJobs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No jobs found for this role yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Results;