import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { FeatureToggleProvider } from "@/contexts/FeatureToggleContext";
import { TestModeBanner } from "@/components/admin/TestModeBanner";
import { AppLayout } from "@/components/layout/AppLayout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import ProfileSetup from "./pages/ProfileSetup";
import CandidateOnboarding from "./pages/CandidateOnboarding";
import OnboardingComplete from "./pages/OnboardingComplete";
import CitySelection from "./pages/CitySelection";
import RoleSelection from "./pages/RoleSelection";
import SkillsGame from "./pages/SkillsGame";
import CultureGame from "./pages/CultureGame";
import Results from "./pages/Results";
import EmployerResults from "./pages/EmployerResults";
import EmployerOnboarding from "./pages/EmployerOnboarding";
import EmployerDashboard from "./pages/EmployerDashboard";
import CandidateDashboard from "./pages/CandidateDashboard";
import CultureEdit from "./pages/CultureEdit";
import CultureConfirmation from "./pages/CultureConfirmation";
import EmployerSwipe from "./pages/EmployerSwipe";
import CandidateSwipe from "./pages/CandidateSwipe";
import CandidateExtendedProfile from "./pages/CandidateExtendedProfile";
import Matches from "./pages/Matches";
import Chat from "./pages/Chat";
import CompanyProfile from "./pages/CompanyProfile";
import CandidateProfile from "./pages/CandidateProfile";
import Settings from "./pages/Settings";
import SynergyScoreQuiz from "./pages/SynergyScoreQuiz";
import SavedJobs from "./pages/SavedJobs";
import ApplicationTracker from "./pages/ApplicationTracker";
import Shortlists from "./pages/Shortlists";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <FeatureToggleProvider>
        <TooltipProvider>
          <TestModeBanner />
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes - no layout wrapper */}
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/admin/*" element={<Admin />} />
              
              {/* Onboarding routes - no sidebar yet */}
              <Route path="/profile-setup" element={<ProfileSetup />} />
              <Route path="/candidate-onboarding" element={<CandidateOnboarding />} />
              <Route path="/employer-onboarding" element={<EmployerOnboarding />} />
              <Route path="/onboarding-complete" element={<OnboardingComplete />} />
              <Route path="/city" element={<CitySelection />} />
              <Route path="/roles" element={<RoleSelection />} />
              <Route path="/game/skills" element={<SkillsGame />} />
              <Route path="/game/culture" element={<CultureGame />} />
              <Route path="/results" element={<Results />} />
              <Route path="/employer-results" element={<EmployerResults />} />
              <Route path="/culture-edit" element={<CultureEdit />} />
              <Route path="/culture-confirmation" element={<CultureConfirmation />} />
              <Route path="/synergy-score-quiz" element={<SynergyScoreQuiz />} />
              
              {/* App routes - wrapped in AppLayout with sidebar */}
              <Route element={<AppLayout />}>
                <Route path="/employer-dashboard" element={<EmployerDashboard />} />
                <Route path="/candidate-dashboard" element={<CandidateDashboard />} />
                <Route path="/swipe/employer" element={<EmployerSwipe />} />
                <Route path="/swipe/candidate" element={<CandidateSwipe />} />
                <Route path="/candidate-extended-profile" element={<CandidateExtendedProfile />} />
                <Route path="/matches" element={<Matches />} />
                <Route path="/chat/:matchId" element={<Chat />} />
                <Route path="/company/:userId" element={<CompanyProfile />} />
                <Route path="/candidate/:userId" element={<CandidateProfile />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/saved-jobs" element={<SavedJobs />} />
                <Route path="/applications" element={<ApplicationTracker />} />
                <Route path="/shortlists" element={<Shortlists />} />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </FeatureToggleProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;