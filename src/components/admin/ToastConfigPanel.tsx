import { useState, useEffect } from "react";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Bell, Save, Eye, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ToastConfig {
  title: string;
  description?: string;
  duration: number;
  variant: string;
}

const TOAST_TYPES = [
  { id: "match_success", label: "Match Success", description: "When a new match is created" },
  { id: "message_sent", label: "Message Sent", description: "After sending a message" },
  { id: "profile_updated", label: "Profile Updated", description: "After profile changes are saved" },
];

const VARIANTS = [
  { value: "default", label: "Default" },
  { value: "success", label: "Success" },
  { value: "error", label: "Error" },
  { value: "warning", label: "Warning" },
  { value: "info", label: "Info" },
];

export function ToastConfigPanel() {
  const { settings, updateSetting, isLoading, logAuditAction } = useAdminSettings();
  const [configs, setConfigs] = useState<Record<string, ToastConfig>>({});
  const [activeToast, setActiveToast] = useState("match_success");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings.toast_configs) {
      setConfigs(settings.toast_configs);
    }
  }, [settings.toast_configs]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const success = await updateSetting("toast_configs", configs);
      if (success) {
        await logAuditAction("update_toast_configs", "toast_configs", activeToast);
        toast.success("Toast configurations saved");
      } else {
        throw new Error("Failed to save");
      }
    } catch (err) {
      toast.error("Failed to save configurations");
    } finally {
      setIsSaving(false);
    }
  };

  const updateConfig = (key: keyof ToastConfig, value: string | number) => {
    setConfigs((prev) => ({
      ...prev,
      [activeToast]: {
        ...prev[activeToast],
        [key]: value,
      },
    }));
  };

  const previewToast = () => {
    const config = configs[activeToast];
    if (!config) return;

    toast[config.variant === "error" ? "error" : config.variant === "success" ? "success" : "message"](
      config.title,
      {
        description: config.description,
        duration: config.duration,
      }
    );
  };

  const currentConfig = configs[activeToast];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Toast Notifications
              </CardTitle>
              <CardDescription>
                Customize toast notification messages shown to users.
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
        <CardContent className="space-y-6">
          {/* Toast Type Selection */}
          <div className="space-y-2">
            <Label>Toast Type</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {TOAST_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setActiveToast(type.id)}
                  className={`p-4 border rounded-lg text-left transition-all ${
                    activeToast === type.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground/50"
                  }`}
                >
                  <p className="font-medium">{type.label}</p>
                  <p className="text-sm text-muted-foreground">{type.description}</p>
                </button>
              ))}
            </div>
          </div>

          {currentConfig && (
            <>
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={currentConfig.title}
                  onChange={(e) => updateConfig("title", e.target.value)}
                  placeholder="Toast title..."
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Input
                  id="description"
                  value={currentConfig.description || ""}
                  onChange={(e) => updateConfig("description", e.target.value)}
                  placeholder="Additional details..."
                />
              </div>

              {/* Duration */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Duration</Label>
                  <span className="text-sm text-muted-foreground">
                    {currentConfig.duration / 1000} seconds
                  </span>
                </div>
                <Slider
                  value={[currentConfig.duration]}
                  onValueChange={([value]) => updateConfig("duration", value)}
                  min={1000}
                  max={10000}
                  step={500}
                />
              </div>

              {/* Variant */}
              <div className="space-y-2">
                <Label htmlFor="variant">Style Variant</Label>
                <Select
                  value={currentConfig.variant}
                  onValueChange={(value) => updateConfig("variant", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select variant" />
                  </SelectTrigger>
                  <SelectContent>
                    {VARIANTS.map((variant) => (
                      <SelectItem key={variant.value} value={variant.value}>
                        {variant.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Preview Button */}
              <Button variant="outline" onClick={previewToast}>
                <Eye className="h-4 w-4 mr-2" />
                Preview Toast
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
