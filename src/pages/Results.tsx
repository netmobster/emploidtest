import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { SAMPLE_JOBS, ROLES } from "@/lib/gameData";
import { Button } from "@/components/ui/button";
import { MapPin, DollarSign, Briefcase, ArrowLeft, Sparkles } from "lucide-react";

const Results = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const role = searchParams.get("role") || "";
  const userType = searchParams.get("type") || "candidate";

  const roleInfo = ROLES.find((r) => r.id === role);
  const matchedJobs = SAMPLE_JOBS.filter((job) => job.roleId === role);

  // Generate random match scores for demo
  const jobsWithScores = matchedJobs.map((job) => ({
    ...job,
    matchScore: Math.floor(Math.random() * 30) + 70, // 70-99%
  })).sort((a, b) => b.matchScore - a.matchScore);

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="container max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => navigate(`/roles?type=${userType}`)}
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
            Based on your preferences, here are your top matches
          </p>
        </motion.div>

        <div className="space-y-4">
          {jobsWithScores.map((job, index) => (
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
                    <h3 className="text-lg font-semibold text-foreground">
                      {job.title}
                    </h3>
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
                <Button variant="outline">
                  Save
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {jobsWithScores.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No jobs found for this role yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Results;
