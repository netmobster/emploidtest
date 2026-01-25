import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Briefcase, Users, Eye, TrendingUp, Bookmark, Loader2, Pencil, ClipboardList, BarChart3, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCandidateStats } from "@/hooks/useCandidateStats";
import { useJobRecommendations } from "@/hooks/useJobRecommendations";
import { useMatches } from "@/hooks/useMatches";
import { useProfileCompletion } from "@/hooks/useProfileCompletion";
import { useProfileMilestones } from "@/hooks/useProfileMilestones";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { SynergyScoreChart } from "@/components/dashboard/SynergyScoreChart";
import { Category } from "@/data/questions";
import { JobRecommendationCard } from "@/components/dashboard/JobRecommendationCard";
import { EditCandidateProfileDialog } from "@/components/dashboard/EditCandidateProfileDialog";
import { ProfileCompletionCard } from "@/components/dashboard/ProfileCompletionCard";
import { ProfilePreviewModal } from "@/components/ProfilePreviewModal";
import { GettingStartedBanner } from "@/components/dashboard/GettingStartedBanner";
import { UpcomingInterviewsCard } from "@/components/dashboard/UpcomingInterviewsCard";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { PendingLikesCard } from "@/components/dashboard/PendingLikesCard";
import { CandidateVerificationSection } from "@/components/verification/CandidateVerificationSection";
import { VerifiedProfessionalBadge } from "@/components/verification/VerifiedProfessionalBadge";
import { DashboardTour } from "@/components/onboarding/DashboardTour";
import { CANDIDATE_TOUR_STEPS } from "@/components/onboarding/candidateTourSteps";
import { CandidateAnalyticsChart } from "@/components/dashboard/CandidateAnalyticsChart";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Logo from "@/components/Logo";

export default function CandidateDashboard() {
  const navigate = useNavigate();
  const { user, profile, isLoading: authLoading, refreshProfile } = useAuth();
  const stats = useCandidateStats();
  const { jobs, isLoading: jobsLoading } = useJobRecommendations();
  const { matches, isLoading: matchesLoading } = useMatches();
  const profileCompletion = useProfileCompletion(profile);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  
  // Track profile completion milestones
  useProfileMilestones(profileCompletion.percentage);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth?type=candidate");
    }
  }, [user, authLoading, navigate]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleViewJob = (jobId: string) => {
    navigate(`/swipe/candidate`);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-4 min-w-0">
              <Logo size="sm" />
              <div className="hidden sm:block min-w-0">
                <h1 className="text-lg font-semibold text-foreground truncate">
                  Job Dashboard
                </h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 sm:px-6 py-4 sm:py-8">
        {/* Activity Digest */}
        <motion.div
          id="activity-digest"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 sm:mb-6"
        >
          <ActivityFeed userType="candidate" />
        </motion.div>

        {/* Getting Started Banner */}
        {profile && !profileCompletion.isComplete && (
          <GettingStartedBanner profile={profile} />
        )}

        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 sm:mb-8"
        >
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground truncate">
            Welcome back, {profile?.full_name?.split(" ")[0] || "there"}!
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Here's an overview of your job search activity.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <StatsCard
            title="Saved Jobs"
            value={stats.savedJobs}
            icon={Bookmark}
            delay={0.1}
            onClick={() => navigate("/saved-jobs")}
          />
          <StatsCard
            title="Matches"
            value={stats.totalMatches}
            icon={Users}
            delay={0.15}
            onClick={() => navigate("/matches")}
          />
          <StatsCard
            title="Jobs Viewed"
            value={stats.jobsViewed}
            icon={Eye}
            delay={0.2}
            onClick={() => navigate("/swipe/candidate")}
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
            <TabsTrigger value="profile" className="gap-2">
              <User className="w-4 h-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Column - Job Recommendations */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Job Recommendations */}
            <motion.div
              id="job-recommendations"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card rounded-xl p-4 sm:p-6 shadow-card border border-border overflow-hidden"
            >
              <div className="flex items-center justify-between mb-4 gap-2">
                <h3 className="text-base sm:text-lg font-semibold text-foreground truncate">Job Recommendations</h3>
                <Button 
                  size="sm" 
                  onClick={() => navigate("/swipe/candidate")}
                  className="flex-shrink-0"
                >
                  Browse All
                </Button>
              </div>

              {jobsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : jobs.length === 0 ? (
                <div className="text-center py-8">
                  <Briefcase className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground">No new job recommendations</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => navigate("/swipe/candidate")}
                  >
                    Start Browsing Jobs
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {jobs.slice(0, 5).map((job, index) => (
                    <JobRecommendationCard
                      key={job.id}
                      job={job}
                      onView={handleViewJob}
                      delay={0.35 + index * 0.05}
                    />
                  ))}
                </div>
              )}
            </motion.div>

            {/* Pending Likes */}
            <PendingLikesCard />

            {/* Recent Matches */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-card rounded-xl p-4 sm:p-6 shadow-card border border-border overflow-hidden"
            >
              <div className="flex items-center justify-between mb-4 gap-2">
                <h3 className="text-base sm:text-lg font-semibold text-foreground truncate">Recent Matches</h3>
                <Button 
                  variant="ghost"
                  size="sm" 
                  onClick={() => navigate("/matches")}
                  className="flex-shrink-0"
                >
                  See All
                </Button>
              </div>
              
              {matchesLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : matches.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground">No matches yet</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">
                    Start swiping to connect with employers!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                {matches.slice(0, 5).map((match) => (
                    <div 
                      key={match.id} 
                      className="flex items-center gap-3 p-3 rounded-lg border border-border bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer overflow-hidden"
                      onClick={() => navigate(`/chat/${match.id}`)}
                    >
                      <Avatar className="w-10 h-10 flex-shrink-0">
                        <AvatarImage src={match.other_user?.avatar_url || undefined} />
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {match.other_user?.full_name?.slice(0, 2).toUpperCase() || "??"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {match.other_user?.full_name || "Unknown"}
                        </p>
                      </div>
                      <Button size="sm" variant="outline" className="flex-shrink-0">
                        Chat
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Column - Quick Actions & Profile Completion */}
          <div className="space-y-4 sm:space-y-6">
            {/* LinkedIn Verification Section - Only shows when test mode is OFF */}
            {user && !(profile as any)?.is_verified_identity && (
              <CandidateVerificationSection
                userId={user.id}
                isVerified={(profile as any)?.is_verified_identity}
                onVerificationComplete={refreshProfile}
              />
            )}

            {/* Upcoming Interviews */}
            <UpcomingInterviewsCard maxItems={3} />
            
            {/* Quick Actions - moved before profile completion */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card rounded-xl p-4 sm:p-5 shadow-card border border-border overflow-hidden"
            >
              <h3 className="font-semibold text-foreground mb-4 text-sm sm:text-base">Quick Actions</h3>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-sm"
                  onClick={() => navigate("/swipe/candidate")}
                >
                  <Briefcase className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="truncate">Browse Jobs</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-sm"
                  onClick={() => navigate("/matches")}
                >
                  <Users className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="truncate">View Matches</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-sm"
                  onClick={() => navigate("/applications")}
                >
                  <ClipboardList className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="truncate">Track Applications</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-sm"
                  onClick={() => navigate("/game/culture")}
                >
                  <TrendingUp className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="truncate">Update Preferences</span>
                </Button>
              </div>
            </motion.div>

            {/* Profile Completion - now below quick actions */}
            <ProfileCompletionCard {...profileCompletion} />
            
            {/* Synergy Score Chart */}
            {profile?.synergy_scores && (
              <div id="synergy-score">
                <SynergyScoreChart scores={profile.synergy_scores as Record<Category, number>} />
              </div>
            )}
            

            {/* Dashboard Tour */}
            <DashboardTour steps={CANDIDATE_TOUR_STEPS} userType="candidate" />
          </div>
        </div>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            {/* Full Profile Section */}
            <motion.div
              id="profile-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-xl p-6 shadow-card border border-border"
            >
              <div className="flex items-center justify-between mb-6 gap-2">
                <h3 className="font-semibold text-foreground text-lg">Your Profile</h3>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setPreviewOpen(true)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Public Profile
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => setEditProfileOpen(true)}
                  >
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              </div>
              
              <div className="flex items-start gap-4 mb-6">
                <Avatar className="w-20 h-20 flex-shrink-0">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                    {profile?.full_name?.slice(0, 2).toUpperCase() || "??"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-foreground text-xl">{profile?.full_name || "Your Name"}</h4>
                    <VerifiedProfessionalBadge isVerified={(profile as any)?.is_verified_identity} size="sm" />
                  </div>
                  <p className="text-sm text-muted-foreground">{profile?.email}</p>
                  {profile?.job_title && (
                    <p className="text-sm text-foreground mt-1">{profile.job_title}</p>
                  )}
                  {profile?.location && (
                    <p className="text-sm text-muted-foreground">{profile.location}</p>
                  )}
                </div>
              </div>

              {profile?.bio && (
                <div className="mb-6">
                  <h5 className="font-medium text-foreground mb-2">About</h5>
                  <p className="text-sm text-muted-foreground">{profile.bio}</p>
                </div>
              )}

              {profile?.skills && profile.skills.length > 0 && (
                <div className="mb-6">
                  <h5 className="font-medium text-foreground mb-2">Skills</h5>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill: string, index: number) => (
                      <span key={index} className="px-3 py-1 bg-secondary rounded-full text-sm text-foreground">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {!profile?.has_completed_culture_game && (
                <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                  <p className="text-sm font-medium text-foreground mb-2">Complete your profile</p>
                  <p className="text-xs text-muted-foreground mb-3">
                    Take the culture game to get better job matches!
                  </p>
                  <Button size="sm" onClick={() => navigate("/game/culture")}>
                    Take Culture Game
                  </Button>
                </div>
              )}
            </motion.div>

            {/* Profile Completion in Profile Tab */}
            <ProfileCompletionCard {...profileCompletion} />

            {/* Synergy Score in Profile Tab */}
            {profile?.synergy_scores && (
              <div id="synergy-score-tab">
                <SynergyScoreChart scores={profile.synergy_scores as Record<Category, number>} />
              </div>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <CandidateAnalyticsChart />
          </TabsContent>
        </Tabs>

        <EditCandidateProfileDialog
          open={editProfileOpen}
          onOpenChange={setEditProfileOpen}
          onSuccess={() => {
            setEditProfileOpen(false);
            refreshProfile();
          }}
        />

        <ProfilePreviewModal
          open={previewOpen}
          onOpenChange={setPreviewOpen}
        />
      </main>
    </div>
  );
}
