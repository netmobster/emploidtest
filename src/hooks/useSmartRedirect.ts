import { useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const LAST_ROUTE_KEY = "emploid_last_route";
const LAST_ACTIVE_KEY = "emploid_last_active";
const ABSENCE_THRESHOLD_HOURS = 4; // Show dashboard if away for 4+ hours

export function useSmartRedirect() {
  const { user, profile, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Save current route on navigation
  useEffect(() => {
    if (user && profile && !isLoading) {
      const currentPath = location.pathname;
      
      // Don't save auth-related routes
      const excludedPaths = ["/auth", "/", "/onboarding"];
      const isExcluded = excludedPaths.some(path => currentPath.startsWith(path));
      
      if (!isExcluded && currentPath !== "/") {
        localStorage.setItem(LAST_ROUTE_KEY, currentPath);
      }
      
      // Update last active timestamp
      localStorage.setItem(LAST_ACTIVE_KEY, Date.now().toString());
    }
  }, [location.pathname, user, profile, isLoading]);

  // Determine redirect destination after login
  const getLoginRedirect = useCallback(() => {
    if (!user || !profile) return null;

    const lastActiveStr = localStorage.getItem(LAST_ACTIVE_KEY);
    const lastRoute = localStorage.getItem(LAST_ROUTE_KEY);
    
    const lastActive = lastActiveStr ? parseInt(lastActiveStr, 10) : 0;
    const hoursSinceActive = (Date.now() - lastActive) / (1000 * 60 * 60);
    
    const dashboardRoute = profile.user_type === "employer" 
      ? "/employer-dashboard" 
      : "/candidate-dashboard";

    // First login or long absence → go to dashboard
    if (!lastActiveStr || hoursSinceActive >= ABSENCE_THRESHOLD_HOURS) {
      return dashboardRoute;
    }

    // Recent activity → return to last page (or dashboard as fallback)
    if (lastRoute && lastRoute !== "/") {
      return lastRoute;
    }

    return dashboardRoute;
  }, [user, profile]);

  // Perform smart redirect on auth change
  const performSmartRedirect = useCallback(() => {
    const destination = getLoginRedirect();
    if (destination) {
      navigate(destination, { replace: true });
    }
  }, [getLoginRedirect, navigate]);

  // Clear stored route on logout
  const clearStoredRoute = useCallback(() => {
    localStorage.removeItem(LAST_ROUTE_KEY);
    localStorage.removeItem(LAST_ACTIVE_KEY);
  }, []);

  return {
    getLoginRedirect,
    performSmartRedirect,
    clearStoredRoute,
  };
}

// Hook to use in Index page for redirect logic
export function useLoginRedirect() {
  const { user, profile, isLoading } = useAuth();
  const navigate = useNavigate();
  const { getLoginRedirect } = useSmartRedirect();

  useEffect(() => {
    if (!isLoading && user && profile) {
      const destination = getLoginRedirect();
      if (destination) {
        navigate(destination, { replace: true });
      }
    }
  }, [isLoading, user, profile, getLoginRedirect, navigate]);

  return { isLoading, user, profile };
}
