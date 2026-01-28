import { useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Heart, MessageCircle, Settings, LogOut, Shield, User, Star, Globe } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import { useSidebarCounts } from "@/hooks/useSidebarCounts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Logo from "@/components/Logo";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const candidateNavItems = [
  { title: "Dashboard", url: "/candidate-dashboard", icon: LayoutDashboard, countKey: null },
  // Route candidates through preference selection before entering the swipe deck
  { title: "Swipe", url: "/city?type=candidate", icon: Heart, countKey: null },
  { title: "Matches", url: "/matches", icon: MessageCircle, countKey: "unreadMatches" as const },
  { title: "Settings", url: "/settings", icon: Settings, countKey: null },
];

const employerNavItems = [
  { title: "Dashboard", url: "/employer-dashboard", icon: LayoutDashboard, countKey: null },
  { title: "Swipe", url: "/swipe/employer", icon: Heart, countKey: null },
  { title: "Matches", url: "/matches", icon: MessageCircle, countKey: "unreadMatches" as const },
  { title: "Shortlists", url: "/shortlists", icon: Star, countKey: null },
  { title: "Settings", url: "/settings", icon: Settings, countKey: null },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const { isSuperAdmin } = useAdminAccess();
  const { counts } = useSidebarCounts();

  const isEmployer = profile?.user_type === "employer";
  const navItems = isEmployer ? employerNavItems : candidateNavItems;

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + "/");

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Failed to log out");
    }
  };

  const getViewProfileRoute = () => {
    if (profile?.user_type === "employer") {
      return `/company/${user?.id}`;
    }
    return `/candidate/${user?.id}`;
  };

  const getCount = (countKey: "unreadMatches" | null) => {
    if (!countKey) return 0;
    return counts[countKey] || 0;
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border" aria-label="Main sidebar navigation">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <Logo size="sm" />
          {!collapsed && (
            <span className="font-semibold text-sidebar-foreground">Emploid</span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const count = getCount(item.countKey);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.url)}
                      tooltip={item.title}
                    >
                      <NavLink
                        to={item.url}
                        end
                        className="flex items-center gap-3 relative"
                        activeClassName="bg-sidebar-accent text-sidebar-accent-foreground"
                      >
                        <div className="relative">
                          <item.icon className="h-5 w-5" aria-hidden="true" />
                          {count > 0 && collapsed && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                              {count > 9 ? "9+" : count}
                            </span>
                          )}
                        </div>
                        {!collapsed && (
                          <span className="flex-1">{item.title}</span>
                        )}
                        {!collapsed && count > 0 && (
                          <Badge variant="destructive" className="h-5 min-w-5 px-1.5 text-[10px] font-bold">
                            {count > 99 ? "99+" : count}
                          </Badge>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
              {/* Public Home link */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/public-home")}
                  tooltip="Public Home"
                >
                  <NavLink
                    to="/public-home"
                    className="flex items-center gap-3"
                    activeClassName="bg-sidebar-accent text-sidebar-accent-foreground"
                  >
                    <Globe className="h-5 w-5" aria-hidden="true" />
                    {!collapsed && <span>Public Home</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Profile + Logout quick actions */}
              {user && (
                <>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(getViewProfileRoute())}
                      tooltip="Profile"
                    >
                      <NavLink
                        to={getViewProfileRoute()}
                        className="flex items-center gap-3"
                        activeClassName="bg-sidebar-accent text-sidebar-accent-foreground"
                      >
                        <User className="h-5 w-5" aria-hidden="true" />
                        {!collapsed && <span>Profile</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton
                      tooltip="Log Out"
                      onClick={handleLogout}
                      className="flex items-center gap-3"
                      aria-label="Log out of your account"
                    >
                      <LogOut className="h-5 w-5" aria-hidden="true" />
                      {!collapsed && <span>Log Out</span>}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              )}
              {isSuperAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive("/admin")}
                    tooltip="Super Admin"
                  >
                    <NavLink
                      to="/admin"
                      className="flex items-center gap-3"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground"
                    >
                      <Shield className="h-5 w-5" aria-hidden="true" />
                      {!collapsed && <span>Super Admin</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                className="flex items-center gap-3 w-full hover:bg-sidebar-accent/50 rounded-lg p-1 -m-1 transition-colors"
                aria-label="Account menu"
              >
                <Avatar className="h-9 w-9">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary text-sm">
                    {profile?.full_name?.slice(0, 2).toUpperCase() || "??"}
                  </AvatarFallback>
                </Avatar>
                {!collapsed && (
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-medium text-sidebar-foreground truncate">
                      {profile?.full_name || "User"}
                    </p>
                    <p className="text-xs text-sidebar-foreground/60 truncate">
                      {profile?.email}
                    </p>
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="top" className="w-48">
              <DropdownMenuItem onClick={() => navigate(getViewProfileRoute())}>
                <User className="h-4 w-4 mr-2" />
                View Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                <LogOut className="h-4 w-4 mr-2" />
                Log Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
