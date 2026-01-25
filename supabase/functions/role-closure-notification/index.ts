import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

async function sendEmail(to: string, subject: string, html: string) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "Emploid <notifications@emploid.com>",
      to: [to],
      subject,
      html,
    }),
  });
  return response.json();
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RoleClosureNotification {
  jobId: string;
  jobTitle: string;
  companyName: string;
  status: "filled" | "unfilled";
  employerId: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { jobId, jobTitle, companyName, status, employerId }: RoleClosureNotification = await req.json();

    console.log(`Processing role closure notification for job: ${jobId}`);

    // Fetch all candidates who matched with this job
    const { data: matches, error: matchError } = await supabase
      .from("matches")
      .select("candidate_id")
      .eq("job_id", jobId)
      .eq("status", "active");

    if (matchError) {
      console.error("Error fetching matches:", matchError);
      throw matchError;
    }

    if (!matches || matches.length === 0) {
      console.log("No matched candidates to notify");
      return new Response(
        JSON.stringify({ success: true, notified: 0 }),
        { headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Fetch candidate emails
    const candidateIds = matches.map((m) => m.candidate_id);
    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("user_id, email, full_name")
      .in("user_id", candidateIds);

    if (profileError) {
      console.error("Error fetching profiles:", profileError);
      throw profileError;
    }

    const validProfiles = profiles?.filter((p) => p.email) || [];
    console.log(`Found ${validProfiles.length} candidates to notify`);

    // Send email notifications
    let sentCount = 0;
    const errors: string[] = [];

    for (const profile of validProfiles) {
      try {
        const subject = status === "filled"
          ? `Update: ${jobTitle} at ${companyName} has been filled`
          : `Update: ${jobTitle} at ${companyName} is no longer available`;

        const html = status === "filled"
          ? `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #333;">Role Update</h1>
              <p>Hi ${profile.full_name || "there"},</p>
              <p>We wanted to let you know that the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong> has been filled.</p>
              <p>Thank you for your interest in this opportunity. We encourage you to keep exploring other roles on Emploid that match your skills and preferences.</p>
              <p>Your Synergy Score is still active, and new opportunities matching your profile are added daily.</p>
              <p style="margin-top: 30px;">
                <a href="https://emploid.com/swipe/candidate" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">
                  Browse New Opportunities
                </a>
              </p>
              <p style="margin-top: 30px; color: #666; font-size: 14px;">
                Best regards,<br/>The Emploid Team
              </p>
            </div>
          `
          : `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #333;">Role Update</h1>
              <p>Hi ${profile.full_name || "there"},</p>
              <p>We wanted to let you know that the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong> is no longer available.</p>
              <p>This happens sometimes—companies change directions, budgets shift, or roles get restructured. It's nothing to do with you!</p>
              <p>The good news: your profile and Synergy Score are still active. Keep swiping—there are plenty more opportunities waiting for you.</p>
              <p style="margin-top: 30px;">
                <a href="https://emploid.com/swipe/candidate" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">
                  Find Your Next Match
                </a>
              </p>
              <p style="margin-top: 30px; color: #666; font-size: 14px;">
                Best regards,<br/>The Emploid Team
              </p>
            </div>
          `;

        const result = await sendEmail(profile.email, subject, html);

        if (result.error) {
          console.error(`Failed to send email to ${profile.email}:`, result.error);
          errors.push(profile.email);
        } else {
          sentCount++;
          console.log(`Sent notification to ${profile.email}`);
        }
      } catch (emailErr) {
        console.error(`Error sending to ${profile.email}:`, emailErr);
        errors.push(profile.email);
      }
    }

    // Create in-app notifications for all matched candidates
    for (const profile of profiles || []) {
      await supabase.from("notifications").insert({
        user_id: profile.user_id,
        type: "role_closed",
        title: status === "filled" ? "Role Filled" : "Role Closed",
        body: status === "filled"
          ? `The ${jobTitle} position at ${companyName} has been filled.`
          : `The ${jobTitle} position at ${companyName} is no longer available.`,
        data: { job_id: jobId, status },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        notified: sentCount,
        failed: errors.length,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in role-closure-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
