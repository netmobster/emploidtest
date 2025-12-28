import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { SAMPLE_CANDIDATES, ROLES } from "@/lib/gameData";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, GraduationCap, ArrowLeft, Sparkles, Briefcase } from "lucide-react";

const EmployerResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const role = searchParams.get("role") || "";
  const userType = searchParams.get("type") || "employer";

  const roleInfo = ROLES.find((r) => r.id === role);
  const matchedCandidates = SAMPLE_CANDIDATES.filter((c) => c.roleId === role);

  // Generate random match scores for demo
  const candidatesWithScores = matchedCandidates.map((candidate) => ({
    ...candidate,
    matchScore: Math.floor(Math.random() * 25) + 75, // 75-99%
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
            <span className="font-medium">Your Candidate Matches!</span>
          </div>
          
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {roleInfo?.title} Candidates
          </h1>
          <p className="text-muted-foreground">
            Based on your preferences, here are your top matches
          </p>
        </motion.div>

        <div className="space-y-4">
          {candidatesWithScores.map((candidate, index) => (
            <motion.div
              key={candidate.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-card rounded-2xl p-6 shadow-card hover:shadow-elegant transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl">{candidate.avatar}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-foreground">
                      {candidate.name}
                    </h3>
                    <div className="flex items-center gap-1 bg-accent/20 text-accent px-3 py-1 rounded-full">
                      <span className="text-sm font-bold">{candidate.matchScore}%</span>
                      <span className="text-xs">match</span>
                    </div>
                  </div>
                  
                  <p className="text-primary font-medium mb-1">{candidate.title}</p>
                  <p className="text-muted-foreground text-sm mb-3">{candidate.bio}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {candidate.skills.slice(0, 4).map((skill) => (
                      <span
                        key={skill}
                        className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                    {candidate.skills.length > 4 && (
                      <span className="text-xs text-muted-foreground">
                        +{candidate.skills.length - 4} more
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {candidate.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4" />
                      {candidate.experience}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {candidate.availability}
                    </span>
                    <span className="flex items-center gap-1">
                      <GraduationCap className="w-4 h-4" />
                      {candidate.remote}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-border flex gap-3">
                <Button className="flex-1" variant="default">
                  Contact
                </Button>
                <Button variant="outline">
                  Save
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {candidatesWithScores.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No candidates found for this role yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployerResults;
