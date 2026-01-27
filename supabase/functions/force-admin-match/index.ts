import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Hardcoded test employer ID (from gameData.ts)
const TEST_EMPLOYER_ID = "3d1017f8-9212-4931-ab73-ddf934434ce6";

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      console.error("[force-admin-match] Missing or invalid auth header");
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
      console.error("[force-admin-match] Invalid token:", claimsError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const candidateId = claimsData.claims.sub as string;
    console.log(`[force-admin-match] Candidate ID: ${candidateId}`);

    // 1. Ensure admin profile exists (using service role to bypass RLS)
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .upsert(
        {
          user_id: TEST_EMPLOYER_ID,
          full_name: "Admin",
          user_type: "employer",
          company_name: "Emploid Test",
        },
        { onConflict: "user_id" }
      );

    if (profileError) {
      console.error("[force-admin-match] Error upserting admin profile:", profileError);
      // Don't fail - profile might already exist
    }

    // 2. Check for existing match
    const { data: existingMatch, error: matchCheckError } = await supabaseAdmin
      .from("matches")
      .select("id")
      .eq("candidate_id", candidateId)
      .eq("employer_id", TEST_EMPLOYER_ID)
      .maybeSingle();

    if (matchCheckError) {
      console.error("[force-admin-match] Error checking existing match:", matchCheckError);
      return new Response(
        JSON.stringify({ error: "Failed to check existing match" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (existingMatch) {
      console.log(`[force-admin-match] Match already exists: ${existingMatch.id}`);
      return new Response(
        JSON.stringify({ matchId: existingMatch.id, alreadyExisted: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Create the match (using service role to bypass RLS)
    const { data: newMatch, error: insertError } = await supabaseAdmin
      .from("matches")
      .insert({
        candidate_id: candidateId,
        employer_id: TEST_EMPLOYER_ID,
        status: "active",
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("[force-admin-match] Error creating match:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to create match", details: insertError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[force-admin-match] Match created: ${newMatch.id}`);

    // 4. Optionally create swipe records for realism
    await supabaseAdmin
      .from("swipes")
      .upsert([
        { swiper_id: candidateId, swiped_id: TEST_EMPLOYER_ID, direction: "like" },
        { swiper_id: TEST_EMPLOYER_ID, swiped_id: candidateId, direction: "like" },
      ], { onConflict: "swiper_id,swiped_id" })
      .then(({ error }) => {
        if (error) console.warn("[force-admin-match] Swipe upsert warning:", error);
      });

    return new Response(
      JSON.stringify({ matchId: newMatch.id, alreadyExisted: false }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[force-admin-match] Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
