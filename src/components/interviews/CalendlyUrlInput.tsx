import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, ExternalLink, Loader2, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface CalendlyUrlInputProps {
  className?: string;
}

export function CalendlyUrlInput({ className }: CalendlyUrlInputProps) {
  const { user } = useAuth();
  const [calendlyUrl, setCalendlyUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch current Calendly URL
  useEffect(() => {
    const fetchUrl = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("calendly_url")
          .eq("user_id", user.id)
          .single();

        if (error) throw error;
        setCalendlyUrl(data?.calendly_url || "");
      } catch (error) {
        console.error("Error fetching Calendly URL:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUrl();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      // Validate URL format if provided
      if (calendlyUrl && !calendlyUrl.includes("calendly.com")) {
        toast.error("Please enter a valid Calendly URL");
        return;
      }

      const { error } = await supabase
        .from("profiles")
        .update({ calendly_url: calendlyUrl || null })
        .eq("user_id", user.id);

      if (error) throw error;

      toast.success("Scheduling link saved");
    } catch (error) {
      console.error("Error saving Calendly URL:", error);
      toast.error("Failed to save scheduling link");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          Interview Scheduling
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Connect your Calendly to let candidates book interviews directly
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="calendly-url">Calendly Link</Label>
          <div className="flex gap-2">
            <Input
              id="calendly-url"
              placeholder="https://calendly.com/your-name/30min"
              value={calendlyUrl}
              onChange={(e) => setCalendlyUrl(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Paste your Calendly scheduling link here. Candidates will be able to book
            time directly from your calendar.
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
      </CardContent>
    </Card>
  );
}
