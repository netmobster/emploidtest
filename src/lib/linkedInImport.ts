import { supabase } from "@/integrations/supabase/client";

export interface LinkedInProfileData {
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

export interface ImportResult {
  success: boolean;
  data?: LinkedInProfileData;
  error?: string;
  requiresManualEntry?: boolean;
  linkedinUrl?: string;
  message?: string;
}

/**
 * Validates a LinkedIn profile URL
 */
export function isValidLinkedInUrl(url: string): boolean {
  const linkedinRegex = /^https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?$/i;
  return linkedinRegex.test(url.trim());
}

/**
 * Extracts the LinkedIn username from a URL
 */
export function extractLinkedInUsername(url: string): string | null {
  const match = url.match(/linkedin\.com\/in\/([\w-]+)/i);
  return match ? match[1] : null;
}

/**
 * Validates the LinkedIn URL and returns a result for manual entry
 */
export async function validateLinkedInUrl(
  linkedinUrl: string
): Promise<ImportResult> {
  // Validate URL format
  if (!isValidLinkedInUrl(linkedinUrl)) {
    return {
      success: false,
      error: "Invalid LinkedIn URL. Please use format: https://linkedin.com/in/yourprofile",
    };
  }

  try {
    const { data, error } = await supabase.functions.invoke("linkedin-import", {
      body: {
        linkedinUrl: linkedinUrl.trim(),
      },
    });

    if (error) {
      console.error("Edge function error:", error);
      return {
        success: false,
        error: error.message || "Failed to validate URL. Please try again.",
      };
    }

    if (data.error) {
      return {
        success: false,
        error: data.error,
      };
    }

    return {
      success: true,
      requiresManualEntry: data.requiresManualEntry,
      linkedinUrl: data.linkedinUrl,
      message: data.message,
    };
  } catch (err) {
    console.error("Validation error:", err);
    return {
      success: false,
      error: "Network error. Please check your connection and try again.",
    };
  }
}

/**
 * Creates profile data from manual entry
 */
export function createManualProfileData(
  formData: Partial<LinkedInProfileData>
): LinkedInProfileData {
  return {
    fullName: formData.fullName || null,
    headline: formData.headline || null,
    location: formData.location || null,
    summary: formData.summary || null,
    skills: formData.skills || [],
    profilePictureUrl: formData.profilePictureUrl || null,
    companyName: formData.companyName || null,
    industry: formData.industry || null,
    yearsOfExperience: formData.yearsOfExperience || null,
  };
}

/**
 * Gets the completion message based on profile percentage
 */
export function getCompletionMessage(
  percentage: number,
  userType: "candidate" | "employer",
  incompleteItems: string[]
): string {
  if (percentage >= 100) {
    return "Profile complete! You're ready to start matching. 🎉";
  }

  const itemsList = incompleteItems.slice(0, 2).join(" and ");
  
  if (percentage >= 80) {
    return `Profile ${percentage}% complete! Just add your ${itemsList} to get your checkmark badge.`;
  }
  
  if (percentage >= 60) {
    return `Profile ${percentage}% complete! Complete the ${itemsList} to boost your visibility.`;
  }
  
  return `Profile ${percentage}% complete! Keep going to unlock all features.`;
}
