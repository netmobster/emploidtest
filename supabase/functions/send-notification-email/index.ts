import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationEmailRequest {
  type: "new_match" | "new_message" | "job_update" | "quiz_completed";
  userId: string;
  data: {
    matchId?: string;
    otherUserName?: string;
    messagePreview?: string;
    jobTitle?: string;
    jobCompany?: string;
    candidateName?: string;
    responseCount?: number;
  };
}

const getEmailContent = (type: string, data: NotificationEmailRequest["data"]) => {
  switch (type) {
    case "new_match":
      return {
        subject: "🎉 You have a new match on Emploid!",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5;">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
              <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 16px 16px 0 0; padding: 32px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px;">🎉 New Match!</h1>
              </div>
              <div style="background: white; border-radius: 0 0 16px 16px; padding: 32px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <p style="font-size: 16px; color: #374151; line-height: 1.6;">
                  Great news! You matched with <strong>${data.otherUserName || "someone"}</strong> on Emploid.
                </p>
                <p style="font-size: 16px; color: #374151; line-height: 1.6;">
                  Start a conversation to explore this opportunity together!
                </p>
                <div style="text-align: center; margin-top: 32px;">
                  <a href="https://emploid.lovable.app/matches" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                    View Match
                  </a>
                </div>
              </div>
              <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 24px;">
                You're receiving this because you have email notifications enabled on Emploid.
              </p>
            </div>
          </body>
          </html>
        `,
      };

    case "new_message":
      return {
        subject: `💬 New message from ${data.otherUserName || "your match"}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5;">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
              <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 16px 16px 0 0; padding: 32px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px;">💬 New Message</h1>
              </div>
              <div style="background: white; border-radius: 0 0 16px 16px; padding: 32px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <p style="font-size: 16px; color: #374151; line-height: 1.6;">
                  <strong>${data.otherUserName || "Someone"}</strong> sent you a message:
                </p>
                <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin: 16px 0; border-left: 4px solid #6366f1;">
                  <p style="margin: 0; color: #4b5563; font-style: italic;">
                    "${data.messagePreview || "..."}"
                  </p>
                </div>
                <div style="text-align: center; margin-top: 32px;">
                  <a href="https://emploid.lovable.app/matches" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                    Reply Now
                  </a>
                </div>
              </div>
              <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 24px;">
                You're receiving this because you have email notifications enabled on Emploid.
              </p>
            </div>
          </body>
          </html>
        `,
      };

    case "job_update":
      return {
        subject: `📢 Update on ${data.jobTitle || "a saved job"}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5;">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
              <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 16px 16px 0 0; padding: 32px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px;">📢 Job Update</h1>
              </div>
              <div style="background: white; border-radius: 0 0 16px 16px; padding: 32px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <p style="font-size: 16px; color: #374151; line-height: 1.6;">
                  There's been an update to a job you saved:
                </p>
                <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin: 16px 0;">
                  <p style="margin: 0 0 4px 0; font-weight: 600; color: #1f2937;">${data.jobTitle || "Job Position"}</p>
                  <p style="margin: 0; color: #6b7280;">${data.jobCompany || "Company"}</p>
                </div>
                <div style="text-align: center; margin-top: 32px;">
                  <a href="https://emploid.lovable.app/saved-jobs" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                    View Saved Jobs
                  </a>
                </div>
              </div>
              <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 24px;">
                You're receiving this because you have email notifications enabled on Emploid.
              </p>
            </div>
          </body>
          </html>
        `,
      };

    case "quiz_completed":
      return {
        subject: `✨ ${data.candidateName || "A candidate"} completed your Get-to-Know-You quiz!`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5;">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
              <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 16px 16px 0 0; padding: 32px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px;">✨ Quiz Completed!</h1>
              </div>
              <div style="background: white; border-radius: 0 0 16px 16px; padding: 32px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <p style="font-size: 16px; color: #374151; line-height: 1.6;">
                  Great news! <strong>${data.candidateName || "A candidate"}</strong> has completed your Get-to-Know-You quiz with <strong>${data.responseCount || "several"} responses</strong>.
                </p>
                <p style="font-size: 16px; color: #374151; line-height: 1.6;">
                  Check out their responses to learn more about them before your next conversation!
                </p>
                <div style="text-align: center; margin-top: 32px;">
                  <a href="https://emploid.lovable.app/chat/${data.matchId || ""}" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                    View Responses
                  </a>
                </div>
              </div>
              <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 24px;">
                You're receiving this because you have email notifications enabled on Emploid.
              </p>
            </div>
          </body>
          </html>
        `,
      };

    default:
      return {
        subject: "Notification from Emploid",
        html: "<p>You have a new notification on Emploid.</p>",
      };
  }
};

const handler = async (req: Request): Promise<Response> => {
  console.log("send-notification-email function called");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { type, userId, data }: NotificationEmailRequest = await req.json();
    console.log("Received request:", { type, userId, data });

    // Get user profile and email
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("email, full_name, email_notifications_enabled")
      .eq("user_id", userId)
      .maybeSingle();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      throw new Error("Failed to fetch user profile");
    }

    if (!profile?.email) {
      console.log("No email found for user:", userId);
      return new Response(
        JSON.stringify({ success: false, message: "No email found for user" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if user has email notifications enabled
    if (profile.email_notifications_enabled === false) {
      console.log("Email notifications disabled for user:", userId);
      return new Response(
        JSON.stringify({ success: false, message: "Email notifications disabled" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const emailContent = getEmailContent(type, data);
    console.log("Sending email to:", profile.email);

    const emailResponse = await resend.emails.send({
      from: "Emploid <onboarding@resend.dev>",
      to: [profile.email],
      subject: emailContent.subject,
      html: emailContent.html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, emailResponse }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-notification-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
