import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

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

interface Interview {
  id: string;
  employer_id: string;
  candidate_id: string;
  scheduled_at: string;
  status: string;
  notes: string | null;
  match_id: string | null;
}

interface Profile {
  user_id: string;
  full_name: string | null;
  email: string | null;
  email_notifications_enabled: boolean | null;
  company_name: string | null;
}

// Helper to send notification email
async function sendNotificationEmail(
  to: string,
  subject: string,
  recipientName: string,
  body: string
) {
  try {
    const { error } = await resend.emails.send({
      from: "Emploid <notifications@resend.dev>",
      to: [to],
      subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 24px; border-radius: 12px 12px 0 0; }
            .content { background: #ffffff; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; }
            .footer { text-align: center; margin-top: 24px; color: #6b7280; font-size: 14px; }
            .button { display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">Emploid</h1>
            </div>
            <div class="content">
              <p>Hi ${recipientName || "there"},</p>
              <p>${body}</p>
              <a href="https://emploid.lovable.app/matches" class="button">View in App</a>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Emploid. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log("Email sent successfully to:", to);
    }
  } catch (err) {
    console.error("Failed to send email:", err);
  }
}

// Helper to create in-app notification
async function createNotification(
  supabase: SupabaseClient,
  userId: string,
  type: string,
  title: string,
  body: string,
  data: Record<string, unknown>
) {
  const { error } = await supabase.from("notifications").insert({
    user_id: userId,
    type,
    title,
    body,
    data,
  });

  if (error) {
    console.error("Error creating notification:", error);
  } else {
    console.log("Notification created for user:", userId);
  }
}

// Helper to get user profile
async function getProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("user_id, full_name, email, email_notifications_enabled, company_name")
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
  return data as Profile;
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

    // Try to find the interview by looking for a matching scheduled time or URI
    const { data: existingInterview, error: findError } = await supabase
      .from("interviews")
      .select("*")
      .ilike("notes", `%${scheduledEvent.uuid}%`)
      .maybeSingle();

    if (findError) {
      console.error("Error finding interview:", findError);
    }

    const interview = existingInterview as Interview | null;

    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    };

    switch (event) {
      case "invitee.created": {
        console.log("New invitee created:", invitee?.email);
        
        if (interview) {
          // Update status to confirmed
          const { error: updateError } = await supabase
            .from("interviews")
            .update({
              status: "confirmed",
              meeting_link: scheduledEvent.location?.join_url || null,
              updated_at: new Date().toISOString(),
            })
            .eq("id", interview.id);

          if (updateError) {
            console.error("Error updating interview:", updateError);
          } else {
            console.log("Interview confirmed:", interview.id);

            // Get profiles for both users
            const employerProfile = await getProfile(supabase, interview.employer_id);
            const candidateProfile = await getProfile(supabase, interview.candidate_id);

            const scheduledTime = formatDate(scheduledEvent.start_time);

            // Notify employer
            if (employerProfile) {
              await createNotification(
                supabase,
                interview.employer_id,
                "interview_confirmed",
                "Interview Confirmed!",
                `Your interview with ${candidateProfile?.full_name || "a candidate"} has been confirmed for ${scheduledTime}.`,
                { interview_id: interview.id, match_id: interview.match_id }
              );

              if (employerProfile.email && employerProfile.email_notifications_enabled !== false) {
                await sendNotificationEmail(
                  employerProfile.email,
                  "Interview Confirmed!",
                  employerProfile.full_name || "",
                  `Your interview with <strong>${candidateProfile?.full_name || "a candidate"}</strong> has been confirmed for <strong>${scheduledTime}</strong>.`
                );
              }
            }

            // Notify candidate
            if (candidateProfile) {
              await createNotification(
                supabase,
                interview.candidate_id,
                "interview_confirmed",
                "Interview Confirmed!",
                `Your interview with ${employerProfile?.full_name || "an employer"} has been confirmed for ${scheduledTime}.`,
                { interview_id: interview.id, match_id: interview.match_id }
              );

              if (candidateProfile.email && candidateProfile.email_notifications_enabled !== false) {
                await sendNotificationEmail(
                  candidateProfile.email,
                  "Interview Confirmed!",
                  candidateProfile.full_name || "",
                  `Your interview with <strong>${employerProfile?.full_name || employerProfile?.company_name || "an employer"}</strong> has been confirmed for <strong>${scheduledTime}</strong>.`
                );
              }
            }
          }
        }
        break;
      }

      case "invitee.canceled": {
        console.log("Invitee canceled:", invitee?.email);
        
        let interviewToUpdate: Interview | null = interview;

        // If not found by UUID, try to find by scheduled time
        if (!interviewToUpdate) {
          const { data: interviewByTime } = await supabase
            .from("interviews")
            .select("*")
            .eq("scheduled_at", scheduledEvent.start_time)
            .in("status", ["confirmed", "pending"])
            .maybeSingle();
          
          interviewToUpdate = interviewByTime as Interview | null;
        }

        if (interviewToUpdate) {
          const canceledBy = invitee?.cancellation?.canceled_by || "unknown";
          const cancelReason = invitee?.cancellation?.reason;

          const { error: updateError } = await supabase
            .from("interviews")
            .update({
              status: "cancelled",
              notes: (interviewToUpdate.notes || "") + 
                `\n\nCanceled by: ${canceledBy}` +
                (cancelReason ? `\nReason: ${cancelReason}` : ""),
              updated_at: new Date().toISOString(),
            })
            .eq("id", interviewToUpdate.id);

          if (updateError) {
            console.error("Error canceling interview:", updateError);
          } else {
            console.log("Interview cancelled:", interviewToUpdate.id);

            // Get profiles for both users
            const employerProfile = await getProfile(supabase, interviewToUpdate.employer_id);
            const candidateProfile = await getProfile(supabase, interviewToUpdate.candidate_id);

            const scheduledTime = formatDate(interviewToUpdate.scheduled_at);

            // Notify employer
            if (employerProfile) {
              await createNotification(
                supabase,
                interviewToUpdate.employer_id,
                "interview_cancelled",
                "Interview Cancelled",
                `Your interview scheduled for ${scheduledTime} has been cancelled.${cancelReason ? ` Reason: ${cancelReason}` : ""}`,
                { interview_id: interviewToUpdate.id, match_id: interviewToUpdate.match_id }
              );

              if (employerProfile.email && employerProfile.email_notifications_enabled !== false) {
                await sendNotificationEmail(
                  employerProfile.email,
                  "Interview Cancelled",
                  employerProfile.full_name || "",
                  `Your interview with <strong>${candidateProfile?.full_name || "a candidate"}</strong> scheduled for <strong>${scheduledTime}</strong> has been cancelled.${cancelReason ? `<br><br><em>Reason: ${cancelReason}</em>` : ""}`
                );
              }
            }

            // Notify candidate
            if (candidateProfile) {
              await createNotification(
                supabase,
                interviewToUpdate.candidate_id,
                "interview_cancelled",
                "Interview Cancelled",
                `Your interview scheduled for ${scheduledTime} has been cancelled.${cancelReason ? ` Reason: ${cancelReason}` : ""}`,
                { interview_id: interviewToUpdate.id, match_id: interviewToUpdate.match_id }
              );

              if (candidateProfile.email && candidateProfile.email_notifications_enabled !== false) {
                await sendNotificationEmail(
                  candidateProfile.email,
                  "Interview Cancelled",
                  candidateProfile.full_name || "",
                  `Your interview with <strong>${employerProfile?.full_name || "an employer"}</strong> scheduled for <strong>${scheduledTime}</strong> has been cancelled.${cancelReason ? `<br><br><em>Reason: ${cancelReason}</em>` : ""}`
                );
              }
            }
          }
        }
        break;
      }

      case "invitee_no_show": {
        console.log("Invitee no-show:", invitee?.email);
        
        if (interview) {
          const { error: updateError } = await supabase
            .from("interviews")
            .update({
              status: "completed",
              notes: (interview.notes || "") + "\n\nMarked as no-show",
              updated_at: new Date().toISOString(),
            })
            .eq("id", interview.id);

          if (updateError) {
            console.error("Error updating no-show:", updateError);
          } else {
            // Notify employer about no-show
            const employerProfile = await getProfile(supabase, interview.employer_id);
            const candidateProfile = await getProfile(supabase, interview.candidate_id);

            if (employerProfile) {
              await createNotification(
                supabase,
                interview.employer_id,
                "interview_no_show",
                "Interview No-Show",
                `${candidateProfile?.full_name || "The candidate"} did not attend the scheduled interview.`,
                { interview_id: interview.id, match_id: interview.match_id }
              );
            }
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
