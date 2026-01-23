import { supabase } from "@/integrations/supabase/client";

export interface WorkHistoryItem {
  title: string;
  company: string;
  duration: string | null;
  description: string | null;
  location: string | null;
}

export interface LinkedInProfileData {
  fullName: string | null;
  headline: string | null;
  location: string | null;
  summary: string | null;
  teaserBio?: string | null;
  skills: string[];
  profilePictureUrl: string | null;
  companyName: string | null;
  industry: string | null;
  yearsOfExperience: string | null;
  workHistory?: WorkHistoryItem[];
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
 * Imports LinkedIn profile data using Apify scraper
 * This may take 10-30 seconds as it scrapes the profile in real-time
 */
export async function importLinkedInProfile(
  linkedinUrl: string,
  userId?: string,
  userType: "candidate" | "employer" = "candidate"
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
        userId,
        userType,
      },
    });

    if (error) {
      console.error("Edge function error:", error);
      return {
        success: false,
        requiresManualEntry: true,
        linkedinUrl,
        message: "We couldn't grab all the details automatically. No worries—you can quickly fill them in below!",
      };
    }

    if (data.error && !data.requiresManualEntry) {
      return {
        success: false,
        error: data.error,
      };
    }

    if (data.requiresManualEntry) {
      return {
        success: false,
        requiresManualEntry: true,
        linkedinUrl: data.linkedinUrl,
        message: data.message || "We couldn't grab all the details automatically. No worries—you can quickly fill them in below!",
      };
    }

    // Success! Return the scraped data
    return {
      success: true,
      data: data.data as LinkedInProfileData,
      linkedinUrl: data.linkedinUrl,
    };
  } catch (err) {
    console.error("Import error:", err);
    return {
      success: false,
      requiresManualEntry: true,
      linkedinUrl,
      message: "We couldn't grab all the details automatically. No worries—you can quickly fill them in below!",
    };
  }
}

/**
 * Legacy function - kept for backwards compatibility
 * Now calls importLinkedInProfile internally
 */
export async function validateLinkedInUrl(
  linkedinUrl: string
): Promise<ImportResult> {
  return importLinkedInProfile(linkedinUrl);
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
    teaserBio: formData.summary ? formData.summary.substring(0, 100) : null,
    skills: formData.skills || [],
    profilePictureUrl: formData.profilePictureUrl || null,
    companyName: formData.companyName || null,
    industry: formData.industry || null,
    yearsOfExperience: formData.yearsOfExperience || null,
    workHistory: formData.workHistory || [],
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

/**
 * Format relative time for "Last synced" display
 */
export function formatSyncTime(date: Date | string | null): string {
  if (!date) return "Never synced";
  
  const syncDate = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - syncDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return syncDate.toLocaleDateString();
}