import { useNavigate } from "react-router-dom";
import { LogIn, LogOut, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";

interface ProfileHeaderProps {
  className?: string;
}

const ProfileHeader = ({ className = "" }: ProfileHeaderProps) => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  const getDashboardRoute = () => {
    if (profile?.user_type === "employer") {
      return "/employer-dashboard";
    }
    return "/candidate-dashboard";
  };

  const getDashboardLabel = () => {
    if (profile?.user_type === "employer") {
      return "Employer Dashboard";
    }
    return "Candidate Dashboard";
  };

  if (!user) {
    return (
      <div className={className}>
        <Button variant="outline" size="sm" onClick={() => navigate("/auth")}>
          <LogIn className="w-4 h-4 mr-2" />
          Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate(getDashboardRoute())}
        className="hidden sm:flex"
      >
        <LayoutDashboard className="w-4 h-4 mr-2" />
        {getDashboardLabel()}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate(getDashboardRoute())}
        className="rounded-full"
        title={getDashboardLabel()}
      >
        <Avatar className="w-8 h-8">
          <AvatarImage src={profile?.avatar_url || undefined} />
          <AvatarFallback className="text-xs">
            {profile?.full_name?.slice(0, 2).toUpperCase() || user.email?.slice(0, 2).toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
      </Button>
      <Button variant="ghost" size="sm" onClick={handleSignOut}>
        <LogOut className="w-4 h-4 mr-2" />
        Sign Out
      </Button>
    </div>
  );
};

export default ProfileHeader;
