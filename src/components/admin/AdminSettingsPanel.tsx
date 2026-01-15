import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Settings, Plus, Trash2, Shield, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

export function AdminSettingsPanel() {
  const { settings, updateSetting, logAuditAction, isLoading } = useAdminSettings();
  const [protectedEmails, setProtectedEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings.protected_emails) {
      setProtectedEmails(settings.protected_emails);
    }
  }, [settings.protected_emails]);

  const handleAddEmail = () => {
    const email = newEmail.trim().toLowerCase();
    if (!email) return;

    if (!email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (protectedEmails.includes(email)) {
      toast.error("Email already in protected list");
      return;
    }

    setProtectedEmails((prev) => [...prev, email]);
    setNewEmail("");
  };

  const handleRemoveEmail = (email: string) => {
    // Don't allow removing the main super admin email
    if (email === "wearecleardigital@gmail.com") {
      toast.error("Cannot remove the primary super admin email");
      return;
    }

    setProtectedEmails((prev) => prev.filter((e) => e !== email));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const success = await updateSetting("protected_emails", protectedEmails);
      if (success) {
        await logAuditAction("update_protected_emails", "settings", null, {
          emails: protectedEmails,
        });
        toast.success("Protected emails saved");
      } else {
        throw new Error("Failed to save");
      }
    } catch (err) {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
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
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Protected Accounts
              </CardTitle>
              <CardDescription>
                These email addresses cannot be deleted from the system.
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
          {/* Add New Email */}
          <div className="flex gap-2">
            <Input
              placeholder="Enter email to protect..."
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddEmail()}
            />
            <Button onClick={handleAddEmail} disabled={!newEmail.trim()}>
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>

          {/* Protected Emails List */}
          <div className="space-y-2">
            {protectedEmails.map((email) => (
              <div
                key={email}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Shield className="h-4 w-4 text-primary" />
                  <span>{email}</span>
                  {email === "wearecleardigital@gmail.com" && (
                    <Badge variant="outline" className="text-xs">
                      Primary Admin
                    </Badge>
                  )}
                </div>
                {email !== "wearecleardigital@gmail.com" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveEmail(email)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Settings className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible actions. Proceed with extreme caution.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                Reset All Admin Settings
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset All Settings?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will reset all admin settings to their default values, including:
                  <ul className="list-disc list-inside mt-2">
                    <li>Feature toggles</li>
                    <li>Email templates</li>
                    <li>Toast configurations</li>
                  </ul>
                  <br />
                  Protected emails will NOT be affected.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction className="bg-destructive text-destructive-foreground">
                  Reset Settings
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
