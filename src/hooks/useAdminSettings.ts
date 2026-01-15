import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface AdminSettings {
  test_mode: { enabled: boolean };
  feature_toggles: Record<string, boolean>;
  email_templates: Record<string, { subject: string; body: string; enabled: boolean }>;
  toast_configs: Record<string, { title: string; description?: string; duration: number; variant: string }>;
  protected_emails: string[];
}

const defaultSettings: AdminSettings = {
  test_mode: { enabled: false },
  feature_toggles: {
    quick_match_panel: true,
    admin_match_button: true,
    sample_mode: true,
    debug_logging: false,
  },
  email_templates: {},
  toast_configs: {},
  protected_emails: ["wearecleardigital@gmail.com"],
};

export function useAdminSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<AdminSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error: fetchError } = await supabase
        .from("admin_settings")
        .select("setting_key, setting_value");

      if (fetchError) {
        // Permission denied means user is not admin
        if (fetchError.code === "PGRST116" || fetchError.message.includes("permission")) {
          setError("Access denied");
          return;
        }
        throw fetchError;
      }

      if (data) {
        const newSettings = { ...defaultSettings };
        data.forEach((row) => {
          const key = row.setting_key as keyof AdminSettings;
          if (key in newSettings) {
            (newSettings as any)[key] = row.setting_value;
          }
        });
        setSettings(newSettings);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch settings");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSetting = async <K extends keyof AdminSettings>(
    key: K,
    value: AdminSettings[K]
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error: updateError } = await supabase
        .from("admin_settings")
        .update({
          setting_value: value as any,
          updated_by: user.id,
          updated_at: new Date().toISOString(),
        })
        .eq("setting_key", key);

      if (updateError) throw updateError;

      setSettings((prev) => ({ ...prev, [key]: value }));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update setting");
      return false;
    }
  };

  const logAuditAction = async (
    action: string,
    targetType?: string,
    targetId?: string,
    details?: Record<string, any>
  ) => {
    if (!user) return;

    try {
      await supabase.from("audit_logs").insert({
        user_id: user.id,
        action,
        target_type: targetType,
        target_id: targetId,
        details,
      });
    } catch (err) {
      console.error("Failed to log audit action:", err);
    }
  };

  return {
    settings,
    isLoading,
    error,
    updateSetting,
    refetch: fetchSettings,
    logAuditAction,
  };
}
