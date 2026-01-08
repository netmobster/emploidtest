import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface UserDigest {
  userId: string;
  email: string;
  fullName: string;
  userType: string;
  newMatches: number;
  newMessages: number;
  matchNames: string[];
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting daily digest email job...");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the timestamp for 24 hours ago
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayISO = yesterday.toISOString();

    // Fetch all users with their activity
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("user_id, email, full_name, user_type")
      .not("email", "is", null);

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      throw profilesError;
    }

    console.log(`Found ${profiles?.length || 0} profiles to process`);

    const digestsToSend: UserDigest[] = [];

    for (const profile of profiles || []) {
      const isEmployer = profile.user_type === "employer";
      const userIdField = isEmployer ? "employer_id" : "candidate_id";

      // Count new matches in the last 24 hours
      const { count: newMatchesCount } = await supabase
        .from("matches")
        .select("*", { count: "exact", head: true })
        .eq(userIdField, profile.user_id)
        .gte("matched_at", yesterdayISO);

      // Get new match names
      const { data: newMatches } = await supabase
        .from("matches")
        .select(`
          employer_id,
          candidate_id
        `)
        .eq(userIdField, profile.user_id)
        .gte("matched_at", yesterdayISO);

      const matchNames: string[] = [];
      if (newMatches) {
        for (const match of newMatches) {
          const otherUserId = isEmployer ? match.candidate_id : match.employer_id;
          const { data: otherProfile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("user_id", otherUserId)
            .single();
          if (otherProfile?.full_name) {
            matchNames.push(otherProfile.full_name);
          }
        }
      }

      // Count unread messages in the last 24 hours
      const { data: userMatches } = await supabase
        .from("matches")
        .select("id")
        .eq(userIdField, profile.user_id);

      let newMessagesCount = 0;
      if (userMatches) {
        const matchIds = userMatches.map((m) => m.id);
        if (matchIds.length > 0) {
          const { count } = await supabase
            .from("messages")
            .select("*", { count: "exact", head: true })
            .in("match_id", matchIds)
            .neq("sender_id", profile.user_id)
            .gte("created_at", yesterdayISO);
          newMessagesCount = count || 0;
        }
      }

      // Only add to digest if there's activity
      if ((newMatchesCount || 0) > 0 || newMessagesCount > 0) {
        digestsToSend.push({
          userId: profile.user_id,
          email: profile.email,
          fullName: profile.full_name || "User",
          userType: profile.user_type,
          newMatches: newMatchesCount || 0,
          newMessages: newMessagesCount,
          matchNames,
        });
      }
    }

    console.log(`Sending ${digestsToSend.length} digest emails`);

    // Send emails using Resend API
    const emailResults = [];
    for (const digest of digestsToSend) {
      try {
        const emailHtml = generateDigestEmail(digest);
        
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Emploid <noreply@resend.dev>",
            to: [digest.email],
            subject: `Your Daily Update: ${digest.newMatches} new match${digest.newMatches !== 1 ? "es" : ""}, ${digest.newMessages} new message${digest.newMessages !== 1 ? "s" : ""}`,
            html: emailHtml,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Failed to send email");
        }

        console.log(`Email sent to ${digest.email}:`, result);
        emailResults.push({ email: digest.email, success: true, result });
      } catch (emailError) {
        console.error(`Failed to send email to ${digest.email}:`, emailError);
        emailResults.push({ email: digest.email, success: false, error: emailError });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: profiles?.length || 0,
        emailsSent: emailResults.filter((r) => r.success).length,
        results: emailResults,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: unknown) {
    console.error("Error in send-daily-digest function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

function generateDigestEmail(digest: UserDigest): string {
  const matchList = digest.matchNames.length > 0
    ? digest.matchNames.map((name) => `<li>${name}</li>`).join("")
    : "";

  const userTypeLabel = digest.userType === "employer" ? "employer" : "candidate";
  const matchLabel = digest.userType === "employer" ? "candidates" : "employers";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Daily Digest</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Your Daily Update</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Here's what happened on Emploid</p>
  </div>
  
  <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="font-size: 18px; margin: 0 0 20px 0;">Hi ${digest.fullName}! 👋</p>
    
    <div style="background: white; border-radius: 8px; padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
      <h2 style="margin: 0 0 15px 0; font-size: 16px; color: #667eea;">📊 Activity Summary</h2>
      
      <div style="display: flex; justify-content: space-around; text-align: center;">
        <div style="flex: 1;">
          <div style="font-size: 32px; font-weight: bold; color: #667eea;">${digest.newMatches}</div>
          <div style="font-size: 12px; color: #666;">New Match${digest.newMatches !== 1 ? "es" : ""}</div>
        </div>
        <div style="flex: 1;">
          <div style="font-size: 32px; font-weight: bold; color: #764ba2;">${digest.newMessages}</div>
          <div style="font-size: 12px; color: #666;">New Message${digest.newMessages !== 1 ? "s" : ""}</div>
        </div>
      </div>
    </div>
    
    ${digest.matchNames.length > 0 ? `
    <div style="background: white; border-radius: 8px; padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
      <h2 style="margin: 0 0 15px 0; font-size: 16px; color: #667eea;">💼 New ${matchLabel.charAt(0).toUpperCase() + matchLabel.slice(1)} Matched</h2>
      <ul style="margin: 0; padding-left: 20px;">
        ${matchList}
      </ul>
    </div>
    ` : ""}
    
    <div style="text-align: center; margin-top: 25px;">
      <a href="https://emploid.com/matches" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: 600;">View Your Matches</a>
    </div>
    
    <p style="font-size: 12px; color: #999; text-align: center; margin-top: 30px;">
      You're receiving this email because you're a registered ${userTypeLabel} on Emploid.<br>
      <a href="#" style="color: #667eea;">Unsubscribe</a> from daily digests.
    </p>
  </div>
</body>
</html>
  `;
}

serve(handler);
