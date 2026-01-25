import { useState, useEffect } from "react";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Bell, Save, RotateCcw, Eye, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ToastConfig {
  title: string;
  description?: string;
  duration: number;
  variant: string;
  enabled: boolean;
}

const DEFAULT_TOAST_CONFIGS: Record<string, ToastConfig> = {
  match_success: {
    title: "It's a match! 🎉",
    description: "You can now start chatting",
    duration: 5000,
    variant: "success",
    enabled: true,
  },
  message_sent: {
    title: "Message sent",
    description: undefined,
    duration: 3000,
    variant: "default",
    enabled: true,
  },
  profile_updated: {
    title: "Profile updated",
    description: "Your changes have been saved",
    duration: 3000,
    variant: "success",
    enabled: true,
  },
  swipe_like: {
    title: "Liked!",
    description: "Waiting for them to like you back",
    duration: 2000,
    variant: "default",
    enabled: true,
  },
  job_created: {
    title: "Job posted",
    description: "Your role is now live",
    duration: 4000,
    variant: "success",
    enabled: true,
  },
  error_generic: {
    title: "Something went wrong",
    description: "Please try again",
    duration: 5000,
    variant: "destructive",
    enabled: true,
  },
};

const VARIANTS = [
  { value: "default", label: "Default" },
  { value: "success", label: "Success" },
  { value: "destructive", label: "Error" },
  { value: "warning", label: "Warning" },
];

const VARIANT_COLORS: Record<string, string> = {
  default: "bg-muted text-muted-foreground",
  success: "bg-green-500/10 text-green-600 border-green-500/20",
  destructive: "bg-destructive/10 text-destructive border-destructive/20",
  warning: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
};

export function ToastConfigPanel() {
  const { settings, updateSetting, isLoading, logAuditAction } = useAdminSettings();
  const [configs, setConfigs] = useState<Record<string, ToastConfig>>(DEFAULT_TOAST_CONFIGS);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (settings.toast_configs && Object.keys(settings.toast_configs).length > 0) {
      // Merge settings with defaults, ensuring all required fields exist
      const mergedConfigs: Record<string, ToastConfig> = { ...DEFAULT_TOAST_CONFIGS };
      Object.entries(settings.toast_configs).forEach(([key, value]) => {
        mergedConfigs[key] = {
          ...DEFAULT_TOAST_CONFIGS[key],
          ...value,
          enabled: (value as ToastConfig).enabled ?? DEFAULT_TOAST_CONFIGS[key]?.enabled ?? true,
        };
      });
      setConfigs(mergedConfigs);
    } else {
      setConfigs(DEFAULT_TOAST_CONFIGS);
    }
  }, [settings.toast_configs]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const success = await updateSetting("toast_configs", configs);
      if (success) {
        await logAuditAction("update_toast_configs", "toast_configs");
        toast.success("Toast configurations saved");
        setHasChanges(false);
      } else {
        throw new Error("Failed to save");
      }
    } catch (err) {
      toast.error("Failed to save configurations");
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetToDefaults = () => {
    setConfigs(DEFAULT_TOAST_CONFIGS);
    setHasChanges(true);
    toast.info("Configurations reset to defaults. Click Save to apply.");
  };

  const updateConfig = (toastId: string, key: keyof ToastConfig, value: string | number | boolean | undefined) => {
    setConfigs((prev) => {
      const updated = { ...prev };
      updated[toastId] = {
        ...updated[toastId],
        [key]: value,
      } as ToastConfig;
      return updated;
    });
    setHasChanges(true);
  };

  const previewToast = (toastId: string) => {
    const config = configs[toastId];
    if (!config) return;

    if (!config.enabled) {
      toast.info("This toast is currently disabled");
      return;
    }

    const toastFn = config.variant === "destructive" ? toast.error :
                    config.variant === "success" ? toast.success :
                    config.variant === "warning" ? toast.warning : toast;

    toastFn(config.title, {
      description: config.description,
      duration: config.duration,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const configKeys = Object.keys(configs);

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
                Configure toast notification appearance, duration, and enable/disable them.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleResetToDefaults}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button onClick={handleSave} disabled={isSaving || !hasChanges}>
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {configKeys.map((key) => {
              const config = configs[key];
              return (
                <AccordionItem key={key} value={key}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={config.enabled}
                        onCheckedChange={(checked) => updateConfig(key, "enabled", checked)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span className="capitalize">{key.replace(/_/g, " ")}</span>
                      <Badge variant="outline" className={VARIANT_COLORS[config.variant] || VARIANT_COLORS.default}>
                        {config.variant}
                      </Badge>
                      {!config.enabled && (
                        <Badge variant="outline" className="text-muted-foreground">
                          Off
                        </Badge>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {/* Title */}
                      <div className="space-y-2">
                        <Label htmlFor={`${key}-title`}>Title</Label>
                        <Input
                          id={`${key}-title`}
                          value={config.title}
                          onChange={(e) => updateConfig(key, "title", e.target.value)}
                        />
                      </div>

                      {/* Description */}
                      <div className="space-y-2">
                        <Label htmlFor={`${key}-description`}>Description (optional)</Label>
                        <Input
                          id={`${key}-description`}
                          value={config.description || ""}
                          onChange={(e) => updateConfig(key, "description", e.target.value || undefined)}
                          placeholder="Optional description"
                        />
                      </div>

                      {/* Variant */}
                      <div className="space-y-2">
                        <Label>Variant</Label>
                        <Select
                          value={config.variant}
                          onValueChange={(v) => updateConfig(key, "variant", v)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {VARIANTS.map((v) => (
                              <SelectItem key={v.value} value={v.value}>
                                {v.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Duration */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Duration</Label>
                          <span className="text-sm text-muted-foreground">
                            {config.duration / 1000}s
                          </span>
                        </div>
                        <Slider
                          value={[config.duration]}
                          onValueChange={([value]) => updateConfig(key, "duration", value)}
                          min={1000}
                          max={10000}
                          step={500}
                        />
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => previewToast(key)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Test Toast
                    </Button>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
