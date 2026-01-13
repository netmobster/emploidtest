import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Building2, 
  Globe, 
  Users, 
  MapPin, 
  Briefcase, 
  ArrowLeft,
  Loader2,
  ExternalLink,
  Sparkles,
  Heart,
  CheckCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Logo from "@/components/Logo";
import { CompanyCultureSection } from "@/components/culture/CompanyCultureSection";
import { CultureCompatibilityBadge } from "@/components/culture/CultureCompatibilityBadge";
import { HiringTeamSection } from "@/components/profile/HiringTeamSection";
import { ProfileCompleteBadge } from "@/components/profile/ProfileCompleteBadge";
import { SynergyScoreModal } from "@/components/SynergyScoreModal";
import { useAuth } from "@/contexts/AuthContext";
import { getPrimaryBadge } from "@/lib/badgeUtils";
import { calculateSynergyCompatibility, getCompatibilityLabel } from "@/lib/synergyUtils";
import { calculateCultureCompatibility } from "@/lib/cultureUtils";
import { Json } from "@/integrations/supabase/types";

interface CompanyProfileData {
  id: string;
  user_id: string;
  full_name: string | null;
  company_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  cover_image_url: string | null;
  company_website: string | null;
  company_size: string | null;
  company_industry: string | null;
  company_location: string | null;
  culture_preferences: Record<string, string> | null;
  synergy_scores: Record<string, number> | null;
  has_completed_synergy_quiz: boolean | null;
  has_completed_culture_game: boolean | null;
  linkedin_url: string | null;
}

interface Job {
  id: string;
  title: string;
  city_id: string;
  salary: string | null;
  type: string | null;
  remote: boolean | null;
  created_at: string;
  description: string | null;
  requirements: string[] | null;
  benefits: string[] | null;
}

export default function CompanyProfile() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { profile: currentUserProfile } = useAuth();
  const [company, setCompany] = useState<CompanyProfileData | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
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

    const fetchCompanyData = async () => {
      try {
        // Fetch company profile with all fields
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", userId)
          .eq("user_type", "employer")
          .single();

        if (profileError) throw profileError;
        
        const companyData = {
          ...profileData,
          culture_preferences: profileData.culture_preferences as Record<string, string> | null,
          synergy_scores: profileData.synergy_scores as Record<string, number> | null,
        };
        
        setCompany(companyData);

        // Fetch company jobs with full details
        const { data: jobsData, error: jobsError } = await supabase
          .from("jobs")
          .select("id, title, city_id, salary, type, remote, created_at, description, requirements, benefits")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(10);

        if (!jobsError && jobsData) {
          setJobs(jobsData);
        }

        // Calculate synergy compatibility
        const currentUserSynergy = currentUserProfile?.synergy_scores as Record<string, number> | null;
        if (currentUserSynergy && companyData.synergy_scores) {
          const compatibility = calculateSynergyCompatibility(currentUserSynergy, companyData.synergy_scores);
          setSynergyCompatibility(compatibility > 0 ? compatibility : null);
        }

        // Calculate culture compatibility
        const currentUserCulture = currentUserProfile?.culture_preferences as Record<string, string> | null;
        if (currentUserCulture && companyData.culture_preferences) {
          const compatibility = calculateCultureCompatibility(currentUserCulture, companyData.culture_preferences);
          if (compatibility.score > 0) {
            setCultureCompatibility(compatibility);
          }
        }
      } catch (error) {
        console.error("Error fetching company data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanyData();
  }, [userId, currentUserProfile]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Building2 className="w-16 h-16 text-muted-foreground/50 mb-4" />
        <h1 className="text-xl font-semibold text-foreground mb-2">Company Not Found</h1>
        <p className="text-muted-foreground mb-4">This company profile doesn't exist.</p>
        <Button onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  const primaryBadge = company.synergy_scores ? getPrimaryBadge(company.synergy_scores) : null;

  // Check if profile is complete
  const isProfileComplete = !!(
    company.company_name &&
    company.company_location &&
    company.avatar_url &&
    company.bio &&
    company.company_industry &&
    company.has_completed_synergy_quiz &&
    company.has_completed_culture_game
  );

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
        {company.cover_image_url && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full h-48 sm:h-64 rounded-xl overflow-hidden"
          >
            <img 
              src={company.cover_image_url} 
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

        {/* Company Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl p-6 sm:p-8 shadow-card border border-border"
        >
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24 sm:h-32 sm:w-32">
                <AvatarImage src={company.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-3xl">
                  {company.company_name?.charAt(0) || "C"}
                </AvatarFallback>
              </Avatar>
              {company.has_completed_synergy_quiz && (
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
                  {company.company_name || "Company Name"}
                </h1>
                {isProfileComplete && <ProfileCompleteBadge />}
                {primaryBadge && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    {primaryBadge.title}
                  </Badge>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {company.company_industry && (
                  <Badge variant="secondary">
                    <Briefcase className="h-3 w-3 mr-1" />
                    {company.company_industry}
                  </Badge>
                )}
                {company.company_size && (
                  <Badge variant="outline">
                    <Users className="h-3 w-3 mr-1" />
                    {company.company_size}
                  </Badge>
                )}
                {company.company_location && (
                  <Badge variant="outline">
                    <MapPin className="h-3 w-3 mr-1" />
                    {company.company_location}
                  </Badge>
                )}
              </div>

              {company.bio && (
                <p className="text-muted-foreground leading-relaxed">{company.bio}</p>
              )}

              {/* Links */}
              <div className="flex flex-wrap gap-3 mt-4">
                {company.company_website && (
                  <a
                    href={company.company_website.startsWith('http') ? company.company_website : `https://${company.company_website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline text-sm"
                  >
                    <Globe className="h-4 w-4" />
                    {company.company_website.replace(/^https?:\/\//, '')}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                {company.linkedin_url && (
                  <a
                    href={company.linkedin_url.startsWith('http') ? company.linkedin_url : `https://${company.linkedin_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline text-sm"
                  >
                    <Globe className="h-4 w-4" />
                    LinkedIn
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

        {/* Company Culture Section */}
        {company.culture_preferences && Object.keys(company.culture_preferences).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-xl p-6 shadow-card border border-border"
          >
            <CompanyCultureSection
              culturePreferences={company.culture_preferences}
            />
          </motion.div>
        )}

        {/* Synergy Scores Section */}
        {company.has_completed_synergy_quiz && company.synergy_scores && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
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
                      {company.company_name} has completed their Synergy Score assessment.
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

        {/* Hiring Team Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <HiringTeamSection />
        </motion.div>

        {/* Open Positions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Briefcase className="h-5 w-5 text-primary" />
                Open Positions ({jobs.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {jobs.length === 0 ? (
                <div className="text-center py-8">
                  <Briefcase className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground">No open positions at the moment</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {jobs.map((job, index) => (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.05 }}
                      className="p-4 rounded-lg border border-border bg-secondary/30 hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground text-lg">{job.title}</h3>
                          {job.description && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {job.description}
                            </p>
                          )}
                          <div className="flex flex-wrap items-center gap-2 mt-3">
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <MapPin className="h-3.5 w-3.5" />
                              <span>{job.city_id}</span>
                            </div>
                            {job.salary && (
                              <span className="text-sm font-medium text-foreground">{job.salary}</span>
                            )}
                            {job.remote && (
                              <Badge variant="secondary" className="text-xs">Remote</Badge>
                            )}
                            {job.type && (
                              <Badge variant="outline" className="text-xs">{job.type}</Badge>
                            )}
                          </div>
                          {job.benefits && job.benefits.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {job.benefits.slice(0, 3).map((benefit, i) => (
                                <Badge key={i} variant="outline" className="text-xs bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
                                  {benefit}
                                </Badge>
                              ))}
                              {job.benefits.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{job.benefits.length - 3} more
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                        <Button size="sm" onClick={() => navigate("/swipe/candidate")}>
                          View
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>

      {/* Synergy Score Modal */}
      {company.synergy_scores && (
        <SynergyScoreModal
          isOpen={synergyModalOpen}
          onClose={() => setSynergyModalOpen(false)}
          userName={company.company_name || "Company"}
          scores={company.synergy_scores}
        />
      )}
    </div>
  );
}
