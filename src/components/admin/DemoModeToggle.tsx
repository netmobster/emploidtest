import { useState } from "react";
import { Loader2, FlaskConical, Shield } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import { useFeatureToggle } from "@/contexts/FeatureToggleContext";
import { toast } from "sonner";

export function DemoModeToggle() {
  const { settings, updateSetting, logAuditAction, isLoading } = useAdminSettings();
  const { refetch } = useFeatureToggle();
  const [isUpdating, setIsUpdating] = useState(false);

  const testModeEnabled = settings.test_mode?.enabled ?? false;

  const handleToggle = async (enabled: boolean) => {
    setIsUpdating(true);
    try {
      const success = await updateSetting("test_mode", { enabled });
      if (success) {
        await logAuditAction(
          enabled ? "enable_test_mode" : "disable_test_mode",
          "settings",
          "test_mode",
          { enabled }
        );
        await refetch();
        toast.success(
          enabled
            ? "Demo mode enabled - verification requirements are bypassed"
            : "Demo mode disabled - verification is now required"
        );
      }
    } catch (err) {
      console.error("Failed to toggle demo mode:", err);
      toast.error("Failed to update demo mode");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={testModeEnabled ? "border-primary/50 bg-primary/5" : ""}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${testModeEnabled ? "bg-primary/10" : "bg-muted"}`}>
              <FlaskConical className={`w-5 h-5 ${testModeEnabled ? "text-primary" : "text-muted-foreground"}`} />
            </div>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                Public Demo Mode
                {testModeEnabled && (
                  <Badge variant="secondary" className="text-xs">Active</Badge>
                )}
              </CardTitle>
              <CardDescription>
                Bypass verification requirements for testing
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isUpdating && <Loader2 className="w-4 h-4 animate-spin" />}
            <Switch
              id="demo-mode"
              checked={testModeEnabled}
              onCheckedChange={handleToggle}
              disabled={isUpdating}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="rounded-lg bg-muted/50 p-4 space-y-3">
          <div className="flex items-start gap-2">
            <Shield className="w-4 h-4 text-muted-foreground mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-foreground">When Demo Mode is {testModeEnabled ? "ON" : "OFF"}:</p>
              <ul className="mt-1 space-y-1 text-muted-foreground">
                {testModeEnabled ? (
                  <>
                    <li>• Verification prompts are <span className="text-primary font-medium">hidden</span></li>
                    <li>• Users can access all features without verification</li>
                    <li>• Ideal for demos, testing, and development</li>
                  </>
                ) : (
                  <>
                    <li>• Employers must verify their company domain via OTP</li>
                    <li>• Candidates must verify identity via LinkedIn</li>
                    <li>• Full security requirements are enforced</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
