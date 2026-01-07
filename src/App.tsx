import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
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
import Matches from "./pages/Matches";
import Chat from "./pages/Chat";
import CompanyProfile from "./pages/CompanyProfile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profile-setup" element={<ProfileSetup />} />
            <Route path="/candidate-onboarding" element={<CandidateOnboarding />} />
            <Route path="/onboarding-complete" element={<OnboardingComplete />} />
            <Route path="/city" element={<CitySelection />} />
            <Route path="/roles" element={<RoleSelection />} />
            <Route path="/game/skills" element={<SkillsGame />} />
            <Route path="/game/culture" element={<CultureGame />} />
            <Route path="/results" element={<Results />} />
            <Route path="/employer-results" element={<EmployerResults />} />
            <Route path="/employer-onboarding" element={<EmployerOnboarding />} />
            <Route path="/employer-dashboard" element={<EmployerDashboard />} />
            <Route path="/culture-edit" element={<CultureEdit />} />
            <Route path="/culture-confirmation" element={<CultureConfirmation />} />
            <Route path="/swipe/employer" element={<EmployerSwipe />} />
            <Route path="/swipe/candidate" element={<CandidateSwipe />} />
            <Route path="/matches" element={<Matches />} />
            <Route path="/chat/:matchId" element={<Chat />} />
            <Route path="/candidate-dashboard" element={<CandidateDashboard />} />
            <Route path="/company/:userId" element={<CompanyProfile />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;