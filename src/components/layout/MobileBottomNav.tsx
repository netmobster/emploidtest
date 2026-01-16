import { useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Heart, MessageCircle, Settings } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const candidateNavItems = [
  { title: "Home", url: "/candidate-dashboard", icon: LayoutDashboard },
  { title: "Swipe", url: "/swipe/candidate", icon: Heart },
  { title: "Matches", url: "/matches", icon: MessageCircle },
  { title: "Settings", url: "/settings", icon: Settings },
];

const employerNavItems = [
  { title: "Home", url: "/employer-dashboard", icon: LayoutDashboard },
  { title: "Swipe", url: "/swipe/employer", icon: Heart },
  { title: "Matches", url: "/matches", icon: MessageCircle },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function MobileBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, user } = useAuth();

  // Don't show if not logged in
  if (!user) return null;

  const isEmployer = profile?.user_type === "employer";
  const navItems = isEmployer ? employerNavItems : candidateNavItems;

  const isActive = (path: string) => location.pathname === path;

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
      </div>
    </nav>
  );
}
