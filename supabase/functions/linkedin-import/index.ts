import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LinkedInProfileData {
  fullName: string | null;
  headline: string | null;
  location: string | null;
  summary: string | null;
  skills: string[];
  profilePictureUrl: string | null;
  companyName: string | null;
  industry: string | null;
  yearsOfExperience: string | null;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { linkedinUrl, userType } = await req.json();

    if (!linkedinUrl) {
      return new Response(
        JSON.stringify({ error: "LinkedIn URL is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate LinkedIn URL format
    const linkedinRegex = /^https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?$/i;
    if (!linkedinRegex.test(linkedinUrl)) {
      return new Response(
        JSON.stringify({ error: "Invalid LinkedIn URL format. Expected: https://linkedin.com/in/username" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // LinkedIn URL is valid - return success with manual entry mode
    // The automated scraping service (Proxycurl) has been discontinued
    // Users will now manually enter their profile data
    console.log("LinkedIn URL validated, switching to manual entry mode");
    
    return new Response(
      JSON.stringify({ 
        success: true,
        requiresManualEntry: true,
        linkedinUrl: linkedinUrl,
        message: "Please enter your LinkedIn profile information manually below." 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in linkedin-import function:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
