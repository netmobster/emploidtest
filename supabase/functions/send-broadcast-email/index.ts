import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    // Get auth token from request
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create client with user's token to verify they're authenticated
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the user is a super_admin
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      console.error("Auth error:", userError);
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user has super_admin role
    const { data: roleData, error: roleError } = await supabaseClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "super_admin")
      .maybeSingle();

    if (roleError || !roleData) {
      console.error("Role check failed:", roleError);
      return new Response(
        JSON.stringify({ error: "Unauthorized - Super admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { subject, body, audience } = await req.json();

    if (!subject || !body || !audience) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: subject, body, audience" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Sending broadcast email to audience: ${audience}`);

    // Get target users
    let query = supabaseClient
      .from("profiles")
      .select("email, full_name, email_notifications_enabled")
      .eq("email_notifications_enabled", true);

    if (audience === "candidates") {
      query = query.eq("user_type", "candidate");
    } else if (audience === "employers") {
      query = query.eq("user_type", "employer");
    }

    const { data: profiles, error: profilesError } = await query;

    if (profilesError) {
      console.error("Failed to fetch profiles:", profilesError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch recipients" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const recipients = profiles?.filter((p) => p.email) || [];
    console.log(`Found ${recipients.length} recipients`);

    if (recipients.length === 0) {
      return new Response(
        JSON.stringify({ message: "No recipients found" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if test mode is enabled
    const { data: testModeData } = await supabaseClient
      .from("admin_settings")
      .select("setting_value")
      .eq("setting_key", "test_mode")
      .single();

    const testModeEnabled = testModeData?.setting_value?.enabled === true;

    if (testModeEnabled) {
      console.log("Test mode enabled - skipping actual email send");
      return new Response(
        JSON.stringify({
          success: true,
          message: `Test mode: Would have sent to ${recipients.length} recipients`,
          recipientCount: recipients.length,
          testMode: true,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!resendApiKey) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send emails in batches (Resend allows up to 100 per request)
    const batchSize = 50;
    let sentCount = 0;
    let failedCount = 0;

    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);

      for (const recipient of batch) {
        try {
          const personalizedBody = body
            .replace(/{{userName}}/g, recipient.full_name || "there");

          const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${resendApiKey}`,
            },
            body: JSON.stringify({
              from: "Emploid <noreply@emploid.com>",
              to: [recipient.email],
              subject: subject,
              html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                  <h1 style="color: #333;">Emploid</h1>
                  <div style="white-space: pre-wrap;">${personalizedBody}</div>
                  <hr style="margin-top: 40px; border: none; border-top: 1px solid #eee;" />
                  <p style="color: #999; font-size: 12px;">
                    You received this email because you have an account on Emploid.
                    <br />
                    To unsubscribe, update your notification preferences in your account settings.
                  </p>
                </div>
              `,
            }),
          });

          if (res.ok) {
            sentCount++;
          } else {
            failedCount++;
            console.error(`Failed to send to ${recipient.email}:`, await res.text());
          }
        } catch (err) {
          failedCount++;
          console.error(`Error sending to ${recipient.email}:`, err);
        }
      }

      // Add a small delay between batches to avoid rate limits
      if (i + batchSize < recipients.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    console.log(`Broadcast complete: ${sentCount} sent, ${failedCount} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Broadcast sent to ${sentCount} recipients`,
        sentCount,
        failedCount,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Broadcast error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
