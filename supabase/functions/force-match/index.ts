import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Validate auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      console.error("[force-match] Missing or invalid auth header");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create admin client for privileged operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Create user client to validate the token
    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify the user's JWT
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseUser.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      console.error("[force-match] Invalid token:", claimsError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const requestingUserId = claimsData.claims.sub as string;
    console.log(`[force-match] Requesting user ID: ${requestingUserId}`);

    // Check if requesting user is a super_admin
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", requestingUserId)
      .eq("role", "super_admin")
      .maybeSingle();

    if (roleError) {
      console.error("[force-match] Error checking user role:", roleError);
      return new Response(
        JSON.stringify({ error: "Failed to verify admin status" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!roleData) {
      console.error("[force-match] User is not a super_admin");
      return new Response(
        JSON.stringify({ error: "Forbidden: Super admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const { candidateId, employerId, jobId } = await req.json();
    
    if (!candidateId || !employerId) {
      console.error("[force-match] Missing required fields");
      return new Response(
        JSON.stringify({ error: "candidateId and employerId are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[force-match] Creating match: candidate=${candidateId}, employer=${employerId}, job=${jobId || "none"}`);

    // Verify both users exist
    const { data: candidateProfile, error: candidateError } = await supabaseAdmin
      .from("profiles")
      .select("user_id, full_name, user_type")
      .eq("user_id", candidateId)
      .single();

    if (candidateError || !candidateProfile) {
      console.error("[force-match] Candidate not found:", candidateError);
      return new Response(
        JSON.stringify({ error: "Candidate not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: employerProfile, error: employerError } = await supabaseAdmin
      .from("profiles")
      .select("user_id, full_name, company_name, user_type")
      .eq("user_id", employerId)
      .single();

    if (employerError || !employerProfile) {
      console.error("[force-match] Employer not found:", employerError);
      return new Response(
        JSON.stringify({ error: "Employer not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify job exists if provided
    if (jobId) {
      const { data: job, error: jobError } = await supabaseAdmin
        .from("jobs")
        .select("id, title")
        .eq("id", jobId)
        .single();

      if (jobError || !job) {
        console.error("[force-match] Job not found:", jobError);
        return new Response(
          JSON.stringify({ error: "Job not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Check for existing match
    const { data: existingMatch, error: matchCheckError } = await supabaseAdmin
      .from("matches")
      .select("id")
      .eq("candidate_id", candidateId)
      .eq("employer_id", employerId)
      .maybeSingle();

    if (matchCheckError) {
      console.error("[force-match] Error checking existing match:", matchCheckError);
      return new Response(
        JSON.stringify({ error: "Failed to check existing match" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (existingMatch) {
      console.log(`[force-match] Match already exists: ${existingMatch.id}`);
      return new Response(
        JSON.stringify({ 
          matchId: existingMatch.id, 
          alreadyExisted: true,
          candidate: candidateProfile.full_name,
          employer: employerProfile.company_name || employerProfile.full_name,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create the match
    const matchData: Record<string, unknown> = {
      candidate_id: candidateId,
      employer_id: employerId,
      status: "active",
    };
    
    if (jobId) {
      matchData.job_id = jobId;
    }

    const { data: newMatch, error: insertError } = await supabaseAdmin
      .from("matches")
      .insert(matchData)
      .select("id")
      .single();

    if (insertError) {
      console.error("[force-match] Error creating match:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to create match", details: insertError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[force-match] Match created: ${newMatch.id}`);

    // Create mutual swipe records for realism
    await supabaseAdmin
      .from("swipes")
      .upsert([
        { swiper_id: candidateId, swiped_id: employerId, direction: "like", job_id: jobId || null },
        { swiper_id: employerId, swiped_id: candidateId, direction: "like", job_id: jobId || null },
      ], { onConflict: "swiper_id,swiped_id" })
      .then(({ error }) => {
        if (error) console.warn("[force-match] Swipe upsert warning:", error);
      });

    // Log to audit
    await supabaseAdmin
      .from("audit_logs")
      .insert({
        user_id: requestingUserId,
        action: "force_match_created",
        target_type: "match",
        target_id: newMatch.id,
        details: {
          candidate_id: candidateId,
          employer_id: employerId,
          job_id: jobId || null,
          candidate_name: candidateProfile.full_name,
          employer_name: employerProfile.company_name || employerProfile.full_name,
        },
      })
      .then(({ error }) => {
        if (error) console.warn("[force-match] Audit log warning:", error);
      });

    return new Response(
      JSON.stringify({ 
        matchId: newMatch.id, 
        alreadyExisted: false,
        candidate: candidateProfile.full_name,
        employer: employerProfile.company_name || employerProfile.full_name,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[force-match] Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
