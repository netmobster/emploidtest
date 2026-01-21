import { useState } from "react";
import { Calendar, ExternalLink, Loader2, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface CalendlyPromptDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CalendlyPromptDialog({
  isOpen,
  onClose,
  onSuccess,
}: CalendlyPromptDialogProps) {
  const { user } = useAuth();
  const [calendlyUrl, setCalendlyUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!user || !calendlyUrl.trim()) return;

    // Validate URL
    if (!calendlyUrl.includes("calendly.com")) {
      toast.error("Please enter a valid Calendly URL");
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ calendly_url: calendlyUrl.trim() })
        .eq("user_id", user.id);

      if (error) throw error;

      toast.success("Calendly link saved!");
      onSuccess();
    } catch (error) {
      console.error("Error saving Calendly URL:", error);
      toast.error("Failed to save Calendly link");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Set Up Interview Scheduling
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground">
            To schedule interviews, connect your Calendly account. Candidates
            will be able to book time directly from your calendar.
          </p>

          <div className="space-y-2">
            <Label htmlFor="calendly-url">Calendly Link</Label>
            <Input
              id="calendly-url"
              value={calendlyUrl}
              onChange={(e) => setCalendlyUrl(e.target.value)}
              placeholder="https://calendly.com/your-name/30min"
            />
            <p className="text-xs text-muted-foreground">
              Paste your Calendly scheduling link here
            </p>
          </div>

          <div className="pt-2 border-t">
            <a
              href="https://calendly.com/signup"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline inline-flex items-center gap-1"
            >
              Don't have Calendly? Sign up free
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!calendlyUrl.trim() || isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Save & Continue
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
