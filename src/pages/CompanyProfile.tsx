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
  ExternalLink
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Logo from "@/components/Logo";

interface CompanyProfile {
  id: string;
  user_id: string;
  company_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  company_website: string | null;
  company_size: string | null;
  company_industry: string | null;
  company_location: string | null;
}

interface Job {
  id: string;
  title: string;
  city_id: string;
  salary: string | null;
  type: string | null;
  remote: boolean | null;
  created_at: string;
}

export default function CompanyProfile() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchCompanyData = async () => {
      try {
        // Fetch company profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", userId)
          .eq("user_type", "employer")
          .single();

        if (profileError) throw profileError;
        setCompany(profileData);

        // Fetch company jobs
        const { data: jobsData, error: jobsError } = await supabase
          .from("jobs")
          .select("id, title, city_id, salary, type, remote, created_at")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(10);

        if (!jobsError && jobsData) {
          setJobs(jobsData);
        }
      } catch (error) {
        console.error("Error fetching company data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanyData();
  }, [userId]);

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
        {/* Company Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl p-6 sm:p-8 shadow-card border border-border mb-6"
        >
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <Avatar className="h-24 w-24 sm:h-32 sm:w-32">
              <AvatarImage src={company.avatar_url || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary text-3xl">
                {company.company_name?.charAt(0) || "C"}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                {company.company_name || "Company Name"}
              </h1>
              
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
                <p className="text-muted-foreground">{company.bio}</p>
              )}

              {company.company_website && (
                <a
                  href={company.company_website.startsWith('http') ? company.company_website : `https://${company.company_website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-4 text-primary hover:underline"
                >
                  <Globe className="h-4 w-4" />
                  {company.company_website.replace(/^https?:\/\//, '')}
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
        </motion.div>

        {/* Open Positions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-xl p-6 shadow-card border border-border"
        >
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            Open Positions
          </h2>

          {jobs.length === 0 ? (
            <div className="text-center py-8">
              <Briefcase className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-muted-foreground">No open positions at the moment</p>
            </div>
          ) : (
            <div className="space-y-3">
              {jobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + index * 0.05 }}
                  className="p-4 rounded-lg border border-border bg-secondary/30 hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground">{job.title}</h3>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5" />
                          <span>{job.city_id}</span>
                        </div>
                        {job.salary && (
                          <span className="text-sm text-muted-foreground">• {job.salary}</span>
                        )}
                        {job.remote && (
                          <Badge variant="secondary" className="text-xs">Remote</Badge>
                        )}
                        {job.type && (
                          <Badge variant="outline" className="text-xs">{job.type}</Badge>
                        )}
                      </div>
                    </div>
                    <Button size="sm" onClick={() => navigate("/swipe/candidate")}>
                      Apply
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
