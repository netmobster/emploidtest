import { useState, useEffect } from "react";
import { PopupModal, useCalendlyEventListener } from "react-calendly";
import { Calendar, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useInterviews } from "@/hooks/useInterviews";
import { toast } from "sonner";

interface CalendlySchedulerProps {
  matchId: string;
  jobId?: string;
  employerId: string;
  candidateId: string;
  onScheduled?: () => void;
}

export function CalendlyScheduler({
  matchId,
  jobId,
  employerId,
  candidateId,
  onScheduled,
}: CalendlySchedulerProps) {
  const { profile } = useAuth();
  const { scheduleInterview } = useInterviews(matchId);
  const [calendlyUrl, setCalendlyUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  // Fetch employer's Calendly URL
  useEffect(() => {
    const fetchCalendlyUrl = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("calendly_url")
          .eq("user_id", employerId)
          .single();

        if (error) throw error;
        setCalendlyUrl(data?.calendly_url || null);
      } catch (error) {
        console.error("Error fetching Calendly URL:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCalendlyUrl();
  }, [employerId]);

  // Handle Calendly event scheduled using the hook
  useCalendlyEventListener({
    onEventScheduled: async (e: any) => {
      try {
        // Extract event details from Calendly callback
        const eventUri = e.data?.payload?.event?.uri;
        // The invitee start time is in the invitee object
        const scheduledTime = e.data?.payload?.invitee?.start_time || 
                              e.data?.payload?.event?.start_time;

        if (scheduledTime) {
          // Create interview record in our database
          await scheduleInterview({
            matchId,
            jobId,
            employerId,
            candidateId,
            scheduledAt: new Date(scheduledTime),
            notes: `Booked via Calendly${eventUri ? ` (${eventUri})` : ""}`,
          });

          toast.success("Interview scheduled successfully!");
          setIsOpen(false);
          onScheduled?.();
        } else {
          // Fallback if we can't get the time - still a success on Calendly's side
          toast.success("Interview scheduled! Check your email for details.");
          setIsOpen(false);
          onScheduled?.();
        }
      } catch (error) {
        console.error("Error recording interview:", error);
        // Still close modal - the booking happened on Calendly's side
        setIsOpen(false);
        toast.success("Interview scheduled! Check your email for details.");
        onScheduled?.();
      }
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!calendlyUrl) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Calendar className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">
            Scheduling not available yet
          </p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            The employer hasn't set up their scheduling link
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Schedule Interview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Book a time that works for you using the employer's scheduling calendar.
          </p>
          <Button onClick={() => setIsOpen(true)} className="w-full">
            <ExternalLink className="w-4 h-4 mr-2" />
            Open Scheduler
          </Button>
        </CardContent>
      </Card>

      {isOpen && (
        <PopupModal
          url={calendlyUrl}
          onModalClose={() => setIsOpen(false)}
          open={isOpen}
          rootElement={document.getElementById("root") as HTMLElement}
          prefill={{
            name: profile?.full_name || "",
            email: profile?.email || "",
          }}
        />
      )}
    </>
  );
}
