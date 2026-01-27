import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Heart, MessageCircle, Settings, Globe, Menu, User, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const candidateNavItems = [
  { title: "Home", url: "/candidate-dashboard", icon: LayoutDashboard },
  // Route candidates through preference selection before entering the swipe deck
  { title: "Swipe", url: "/city?type=candidate", icon: Heart },
  { title: "Matches", url: "/matches", icon: MessageCircle },
  { title: "Site", url: "/public-home", icon: Globe },
];

const employerNavItems = [
  { title: "Home", url: "/employer-dashboard", icon: LayoutDashboard },
  { title: "Swipe", url: "/swipe/employer", icon: Heart },
  { title: "Matches", url: "/matches", icon: MessageCircle },
  { title: "Site", url: "/public-home", icon: Globe },
];

export function MobileBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  // Don't show if not logged in
  if (!user) return null;

  const isEmployer = profile?.user_type === "employer";
  const navItems = isEmployer ? employerNavItems : candidateNavItems;

  const isActive = (path: string) => location.pathname === path;

  const getProfileRoute = () => {
    if (!user) return "/";
    return profile?.user_type === "employer" ? `/company/${user.id}` : `/candidate/${user.id}`;
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) toast.error("Failed to log out");
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background border-t border-border safe-area-inset-bottom">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const active = isActive(item.url);
          return (
            <button
              key={item.title}
              onClick={() => navigate(item.url)}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors",
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5", active && "text-primary")} />
              <span className="text-[10px] font-medium">{item.title}</span>
            </button>
          );
        })}

        {/* Menu (Profile/Settings/Logout) */}
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger asChild>
            <button
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors",
                menuOpen ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Menu className={cn("h-5 w-5", menuOpen && "text-primary")} />
              <span className="text-[10px] font-medium">Menu</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="p-0">
            <SheetHeader className="p-4 border-b border-border">
              <SheetTitle>Account</SheetTitle>
            </SheetHeader>
            <div className="p-4 space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  setMenuOpen(false);
                  navigate(getProfileRoute());
                }}
              >
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/settings");
                }}
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>

              <Button
                variant="destructive"
                className="w-full justify-start"
                onClick={async () => {
                  setMenuOpen(false);
                  await handleLogout();
                }}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Log Out
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
