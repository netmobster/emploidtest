import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { MobileBottomNav } from "./MobileBottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children?: React.ReactNode;
}

/**
 * AppLayout provides:
 * - Persistent sidebar on desktop (md+)
 * - Mobile bottom navigation
 * - Centered content container (max 800px on desktop)
 * - Consistent layout across all authenticated pages
 */
export function AppLayout({ children }: AppLayoutProps) {
  const { user } = useAuth();

  // If not logged in, just render children without sidebar
  if (!user) {
    return <>{children || <Outlet />}</>;
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full">
        {/* Desktop sidebar */}
        <div className="hidden md:block">
          <AppSidebar />
        </div>

        <SidebarInset className="flex-1 flex flex-col">
          {/* Mobile header with sidebar trigger */}
          <header className="md:hidden sticky top-0 z-40 flex items-center gap-2 px-4 h-14 bg-background/80 backdrop-blur-sm border-b border-border">
            <SidebarTrigger className="-ml-2" />
          </header>

          {/* Main content area */}
          <main
            className={cn(
              "flex-1 w-full",
              // Add bottom padding on mobile for bottom nav
              "pb-20 md:pb-0"
            )}
          >
            <div
              className={cn(
                // Full width on mobile, constrained on desktop
                "w-full mx-auto min-h-full",
                "md:max-w-[800px]",
                // Card styling on desktop
                "md:bg-background",
                "md:border-x md:border-border/50",
                "md:shadow-sm",
                // Overflow protection
                "overflow-x-hidden"
              )}
            >
              {children || <Outlet />}
            </div>
          </main>
        </SidebarInset>

        {/* Mobile bottom navigation */}
        <MobileBottomNav />
      </div>
    </SidebarProvider>
  );
}

export default AppLayout;
