import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  User, 
  Globe, 
  MapPin, 
  Briefcase, 
  ArrowLeft,
  Loader2,
  ExternalLink,
  Linkedin,
  Calendar,
  Sparkles
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Logo from "@/components/Logo";
import { getPrimaryBadge } from "@/lib/badgeUtils";
import { SynergyScoreModal } from "@/components/SynergyScoreModal";

interface CandidateProfileData {
  id: string;
  user_id: string;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  job_title: string | null;
  location: string | null;
  years_of_experience: string | null;
  availability: string | null;
  remote_preference: string | null;
  skills: string[] | null;
  linkedin_url: string | null;
  website_url: string | null;
  portfolio_url: string | null;
  has_completed_synergy_quiz: boolean | null;
  synergy_scores: Record<string, number> | null;
}

export default function CandidateProfile() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState<CandidateProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [synergyModalOpen, setSynergyModalOpen] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const fetchCandidateData = async () => {
      try {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", userId)
          .eq("user_type", "candidate")
          .single();

        if (profileError) throw profileError;
        setCandidate({
          ...profileData,
          synergy_scores: profileData.synergy_scores as Record<string, number> | null,
        });
      } catch (error) {
        console.error("Error fetching candidate data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCandidateData();
  }, [userId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <User className="w-16 h-16 text-muted-foreground/50 mb-4" />
        <h1 className="text-xl font-semibold text-foreground mb-2">Candidate Not Found</h1>
        <p className="text-muted-foreground mb-4">This candidate profile doesn't exist.</p>
        <Button onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  const primaryBadge = candidate.synergy_scores ? getPrimaryBadge(candidate.synergy_scores) : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <Logo size="sm" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Candidate Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl p-6 sm:p-8 shadow-card border border-border mb-6"
        >
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24 sm:h-32 sm:w-32">
                <AvatarImage src={candidate.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-3xl">
                  {candidate.full_name?.charAt(0) || "C"}
                </AvatarFallback>
              </Avatar>
              {candidate.has_completed_synergy_quiz && (
                <button
                  onClick={() => setSynergyModalOpen(true)}
                  className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                >
                  <Sparkles className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                  {candidate.full_name || "Candidate"}
                </h1>
                {primaryBadge && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    {primaryBadge.title}
                  </Badge>
                )}
              </div>
              
              {candidate.job_title && (
                <p className="text-lg text-muted-foreground mb-3">{candidate.job_title}</p>
              )}
              
              <div className="flex flex-wrap gap-2 mb-4">
                {candidate.location && (
                  <Badge variant="outline">
                    <MapPin className="h-3 w-3 mr-1" />
                    {candidate.location}
                  </Badge>
                )}
                {candidate.years_of_experience && (
                  <Badge variant="outline">
                    <Briefcase className="h-3 w-3 mr-1" />
                    {candidate.years_of_experience} years
                  </Badge>
                )}
                {candidate.remote_preference && (
                  <Badge variant="secondary">
                    {candidate.remote_preference}
                  </Badge>
                )}
                {candidate.availability && (
                  <Badge variant="outline">
                    <Calendar className="h-3 w-3 mr-1" />
                    {candidate.availability}
                  </Badge>
                )}
              </div>

              {candidate.bio && (
                <p className="text-muted-foreground">{candidate.bio}</p>
              )}

              {/* Links */}
              <div className="flex flex-wrap gap-3 mt-4">
                {candidate.linkedin_url && (
                  <a
                    href={candidate.linkedin_url.startsWith('http') ? candidate.linkedin_url : `https://${candidate.linkedin_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                {candidate.website_url && (
                  <a
                    href={candidate.website_url.startsWith('http') ? candidate.website_url : `https://${candidate.website_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    <Globe className="h-4 w-4" />
                    Website
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                {candidate.portfolio_url && (
                  <a
                    href={candidate.portfolio_url.startsWith('http') ? candidate.portfolio_url : `https://${candidate.portfolio_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    <Briefcase className="h-4 w-4" />
                    Portfolio
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Skills */}
        {candidate.skills && candidate.skills.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-xl p-6 shadow-card border border-border"
          >
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              Skills
            </h2>

            <div className="flex flex-wrap gap-2">
              {candidate.skills.map((skill, index) => (
                <Badge key={index} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </motion.div>
        )}
      </main>

      {/* Synergy Score Modal */}
      {candidate.synergy_scores && (
        <SynergyScoreModal
          isOpen={synergyModalOpen}
          onClose={() => setSynergyModalOpen(false)}
          userName={candidate.full_name || "Candidate"}
          scores={candidate.synergy_scores}
        />
      )}
    </div>
  );
}
