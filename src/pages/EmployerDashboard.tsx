import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Briefcase, Users, Eye, TrendingUp, Loader2, BarChart3 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useEmployerStats } from "@/hooks/useEmployerStats";
import { useEmployerJobs } from "@/hooks/useEmployerJobs";
import { useEmployerActivity } from "@/hooks/useEmployerActivity";
import { useProfileCompletion } from "@/hooks/useProfileCompletion";
import { useProfileMilestones } from "@/hooks/useProfileMilestones";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { SynergyScoreChart } from "@/components/dashboard/SynergyScoreChart";
import { Category } from "@/data/questions";
import { JobCard } from "@/components/dashboard/JobCard";
import { ActivityItem } from "@/components/dashboard/ActivityItem";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { QuickActionsPanel } from "@/components/dashboard/QuickActionsPanel";
import { CompanyDetailsPanel } from "@/components/dashboard/CompanyDetailsPanel";
import { ProfileCompletionCard } from "@/components/dashboard/ProfileCompletionCard";
import { CreateJobDialog } from "@/components/dashboard/CreateJobDialog";
import { ProfilePreviewModal } from "@/components/ProfilePreviewModal";
import { QuickMatchPanel } from "@/components/testing/QuickMatchPanel";
import { UpcomingInterviewsCard } from "@/components/dashboard/UpcomingInterviewsCard";
import { PendingLikesCard } from "@/components/dashboard/PendingLikesCard";
import { DomainVerificationSection } from "@/components/verification/DomainVerificationSection";
import { VerifiedDomainBadge } from "@/components/verification/VerifiedDomainBadge";
import { EmployerAnalyticsChart } from "@/components/dashboard/EmployerAnalyticsChart";
import { DashboardTour } from "@/components/onboarding/DashboardTour";
import { EMPLOYER_TOUR_STEPS } from "@/components/onboarding/employerTourSteps";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Logo from "@/components/Logo";

export default function EmployerDashboard() {
  const navigate = useNavigate();
  const { user, profile, isLoading: authLoading, refreshProfile } = useAuth();
  const stats = useEmployerStats();
  const { jobs, isLoading: jobsLoading, deleteJob } = useEmployerJobs();
  const { activities, isLoading: activityLoading } = useEmployerActivity();
  const profileCompletion = useProfileCompletion(profile);
  const [previewOpen, setPreviewOpen] = useState(false);
  
  // Track profile completion milestones
  useProfileMilestones(profileCompletion.percentage);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth?type=employer");
    }
  }, [user, authLoading, navigate]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleViewCandidates = (jobId: string) => {
    navigate(`/swipe/employer?job=${jobId}`);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-4">
              <Logo size="sm" />
              <div className="hidden sm:block">
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-semibold text-foreground">
                    {profile?.company_name || "Dashboard"}
                  </h1>
                  <VerifiedDomainBadge 
                    domain={(profile as any)?.verified_domain} 
                    isVerified={(profile as any)?.is_domain_verified} 
                    size="sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 sm:px-6 py-8">
        {/* Domain Verification Section - Only when test mode is OFF */}
        <DomainVerificationSection />

        {/* Activity Digest */}
        <motion.div
          id="activity-digest"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <ActivityFeed userType="employer" />
        </motion.div>

        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
            Welcome back, {profile?.full_name?.split(" ")[0] || "there"}!
          </h2>
          <p className="text-muted-foreground mt-1">
            Here's an overview of your hiring activity.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Active Jobs"
            value={stats.totalJobs}
            icon={Briefcase}
            delay={0.1}
            onClick={() => {
              const jobsSection = document.getElementById("job-postings");
              jobsSection?.scrollIntoView({ behavior: "smooth" });
            }}
          />
          <StatsCard
            title="Total Matches"
            value={stats.totalMatches}
            icon={Users}
            delay={0.15}
            onClick={() => navigate("/matches")}
          />
          <StatsCard
            title="Candidates Viewed"
            value={stats.totalSwipes}
            icon={Eye}
            delay={0.2}
            onClick={() => navigate("/swipe/employer")}
          />
          <StatsCard
            title="Match Rate"
            value={`${stats.matchRate}%`}
            icon={TrendingUp}
            delay={0.25}
            onClick={() => navigate("/matches")}
          />
        </div>

        {/* Tab Navigation */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full max-w-lg grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Left Column - Jobs & Activity */}
              <div className="lg:col-span-2 space-y-6">
            {/* Job Postings */}
            <motion.div
              id="job-postings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card rounded-xl p-6 shadow-card border border-border"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Your Job Postings</h3>
                <CreateJobDialog onJobCreated={() => window.location.reload()} />
              </div>

              {jobsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : jobs.length === 0 ? (
                <div className="text-center py-8">
                  <Briefcase className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground">No jobs posted yet</p>
                  <div className="mt-4">
                    <CreateJobDialog onJobCreated={() => window.location.reload()} />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {jobs.slice(0, 5).map((job, index) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      onDelete={deleteJob}
                      onViewCandidates={handleViewCandidates}
                      onRoleClosed={() => window.location.reload()}
                      delay={0.35 + index * 0.05}
                    />
                  ))}
                </div>
              )}
            </motion.div>

            {/* Pending Likes */}
            <PendingLikesCard />

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-card rounded-xl p-6 shadow-card border border-border"
            >
              <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
              
              {activityLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : activities.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No recent activity</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">
                    Start swiping to see matches here!
                  </p>
                </div>
              ) : (
                <div>
                  {activities.map((activity, index) => (
                    <ActivityItem
                      key={activity.id}
                      type={activity.type}
                      description={activity.description}
                      timestamp={activity.timestamp}
                      user={activity.user}
                      delay={0.45 + index * 0.05}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Column - Quick Actions & Profile Completion */}
          <div className="space-y-6">
            {/* Upcoming Interviews */}
            <UpcomingInterviewsCard maxItems={3} />
            
            {/* Quick Match Panel for Testing */}
            <QuickMatchPanel />
            
            <QuickActionsPanel />

            <div id="profile-strength">
              <ProfileCompletionCard {...profileCompletion} />
            </div>
            
            {/* Synergy Score Chart */}
            {profile?.synergy_scores && (
              <SynergyScoreChart scores={profile.synergy_scores as Record<Category, number>} />
            )}

            {/* Recent Matches Preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card rounded-xl p-5 shadow-card border border-border"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Recent Matches</h3>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate("/matches")}
                >
                  See All
                </Button>
              </div>

              {stats.totalMatches === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No matches yet. Keep swiping!
                </p>
              ) : (
                <div className="space-y-3">
                  {activities
                    .filter((a) => a.type === "match")
                    .slice(0, 3)
                    .map((match) => (
                      <div 
                        key={match.id} 
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => match.candidateId && navigate(`/candidate/${match.candidateId}`)}
                      >
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={match.user?.avatar} />
                          <AvatarFallback className="text-xs">
                            {match.user?.name.slice(0, 2).toUpperCase() || "??"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {match.user?.name || "Unknown"}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            {profile && (
              <div id="company-details">
                <CompanyDetailsPanel 
                  profile={{
                    company_name: profile.company_name,
                    bio: profile.bio,
                    avatar_url: profile.avatar_url,
                    company_website: profile.company_website,
                    company_size: profile.company_size,
                    company_industry: profile.company_industry,
                    company_location: profile.company_location,
                  }}
                  onEditSuccess={refreshProfile}
                  onPreview={() => setPreviewOpen(true)}
                />
              </div>
            )}
            
            <div id="profile-strength-tab">
              <ProfileCompletionCard {...profileCompletion} />
            </div>

            {/* Synergy Score in Profile Tab */}
            {profile?.synergy_scores && (
              <SynergyScoreChart scores={profile.synergy_scores as Record<Category, number>} />
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <EmployerAnalyticsChart />
          </TabsContent>
        </Tabs>

        <ProfilePreviewModal
          open={previewOpen}
          onOpenChange={setPreviewOpen}
        />

        {/* Dashboard Tour */}
        <DashboardTour steps={EMPLOYER_TOUR_STEPS} userType="employer" />
      </main>
    </div>
  );
}