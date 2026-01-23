import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ApifyProfileData {
  full_name?: string;
  first_name?: string;
  last_name?: string;
  headline?: string;
  city?: string;
  country?: string;
  summary?: string;
  skills?: string[];
  profile_pic_url?: string;
  company?: string;
  industry?: string;
  positions?: Array<{
    title?: string;
    company_name?: string;
    duration?: string;
  }>;
}

interface LinkedInProfileData {
  fullName: string | null;
  headline: string | null;
  location: string | null;
  summary: string | null;
  teaserBio: string | null;
  skills: string[];
  profilePictureUrl: string | null;
  companyName: string | null;
  industry: string | null;
  yearsOfExperience: string | null;
}

// Map Apify output to our Emploid fields
function mapApifyToEmploid(apifyData: ApifyProfileData): LinkedInProfileData {
  // Calculate years of experience from positions if available
  let yearsOfExperience: string | null = null;
  if (apifyData.positions && apifyData.positions.length > 0) {
    const positionCount = apifyData.positions.length;
    if (positionCount >= 5) {
      yearsOfExperience = "10+";
    } else if (positionCount >= 3) {
      yearsOfExperience = "5-10";
    } else if (positionCount >= 2) {
      yearsOfExperience = "3-5";
    } else {
      yearsOfExperience = "1-3";
    }
  }

  // Create full name from first/last or use provided full_name
  const fullName = apifyData.full_name || 
    [apifyData.first_name, apifyData.last_name].filter(Boolean).join(" ") || 
    null;

  // Build location from city + country
  const locationParts = [apifyData.city, apifyData.country].filter(Boolean);
  const location = locationParts.length > 0 ? locationParts.join(", ") : null;

  // Extract first 100 chars for teaser bio
  const teaserBio = apifyData.summary 
    ? apifyData.summary.substring(0, 100) + (apifyData.summary.length > 100 ? "..." : "")
    : null;

  // Get company from current position or direct field
  const companyName = apifyData.company || 
    (apifyData.positions?.[0]?.company_name) || 
    null;

  // Extract first 5 skills for vibe tags
  const skills = (apifyData.skills || []).slice(0, 5);

  return {
    fullName,
    headline: apifyData.headline || null,
    location,
    summary: apifyData.summary || null,
    teaserBio,
    skills,
    profilePictureUrl: apifyData.profile_pic_url || null,
    companyName,
    industry: apifyData.industry || null,
    yearsOfExperience,
  };
}

// Upload profile picture to Supabase Storage
async function uploadProfilePicture(
  imageUrl: string,
  userId: string
): Promise<string | null> {
  try {
    console.log("Downloading profile picture from:", imageUrl);
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Fetch the image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      console.error("Failed to fetch profile image:", imageResponse.status);
      return null;
    }

    const imageBlob = await imageResponse.blob();
    const contentType = imageResponse.headers.get("content-type") || "image/jpeg";
    const extension = contentType.includes("png") ? "png" : "jpg";
    const fileName = `${userId}/avatar-${Date.now()}.${extension}`;

    console.log("Uploading to Supabase Storage:", fileName);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from("candidate-avatars")
      .upload(fileName, imageBlob, {
        contentType,
        upsert: true,
      });

    if (error) {
      console.error("Storage upload error:", error);
      return null;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("candidate-avatars")
      .getPublicUrl(fileName);

    console.log("Profile picture uploaded:", urlData.publicUrl);
    return urlData.publicUrl;
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    return null;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { linkedinUrl, userId } = await req.json();

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

    const APIFY_TOKEN = Deno.env.get("APIFY_TOKEN");
    if (!APIFY_TOKEN) {
      console.error("APIFY_TOKEN not configured");
      return new Response(
        JSON.stringify({ 
          success: false,
          requiresManualEntry: true,
          error: "LinkedIn import service is not configured. Please enter your details manually." 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Starting Apify LinkedIn scraper for:", linkedinUrl);

    // Call Apify's LinkedIn Profile Scraper Actor (user-confirmed Actor ID)
    const actorId = "AgfKk0sQQxkpQJ1Dt";
    const apifyUrl = `https://api.apify.com/v2/acts/${actorId}/run-sync-get-dataset-items?token=${APIFY_TOKEN}`;

    const apifyResponse = await fetch(apifyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        urls: [linkedinUrl],
      }),
    });

    if (!apifyResponse.ok) {
      const errorText = await apifyResponse.text();
      console.error("Apify API error:", apifyResponse.status, errorText);
      
      // Return graceful fallback to manual entry
      return new Response(
        JSON.stringify({
          success: false,
          requiresManualEntry: true,
          linkedinUrl,
          message: "We couldn't grab all the details automatically. No worries—you can quickly fill them in below!",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apifyResults = await apifyResponse.json();
    console.log("Apify results:", JSON.stringify(apifyResults).substring(0, 500));

    // Check if we got any data
    if (!apifyResults || apifyResults.length === 0) {
      console.log("No data returned from Apify - profile may be private");
      return new Response(
        JSON.stringify({
          success: false,
          requiresManualEntry: true,
          linkedinUrl,
          message: "We couldn't grab all the details automatically. No worries—you can quickly fill them in below!",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Map the Apify data to our format
    const apifyData = apifyResults[0] as ApifyProfileData;
    const profileData = mapApifyToEmploid(apifyData);

    console.log("Mapped profile data:", JSON.stringify(profileData));

    // If we have a profile picture and user ID, upload it to storage
    if (profileData.profilePictureUrl && userId) {
      const uploadedUrl = await uploadProfilePicture(
        profileData.profilePictureUrl,
        userId
      );

      if (uploadedUrl) {
        profileData.profilePictureUrl = uploadedUrl;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: profileData,
        linkedinUrl,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in linkedin-import function:", error);
    
    // Return graceful fallback
    return new Response(
      JSON.stringify({
        success: false,
        requiresManualEntry: true,
        message: "We couldn't grab all the details automatically. No worries—you can quickly fill them in below!",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
