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
  Sparkles,
  Clock,
  Wifi,
  FileText,
  Heart,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Logo from "@/components/Logo";
import { getPrimaryBadge } from "@/lib/badgeUtils";
import { SynergyScoreModal } from "@/components/SynergyScoreModal";
import { CompanyCultureSection } from "@/components/culture/CompanyCultureSection";
import { CultureCompatibilityBadge } from "@/components/culture/CultureCompatibilityBadge";
import { ProfileCompleteBadge } from "@/components/profile/ProfileCompleteBadge";
import { useAuth } from "@/contexts/AuthContext";
import { calculateSynergyCompatibility, getCompatibilityLabel } from "@/lib/synergyUtils";
import { calculateCultureCompatibility } from "@/lib/cultureUtils";

interface CandidateProfileData {
  id: string;
  user_id: string;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  cover_image_url: string | null;
  job_title: string | null;
  location: string | null;
  years_of_experience: string | null;
  availability: string | null;
  remote_preference: string | null;
  skills: string[] | null;
  linkedin_url: string | null;
  website_url: string | null;
  portfolio_url: string | null;
  resume_url: string | null;
  has_completed_synergy_quiz: boolean | null;
  has_completed_culture_game: boolean | null;
  has_completed_extended_profile: boolean | null;
  synergy_scores: Record<string, number> | null;
  culture_preferences: Record<string, string> | null;
  email: string | null;
}

export default function CandidateProfile() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { profile: currentUserProfile } = useAuth();
  const [candidate, setCandidate] = useState<CandidateProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [synergyModalOpen, setSynergyModalOpen] = useState(false);
  const [synergyCompatibility, setSynergyCompatibility] = useState<number | null>(null);
  const [cultureCompatibility, setCultureCompatibility] = useState<{
    score: number;
    matchingAreas: string[];
    differingAreas: string[];
  } | null>(null);

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
        
        const candidateData = {
          ...profileData,
          synergy_scores: profileData.synergy_scores as Record<string, number> | null,
          culture_preferences: profileData.culture_preferences as Record<string, string> | null,
        };
        
        setCandidate(candidateData);

        // Calculate synergy compatibility if both users have synergy scores
        const currentUserSynergy = currentUserProfile?.synergy_scores as Record<string, number> | null;
        if (currentUserSynergy && candidateData.synergy_scores) {
          const compatibility = calculateSynergyCompatibility(currentUserSynergy, candidateData.synergy_scores);
          setSynergyCompatibility(compatibility > 0 ? compatibility : null);
        }

        // Calculate culture compatibility if both users have culture preferences
        const currentUserCulture = currentUserProfile?.culture_preferences as Record<string, string> | null;
        if (currentUserCulture && candidateData.culture_preferences) {
          const compatibility = calculateCultureCompatibility(currentUserCulture, candidateData.culture_preferences);
          if (compatibility.score > 0) {
            setCultureCompatibility(compatibility);
          }
        }
      } catch (error) {
        console.error("Error fetching candidate data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCandidateData();
  }, [userId, currentUserProfile]);

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
  
  // Check if profile is complete
  const isProfileComplete = !!(
    candidate.full_name &&
    candidate.job_title &&
    candidate.location &&
    candidate.avatar_url &&
    candidate.bio &&
    candidate.skills?.length &&
    candidate.has_completed_synergy_quiz &&
    candidate.has_completed_culture_game
  );

  const getRemoteLabel = (pref: string | null) => {
    switch (pref) {
      case 'remote': return 'Remote Only';
      case 'hybrid': return 'Hybrid';
      case 'onsite': return 'On-site';
      case 'flexible': return 'Flexible';
      default: return pref;
    }
  };

  const getAvailabilityLabel = (avail: string | null) => {
    switch (avail) {
      case 'immediately': return 'Available Immediately';
      case '2-weeks': return '2 Weeks Notice';
      case '1-month': return '1 Month Notice';
      case '3-months': return '3+ Months';
      default: return avail;
    }
  };

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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Cover Image */}
        {candidate.cover_image_url && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full h-48 sm:h-64 rounded-xl overflow-hidden"
          >
            <img 
              src={candidate.cover_image_url} 
              alt="Cover" 
              className="w-full h-full object-cover"
            />
          </motion.div>
        )}

        {/* Compatibility Banners */}
        {(synergyCompatibility || cultureCompatibility) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap items-center justify-center gap-3"
          >
            {synergyCompatibility && synergyCompatibility > 0 && (
              <div className="flex items-center gap-2 py-2 px-4 bg-primary/10 rounded-xl border border-primary/20">
                <Heart className="w-4 h-4 text-primary" />
                <span className="font-medium text-primary text-sm">
                  {synergyCompatibility}% Synergy • {getCompatibilityLabel(synergyCompatibility)}
                </span>
              </div>
            )}
            {cultureCompatibility && cultureCompatibility.score > 0 && (
              <CultureCompatibilityBadge
                score={cultureCompatibility.score}
                matchingAreas={cultureCompatibility.matchingAreas}
                differingAreas={cultureCompatibility.differingAreas}
              />
            )}
          </motion.div>
        )}

        {/* Candidate Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl p-6 sm:p-8 shadow-card border border-border"
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
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                  {candidate.full_name || "Candidate"}
                </h1>
                {isProfileComplete && <ProfileCompleteBadge />}
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
                    <Wifi className="h-3 w-3 mr-1" />
                    {getRemoteLabel(candidate.remote_preference)}
                  </Badge>
                )}
                {candidate.availability && (
                  <Badge variant="outline">
                    <Clock className="h-3 w-3 mr-1" />
                    {getAvailabilityLabel(candidate.availability)}
                  </Badge>
                )}
              </div>

              {candidate.bio && (
                <p className="text-muted-foreground leading-relaxed">{candidate.bio}</p>
              )}

              {/* Links */}
              <div className="flex flex-wrap gap-3 mt-4">
                {candidate.linkedin_url && (
                  <a
                    href={candidate.linkedin_url.startsWith('http') ? candidate.linkedin_url : `https://${candidate.linkedin_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline text-sm"
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
                    className="inline-flex items-center gap-1 text-primary hover:underline text-sm"
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
                    className="inline-flex items-center gap-1 text-primary hover:underline text-sm"
                  >
                    <Briefcase className="h-4 w-4" />
                    Portfolio
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                {candidate.resume_url && (
                  <a
                    href={candidate.resume_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline text-sm"
                  >
                    <FileText className="h-4 w-4" />
                    Resume
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Culture Compatibility Details (if available) */}
        {cultureCompatibility && cultureCompatibility.score > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <CultureCompatibilityBadge
              score={cultureCompatibility.score}
              matchingAreas={cultureCompatibility.matchingAreas}
              differingAreas={cultureCompatibility.differingAreas}
              showDetails
            />
          </motion.div>
        )}

        {/* Skills Section */}
        {candidate.skills && candidate.skills.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Briefcase className="h-5 w-5 text-primary" />
                  Skills & Expertise
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {candidate.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-sm">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Work Preferences Section */}
        {(candidate.remote_preference || candidate.availability) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="h-5 w-5 text-primary" />
                  Work Preferences
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {candidate.remote_preference && (
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <Wifi className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Work Location</p>
                        <p className="font-medium">{getRemoteLabel(candidate.remote_preference)}</p>
                      </div>
                    </div>
                  )}
                  {candidate.availability && (
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Availability</p>
                        <p className="font-medium">{getAvailabilityLabel(candidate.availability)}</p>
                      </div>
                    </div>
                  )}
                  {candidate.years_of_experience && (
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <Briefcase className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Experience</p>
                        <p className="font-medium">{candidate.years_of_experience} years</p>
                      </div>
                    </div>
                  )}
                  {candidate.location && (
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Location</p>
                        <p className="font-medium">{candidate.location}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Culture Preferences Section */}
        {candidate.culture_preferences && Object.keys(candidate.culture_preferences).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <CompanyCultureSection 
              culturePreferences={candidate.culture_preferences} 
              title="Work Culture Preferences"
            />
          </motion.div>
        )}

        {/* Synergy Scores Section */}
        {candidate.has_completed_synergy_quiz && candidate.synergy_scores && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Synergy Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground mb-2">
                      {candidate.full_name} has completed their Synergy Score assessment.
                    </p>
                    {primaryBadge && (
                      <div className="flex items-center gap-2">
                        <Badge className="bg-primary/10 text-primary border-primary/20">
                          <Sparkles className="w-3 h-3 mr-1" />
                          {primaryBadge.title}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {primaryBadge.description}
                        </span>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setSynergyModalOpen(true)}
                    className="flex-shrink-0"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
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
