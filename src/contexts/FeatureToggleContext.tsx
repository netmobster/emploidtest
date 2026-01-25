import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

interface FeatureToggles {
  quick_match_panel: boolean;
  admin_match_button: boolean;
  sample_mode: boolean;
  debug_logging: boolean;
  [key: string]: boolean;
}

interface TestMode {
  enabled: boolean;
}

interface FeatureToggleContextType {
  features: FeatureToggles;
  testMode: TestMode;
  isLoading: boolean;
  isFeatureEnabled: (feature: string) => boolean;
  refetch: () => Promise<void>;
}

const defaultFeatures: FeatureToggles = {
  quick_match_panel: true,
  admin_match_button: true,
  sample_mode: true,
  debug_logging: false,
};

const defaultTestMode: TestMode = { enabled: false };

const FeatureToggleContext = createContext<FeatureToggleContextType>({
  features: defaultFeatures,
  testMode: defaultTestMode,
  isLoading: true,
  isFeatureEnabled: () => true,
  refetch: async () => {},
});

export function FeatureToggleProvider({ children }: { children: ReactNode }) {
  const [features, setFeatures] = useState<FeatureToggles>(defaultFeatures);
  const [testMode, setTestMode] = useState<TestMode>(defaultTestMode);
  const [isLoading, setIsLoading] = useState(true);

  const fetchToggles = async () => {
    try {
      // Try to get from localStorage first for quick initial render
      const cachedFeatures = localStorage.getItem("feature_toggles");
      const cachedTestMode = localStorage.getItem("test_mode");

      if (cachedFeatures) {
        setFeatures(JSON.parse(cachedFeatures));
      }
      if (cachedTestMode) {
        setTestMode(JSON.parse(cachedTestMode));
      }

      // Fetch from database - this is a public read for feature flags
      // We use a special RPC function that doesn't require admin access
      const { data, error } = await supabase
        .from("admin_settings")
        .select("setting_key, setting_value")
        .in("setting_key", ["feature_toggles", "test_mode"]);

      // If permission denied, use cached/default values
      if (error) {
        console.log("Using cached feature toggles");
        setIsLoading(false);
        return;
      }

      if (data) {
        const seenKeys = new Set<string>();

        data.forEach((row) => {
          seenKeys.add(row.setting_key);
          if (row.setting_key === "feature_toggles" && row.setting_value && typeof row.setting_value === 'object') {
            const newFeatures = row.setting_value as unknown as FeatureToggles;
            setFeatures(newFeatures);
            localStorage.setItem("feature_toggles", JSON.stringify(newFeatures));
          }
          if (row.setting_key === "test_mode" && row.setting_value && typeof row.setting_value === 'object') {
            const newTestMode = row.setting_value as unknown as TestMode;
            setTestMode(newTestMode);
            localStorage.setItem("test_mode", JSON.stringify(newTestMode));
          }
        });

        // IMPORTANT: If the backend returns no rows for these keys (common in production
        // before admin settings are initialized), don't let stale localStorage values
        // permanently override defaults.
        if (!seenKeys.has("feature_toggles")) {
          console.warn("[FeatureToggle] No feature_toggles row found; falling back to defaults");
          setFeatures(defaultFeatures);
          localStorage.setItem("feature_toggles", JSON.stringify(defaultFeatures));
        }
        if (!seenKeys.has("test_mode")) {
          console.warn("[FeatureToggle] No test_mode row found; falling back to defaults (enabled:false)");
          setTestMode(defaultTestMode);
          localStorage.setItem("test_mode", JSON.stringify(defaultTestMode));
        }
      }
    } catch (err) {
      console.error("Failed to fetch feature toggles:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchToggles();
  }, []);

  const isFeatureEnabled = (feature: string): boolean => {
    // In test mode, all features are enabled
    if (testMode.enabled) return true;
    return features[feature] ?? true;
  };

  return (
    <FeatureToggleContext.Provider
      value={{
        features,
        testMode,
        isLoading,
        isFeatureEnabled,
        refetch: fetchToggles,
      }}
    >
      {children}
    </FeatureToggleContext.Provider>
  );
}

export function useFeatureToggle() {
  const context = useContext(FeatureToggleContext);
  if (!context) {
    throw new Error("useFeatureToggle must be used within FeatureToggleProvider");
  }
  return context;
}
