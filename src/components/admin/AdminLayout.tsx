import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminLayoutProps {
  children: ReactNode;
  requireSuperAdmin?: boolean;
}

export function AdminLayout({ children, requireSuperAdmin = false }: AdminLayoutProps) {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { isAdmin, isSuperAdmin, isLoading: accessLoading } = useAdminAccess();

  const isLoading = authLoading || accessLoading;
  const hasAccess = requireSuperAdmin ? isSuperAdmin : isAdmin || isSuperAdmin;

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
    }
  }, [isLoading, user, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Checking access...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-6 max-w-md px-4">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <ShieldAlert className="h-8 w-8 text-destructive" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
            <p className="text-muted-foreground">
              You don't have permission to access the admin panel.
              {requireSuperAdmin && " Super admin privileges are required."}
            </p>
          </div>
          <Button onClick={() => navigate("/")} variant="outline">
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
