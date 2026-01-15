import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface AdminAccess {
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useAdminAccess(): AdminAccess {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkAdminAccess() {
      if (!user) {
        setIsAdmin(false);
        setIsSuperAdmin(false);
        setIsLoading(false);
        return;
      }

      try {
        // Check for super_admin role
        const { data: superAdminData, error: superAdminError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "super_admin")
          .maybeSingle();

        if (superAdminError) {
          // If we get a permission error, user is not an admin
          if (superAdminError.code === "PGRST116" || superAdminError.message.includes("permission")) {
            setIsAdmin(false);
            setIsSuperAdmin(false);
          } else {
            setError(superAdminError.message);
          }
          setIsLoading(false);
          return;
        }

        const isSuperAdminUser = !!superAdminData;
        setIsSuperAdmin(isSuperAdminUser);

        // Check for admin role if not super_admin
        if (!isSuperAdminUser) {
          const { data: adminData } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", user.id)
            .eq("role", "admin")
            .maybeSingle();

          setIsAdmin(!!adminData);
        } else {
          setIsAdmin(true); // Super admins are also admins
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    }

    checkAdminAccess();
  }, [user]);

  return { isAdmin, isSuperAdmin, isLoading, error };
}
