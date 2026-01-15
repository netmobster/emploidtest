import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Send, Users, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

type Audience = "all" | "candidates" | "employers";

interface AudienceStats {
  all: number;
  candidates: number;
  employers: number;
}

export function BroadcastEmailPanel() {
  const { logAuditAction } = useAdminSettings();
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState<Audience>("all");
  const [audienceStats, setAudienceStats] = useState<AudienceStats>({ all: 0, candidates: 0, employers: 0 });
  const [isSending, setIsSending] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    fetchAudienceStats();
  }, []);

  const fetchAudienceStats = async () => {
    setIsLoadingStats(true);
    try {
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("user_type, email_notifications_enabled");

      if (error) throw error;

      const enabledProfiles = profiles?.filter((p) => p.email_notifications_enabled !== false) || [];

      setAudienceStats({
        all: enabledProfiles.length,
        candidates: enabledProfiles.filter((p) => p.user_type === "candidate").length,
        employers: enabledProfiles.filter((p) => p.user_type === "employer").length,
      });
    } catch (err) {
      console.error("Failed to fetch audience stats:", err);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const getRecipientCount = () => {
    return audienceStats[audience];
  };

  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) {
      toast.error("Please fill in both subject and body");
      return;
    }

    setIsSending(true);
    try {
      const { error } = await supabase.functions.invoke("send-broadcast-email", {
        body: {
          subject,
          body,
          audience,
        },
      });

      if (error) throw error;

      await logAuditAction("send_broadcast", "email", null, {
        subject,
        audience,
        recipientCount: getRecipientCount(),
      });

      toast.success(`Broadcast sent to ${getRecipientCount()} recipients`);
      setSubject("");
      setBody("");
      setShowConfirmDialog(false);
    } catch (err) {
      toast.error("Failed to send broadcast email");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Broadcast Email
          </CardTitle>
          <CardDescription>
            Send an email to all users or a specific audience segment.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Audience Selection */}
          <div className="space-y-3">
            <Label>Target Audience</Label>
            <RadioGroup value={audience} onValueChange={(v) => setAudience(v as Audience)}>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                <RadioGroupItem value="all" id="all" />
                <Label htmlFor="all" className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <span>All Users</span>
                    <span className="text-sm text-muted-foreground">
                      {isLoadingStats ? "..." : audienceStats.all} recipients
                    </span>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                <RadioGroupItem value="candidates" id="candidates" />
                <Label htmlFor="candidates" className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <span>Candidates Only</span>
                    <span className="text-sm text-muted-foreground">
                      {isLoadingStats ? "..." : audienceStats.candidates} recipients
                    </span>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                <RadioGroupItem value="employers" id="employers" />
                <Label htmlFor="employers" className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <span>Employers Only</span>
                    <span className="text-sm text-muted-foreground">
                      {isLoadingStats ? "..." : audienceStats.employers} recipients
                    </span>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">Subject Line</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Announcement from Emploid"
            />
          </div>

          {/* Body */}
          <div className="space-y-2">
            <Label htmlFor="body">Email Content</Label>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your message here..."
              rows={10}
            />
          </div>

          {/* Send Button */}
          <div className="flex justify-end">
            <Button
              onClick={() => setShowConfirmDialog(true)}
              disabled={!subject.trim() || !body.trim() || getRecipientCount() === 0}
            >
              <Send className="h-4 w-4 mr-2" />
              Send to {getRecipientCount()} Recipients
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Confirm Broadcast
            </AlertDialogTitle>
            <AlertDialogDescription>
              You are about to send an email to <strong>{getRecipientCount()}</strong>{" "}
              {audience === "all" ? "users" : audience}.
              <br />
              <br />
              <strong>Subject:</strong> {subject}
              <br />
              <br />
              This action cannot be undone. Make sure your message is correct.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSend} disabled={isSending}>
              {isSending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Send Broadcast
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
