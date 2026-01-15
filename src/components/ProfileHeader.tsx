import { useNavigate } from "react-router-dom";
import { LogIn, LogOut, LayoutDashboard, Settings, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import NotificationBell from "@/components/notifications/NotificationBell";
import ChatsDropdown from "@/components/ChatsDropdown";

interface ProfileHeaderProps {
  className?: string;
}

const ProfileHeader = ({ className = "" }: ProfileHeaderProps) => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { isSuperAdmin } = useAdminAccess();

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
      <ChatsDropdown />
      <NotificationBell />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            title="Profile menu"
          >
            <Avatar className="w-8 h-8">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="text-xs">
                {profile?.full_name?.slice(0, 2).toUpperCase() ||
                  user.email?.slice(0, 2).toUpperCase() ||
                  "U"}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => navigate(getDashboardRoute())}>
            <LayoutDashboard className="w-4 h-4 mr-2" />
            Dashboard
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/settings")}>
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </DropdownMenuItem>
          {isSuperAdmin && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/admin")}>
                <Shield className="w-4 h-4 mr-2" />
                Super Admin
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ProfileHeader;
