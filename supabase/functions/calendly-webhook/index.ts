import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CalendlyPayload {
  event: "invitee.created" | "invitee.canceled" | "invitee_no_show" | "routing_form_submission.created";
  payload: {
    event?: string;
    event_type?: {
      uuid: string;
      name: string;
    };
    invitee?: {
      uuid: string;
      email: string;
      name: string;
      timezone: string;
      created_at: string;
      canceled: boolean;
      cancellation?: {
        canceled_by: string;
        reason: string;
      };
    };
    scheduled_event?: {
      uri: string;
      uuid: string;
      name: string;
      status: "active" | "canceled";
      start_time: string;
      end_time: string;
      event_type: string;
      location?: {
        type: string;
        join_url?: string;
      };
    };
    cancel_url?: string;
    reschedule_url?: string;
    created_at?: string;
    uri?: string;
    rescheduled?: boolean;
    new_invitee?: string;
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: CalendlyPayload = await req.json();
    console.log("Calendly webhook received:", JSON.stringify(body, null, 2));

    const { event, payload } = body;
    const scheduledEvent = payload.scheduled_event;
    const invitee = payload.invitee;

    if (!scheduledEvent) {
      console.log("No scheduled event in payload, skipping");
      return new Response(JSON.stringify({ success: true, message: "No action needed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Try to find the interview by looking for a matching scheduled time
    // Since we store the Calendly URI in notes, we can search for it
    const eventUri = scheduledEvent.uri;
    
    // First try to find by URI in notes
    const { data: existingInterview, error: findError } = await supabase
      .from("interviews")
      .select("*")
      .ilike("notes", `%${scheduledEvent.uuid}%`)
      .maybeSingle();

    if (findError) {
      console.error("Error finding interview:", findError);
    }

    switch (event) {
      case "invitee.created": {
        // New booking - this is handled by the frontend CalendlyScheduler
        // but we can also create/update here as a backup
        console.log("New invitee created:", invitee?.email);
        
        if (!existingInterview) {
          console.log("Interview not found in database - may have been created by frontend");
        } else {
          // Update status to confirmed
          const { error: updateError } = await supabase
            .from("interviews")
            .update({
              status: "confirmed",
              meeting_link: scheduledEvent.location?.join_url || null,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existingInterview.id);

          if (updateError) {
            console.error("Error updating interview:", updateError);
          } else {
            console.log("Interview confirmed:", existingInterview.id);
          }
        }
        break;
      }

      case "invitee.canceled": {
        console.log("Invitee canceled:", invitee?.email);
        
        if (existingInterview) {
          const { error: updateError } = await supabase
            .from("interviews")
            .update({
              status: "cancelled",
              notes: existingInterview.notes + 
                `\n\nCanceled by: ${invitee?.cancellation?.canceled_by || "unknown"}` +
                (invitee?.cancellation?.reason ? `\nReason: ${invitee.cancellation.reason}` : ""),
              updated_at: new Date().toISOString(),
            })
            .eq("id", existingInterview.id);

          if (updateError) {
            console.error("Error canceling interview:", updateError);
          } else {
            console.log("Interview cancelled:", existingInterview.id);
          }
        } else {
          // Try to find by scheduled time
          const { data: interviewByTime, error: timeError } = await supabase
            .from("interviews")
            .select("*")
            .eq("scheduled_at", scheduledEvent.start_time)
            .eq("status", "confirmed")
            .maybeSingle();

          if (timeError) {
            console.error("Error finding interview by time:", timeError);
          } else if (interviewByTime) {
            const { error: updateError } = await supabase
              .from("interviews")
              .update({
                status: "cancelled",
                updated_at: new Date().toISOString(),
              })
              .eq("id", interviewByTime.id);

            if (updateError) {
              console.error("Error canceling interview:", updateError);
            } else {
              console.log("Interview cancelled by time match:", interviewByTime.id);
            }
          }
        }
        break;
      }

      case "invitee_no_show": {
        console.log("Invitee no-show:", invitee?.email);
        
        if (existingInterview) {
          const { error: updateError } = await supabase
            .from("interviews")
            .update({
              status: "completed",
              notes: existingInterview.notes + "\n\nMarked as no-show",
              updated_at: new Date().toISOString(),
            })
            .eq("id", existingInterview.id);

          if (updateError) {
            console.error("Error updating no-show:", updateError);
          }
        }
        break;
      }

      default:
        console.log("Unhandled event type:", event);
    }

    return new Response(
      JSON.stringify({ success: true, event, message: "Webhook processed" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Calendly webhook error:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
