import { useState, useEffect } from "react";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Mail, Save, Eye, RotateCcw, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface EmailTemplate {
  subject: string;
  body: string;
  enabled: boolean;
}

const DEFAULT_TEMPLATES: Record<string, EmailTemplate> = {
  new_match: {
    subject: "You have a new match on Emploid!",
    body: `Hi {{userName}},

Great news! You've matched with {{matchName}} on Emploid.

This means both of you are interested in connecting. Start the conversation and see where it goes!

Best,
The Emploid Team`,
    enabled: true,
  },
  new_message: {
    subject: "New message from {{senderName}}",
    body: `Hi {{userName}},

{{senderName}} sent you a message on Emploid:

"{{messagePreview}}"

Reply now to keep the conversation going.

Best,
The Emploid Team`,
    enabled: true,
  },
  daily_digest: {
    subject: "Your Emploid Daily Digest",
    body: `Hi {{userName}},

Here's what happened on Emploid today:

• New matches waiting for you
• Unread messages in your inbox  
• New roles matching your profile

Log in to explore!

Best,
The Emploid Team`,
    enabled: false,
  },
  broadcast: {
    subject: "{{customSubject}}",
    body: `{{customBody}}`,
    enabled: true,
  },
  welcome: {
    subject: "Welcome to Emploid!",
    body: `Hi {{userName}},

Welcome to Emploid – where meaningful professional connections happen.

Complete your profile to start matching with great opportunities.

Best,
The Emploid Team`,
    enabled: true,
  },
};

const TEMPLATE_VARIABLES = [
  { name: "{{userName}}", description: "Recipient's name" },
  { name: "{{matchName}}", description: "Name of matched user" },
  { name: "{{senderName}}", description: "Message sender's name" },
  { name: "{{messagePreview}}", description: "Preview of the message" },
  { name: "{{jobTitle}}", description: "Job title" },
  { name: "{{companyName}}", description: "Company name" },
];

export function EmailTemplatePanel() {
  const { settings, updateSetting, isLoading, logAuditAction } = useAdminSettings();
  const [templates, setTemplates] = useState<Record<string, EmailTemplate>>(DEFAULT_TEMPLATES);
  const [activeTemplate, setActiveTemplate] = useState("new_match");
  const [isSaving, setIsSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (settings.email_templates && Object.keys(settings.email_templates).length > 0) {
      setTemplates({ ...DEFAULT_TEMPLATES, ...settings.email_templates });
    } else {
      setTemplates(DEFAULT_TEMPLATES);
    }
  }, [settings.email_templates]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const success = await updateSetting("email_templates", templates);
      if (success) {
        await logAuditAction("update_email_templates", "email_templates", activeTemplate);
        toast.success("Email templates saved");
        setHasChanges(false);
      } else {
        throw new Error("Failed to save");
      }
    } catch (err) {
      toast.error("Failed to save templates");
    } finally {
      setIsSaving(false);
    }
  };

  const updateTemplate = (key: keyof EmailTemplate, value: string | boolean) => {
    setTemplates((prev) => ({
      ...prev,
      [activeTemplate]: {
        ...prev[activeTemplate],
        [key]: value,
      },
    }));
    setHasChanges(true);
  };

  const handleResetToDefaults = () => {
    setTemplates(DEFAULT_TEMPLATES);
    setHasChanges(true);
    toast.info("Templates reset to defaults. Click Save to apply.");
  };

  const renderPreview = (text: string) => {
    return text
      .replace(/{{userName}}/g, "John Doe")
      .replace(/{{matchName}}/g, "Jane Smith")
      .replace(/{{senderName}}/g, "Jane Smith")
      .replace(/{{messagePreview}}/g, "Hey! Great to connect with you...")
      .replace(/{{jobTitle}}/g, "Senior Developer")
      .replace(/{{companyName}}/g, "TechCorp Inc.");
  };

  const currentTemplate = templates[activeTemplate];

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
                <Mail className="h-5 w-5" />
                Email Templates
              </CardTitle>
              <CardDescription>
                Customize email templates for different notification types.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleResetToDefaults}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
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
          <Tabs value={activeTemplate} onValueChange={setActiveTemplate}>
            <TabsList className="mb-6 flex-wrap">
              <TabsTrigger value="new_match">New Match</TabsTrigger>
              <TabsTrigger value="new_message">New Message</TabsTrigger>
              <TabsTrigger value="daily_digest">Daily Digest</TabsTrigger>
              <TabsTrigger value="broadcast">Broadcast</TabsTrigger>
              <TabsTrigger value="welcome">Welcome</TabsTrigger>
            </TabsList>

            {Object.keys(templates).map((templateKey) => (
              <TabsContent key={templateKey} value={templateKey} className="space-y-6">
                {currentTemplate && templateKey === activeTemplate && (
                  <>
                    {/* Template Settings */}
                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Switch
                          id="enabled"
                          checked={currentTemplate.enabled}
                          onCheckedChange={(checked) => updateTemplate("enabled", checked)}
                        />
                        <Label htmlFor="enabled">
                          {currentTemplate.enabled ? "Enabled" : "Disabled"}
                        </Label>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPreviewMode(!previewMode)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        {previewMode ? "Edit" : "Preview"}
                      </Button>
                    </div>

                    {/* Subject Line */}
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject Line</Label>
                      {previewMode ? (
                        <div className="p-3 bg-muted rounded-lg font-medium">
                          {renderPreview(currentTemplate.subject)}
                        </div>
                      ) : (
                        <Input
                          id="subject"
                          value={currentTemplate.subject}
                          onChange={(e) => updateTemplate("subject", e.target.value)}
                          placeholder="Email subject..."
                        />
                      )}
                    </div>

                    {/* Body */}
                    <div className="space-y-2">
                      <Label htmlFor="body">Email Body</Label>
                      {previewMode ? (
                        <div className="p-4 bg-muted rounded-lg min-h-[200px] whitespace-pre-wrap">
                          {renderPreview(currentTemplate.body)}
                        </div>
                      ) : (
                        <Textarea
                          id="body"
                          value={currentTemplate.body}
                          onChange={(e) => updateTemplate("body", e.target.value)}
                          placeholder="Email body content..."
                          rows={8}
                        />
                      )}
                    </div>

                    {/* Variable Reference */}
                    {!previewMode && (
                      <div className="p-4 bg-muted/30 rounded-lg">
                        <h4 className="font-medium mb-3">Available Variables</h4>
                        <div className="flex flex-wrap gap-2">
                          {TEMPLATE_VARIABLES.map((variable) => (
                            <Badge
                              key={variable.name}
                              variant="outline"
                              className="cursor-pointer hover:bg-primary/10"
                              onClick={() => {
                                navigator.clipboard.writeText(variable.name);
                                toast.success(`Copied ${variable.name}`);
                              }}
                            >
                              {variable.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
