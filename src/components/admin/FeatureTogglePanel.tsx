import { useState, useEffect } from "react";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ToggleLeft, Save, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface FeatureToggle {
  id: string;
  label: string;
  description: string;
  category: "testing" | "ui" | "features";
}

const FEATURE_TOGGLES: FeatureToggle[] = [
  {
    id: "quick_match_panel",
    label: "Quick Match Panel",
    description: "Show the quick match testing panel on employer dashboard",
    category: "testing",
  },
  {
    id: "admin_match_button",
    label: "Admin Match Button",
    description: "Show admin match button on candidate swipe cards",
    category: "testing",
  },
  {
    id: "sample_mode",
    label: "Sample Mode",
    description: "Enable sample data navigation for testing",
    category: "testing",
  },
  {
    id: "debug_logging",
    label: "Debug Logging",
    description: "Enable verbose debug logging in console",
    category: "testing",
  },
];

export function FeatureTogglePanel() {
  const { settings, updateSetting, isLoading, logAuditAction } = useAdminSettings();
  const [toggles, setToggles] = useState<Record<string, boolean>>({});
  const [testMode, setTestMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings.feature_toggles) {
      setToggles(settings.feature_toggles);
    }
    if (settings.test_mode) {
      setTestMode(settings.test_mode.enabled);
    }
  }, [settings]);

  const handleToggle = (id: string, value: boolean) => {
    setToggles((prev) => ({ ...prev, [id]: value }));
  };

  const handleTestModeToggle = (value: boolean) => {
    setTestMode(value);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSetting("feature_toggles", toggles);
      await updateSetting("test_mode", { enabled: testMode });
      await logAuditAction("update_feature_toggles", "settings", null, {
        toggles,
        testMode,
      });
      toast.success("Feature toggles saved");
    } catch (err) {
      toast.error("Failed to save toggles");
    } finally {
      setIsSaving(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "testing":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
      case "ui":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "features":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      default:
        return "";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Test Mode Card */}
      <Card className={testMode ? "border-yellow-500" : ""}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className={`h-5 w-5 ${testMode ? "text-yellow-500" : "text-muted-foreground"}`} />
              <div>
                <CardTitle>Test Mode</CardTitle>
                <CardDescription>
                  When enabled, all testing features are turned on and a banner is shown.
                </CardDescription>
              </div>
            </div>
            <Switch
              checked={testMode}
              onCheckedChange={handleTestModeToggle}
            />
          </div>
        </CardHeader>
        {testMode && (
          <CardContent>
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-sm text-yellow-700">
                <strong>Test Mode is ON.</strong> All testing features are enabled regardless of individual toggle settings.
                Users will see a test mode banner across the app.
              </p>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Feature Toggles */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ToggleLeft className="h-5 w-5" />
                Feature Toggles
              </CardTitle>
              <CardDescription>
                Enable or disable specific features across the application.
              </CardDescription>
            </div>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {FEATURE_TOGGLES.map((feature) => (
              <div
                key={feature.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <Switch
                    id={feature.id}
                    checked={testMode || toggles[feature.id] || false}
                    onCheckedChange={(value) => handleToggle(feature.id, value)}
                    disabled={testMode}
                  />
                  <div className="space-y-1">
                    <Label htmlFor={feature.id} className="font-medium cursor-pointer">
                      {feature.label}
                    </Label>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
                <Badge variant="outline" className={getCategoryColor(feature.category)}>
                  {feature.category}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
