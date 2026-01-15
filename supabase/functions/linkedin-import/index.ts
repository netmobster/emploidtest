import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ProxycurlResponse {
  full_name?: string;
  headline?: string;
  summary?: string;
  city?: string;
  state?: string;
  country?: string;
  profile_pic_url?: string;
  experiences?: Array<{
    company?: string;
    title?: string;
    description?: string;
    starts_at?: { year: number; month: number };
    ends_at?: { year: number; month: number } | null;
  }>;
  skills?: string[];
  occupation?: string;
}

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

function calculateYearsOfExperience(experiences?: ProxycurlResponse["experiences"]): string | null {
  if (!experiences || experiences.length === 0) return null;

  const currentYear = new Date().getFullYear();
  let earliestYear = currentYear;

  for (const exp of experiences) {
    if (exp.starts_at?.year && exp.starts_at.year < earliestYear) {
      earliestYear = exp.starts_at.year;
    }
  }

  const years = currentYear - earliestYear;

  if (years <= 1) return "0-1";
  if (years <= 3) return "1-3";
  if (years <= 5) return "3-5";
  if (years <= 10) return "5-10";
  return "10+";
}

function getMockData(userType: string): LinkedInProfileData {
  if (userType === "employer") {
    return {
      fullName: "Sarah Mitchell",
      headline: "CEO & Co-founder",
      location: "Austin, TX",
      summary: "CEO and Co-founder passionate about building innovative teams and scaling startups. 15+ years experience in tech leadership.",
      skills: ["Leadership", "Strategy", "Team Building", "Fundraising", "Product Management"],
      profilePictureUrl: null,
      companyName: "TechVentures Inc.",
      industry: "Technology",
      yearsOfExperience: "10+",
    };
  }

  return {
    fullName: "Alex Johnson",
    headline: "Senior Software Engineer",
    location: "San Francisco, CA",
    summary: "Experienced full-stack developer with 8+ years building scalable web applications. Passionate about clean code, mentoring, and creating exceptional user experiences.",
    skills: ["React", "TypeScript", "Node.js", "PostgreSQL", "AWS", "Python"],
    profilePictureUrl: null,
    companyName: null,
    industry: null,
    yearsOfExperience: "5-10",
  };
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

    // Check for Proxycurl API key
    const proxycurlApiKey = Deno.env.get("PROXYCURL_API_KEY");

    if (!proxycurlApiKey) {
      console.log("PROXYCURL_API_KEY not configured, returning mock data");
      const mockData = getMockData(userType || "candidate");
      return new Response(
        JSON.stringify({ 
          data: mockData, 
          isMock: true,
          message: "Using demo data. Configure PROXYCURL_API_KEY for real LinkedIn imports." 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Call Proxycurl API
    console.log("Fetching LinkedIn profile from Proxycurl...");
    const proxycurlResponse = await fetch(
      `https://nubela.co/proxycurl/api/v2/linkedin?url=${encodeURIComponent(linkedinUrl)}&skills=include`,
      {
        headers: {
          Authorization: `Bearer ${proxycurlApiKey}`,
        },
      }
    );

    if (!proxycurlResponse.ok) {
      const errorText = await proxycurlResponse.text();
      console.error("Proxycurl API error:", proxycurlResponse.status, errorText);
      
      if (proxycurlResponse.status === 401) {
        return new Response(
          JSON.stringify({ error: "Invalid Proxycurl API key" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (proxycurlResponse.status === 404) {
        return new Response(
          JSON.stringify({ error: "LinkedIn profile not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "Failed to fetch LinkedIn profile" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const profileData: ProxycurlResponse = await proxycurlResponse.json();

    // Transform Proxycurl response to our format
    const location = [profileData.city, profileData.state, profileData.country]
      .filter(Boolean)
      .join(", ");

    const currentCompany = profileData.experiences?.find(exp => !exp.ends_at)?.company || null;

    const result: LinkedInProfileData = {
      fullName: profileData.full_name || null,
      headline: profileData.headline || profileData.occupation || null,
      location: location || null,
      summary: profileData.summary || null,
      skills: profileData.skills || [],
      profilePictureUrl: profileData.profile_pic_url || null,
      companyName: currentCompany,
      industry: null, // Proxycurl doesn't directly provide industry
      yearsOfExperience: calculateYearsOfExperience(profileData.experiences),
    };

    console.log("Successfully fetched LinkedIn profile");

    return new Response(
      JSON.stringify({ data: result, isMock: false }),
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
