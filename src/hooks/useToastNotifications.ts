import { useCallback } from "react";
import { toast as sonnerToast } from "sonner";

// Toast notification types matching admin panel config
type ToastType =
  | "new_match"
  | "match_mutual"
  | "like_received"
  | "super_like_received"
  | "like_sent"
  | "pass_sent"
  | "new_message"
  | "message_read"
  | "unread_reminder"
  | "profile_complete"
  | "culture_game_done"
  | "synergy_quiz_done"
  | "photo_added"
  | "linkedin_imported"
  | "profile_milestone_25"
  | "profile_milestone_50"
  | "profile_milestone_75"
  | "new_job_posted"
  | "job_recommendation"
  | "application_received"
  | "application_sent"
  | "auth_error"
  | "network_error"
  | "validation_error"
  | "permission_denied"
  | "welcome"
  | "session_expiring"
  | "feature_unlocked";

// Default toast messages for each type
const TOAST_DEFAULTS: Record<ToastType, { title: string; description?: string }> = {
  new_match: { title: "It's a match! 🎉", description: "You've matched with someone new" },
  match_mutual: { title: "Mutual Match!", description: "You both liked each other" },
  like_received: { title: "Someone liked you! 👀", description: "Check your matches to see who" },
  super_like_received: { title: "You got a Super Like! ⭐", description: "Someone is really interested" },
  like_sent: { title: "Like sent! 💜", description: "Waiting to see if they like you back" },
  pass_sent: { title: "Passed", description: "On to the next one" },
  new_message: { title: "New message 💬", description: "You have a new message" },
  message_read: { title: "Message read ✓", description: "They've seen your message" },
  unread_reminder: { title: "Unread messages", description: "You have messages waiting" },
  profile_complete: { title: "Profile complete! 🎉", description: "You're ready to match" },
  culture_game_done: { title: "Culture game complete!", description: "Your culture profile is set" },
  synergy_quiz_done: { title: "Synergy quiz complete!", description: "Your work style is defined" },
  photo_added: { title: "Photo added! 📸", description: "Looking good!" },
  linkedin_imported: { title: "LinkedIn imported! 🔗", description: "Your profile is updated" },
  profile_milestone_25: { title: "25% profile complete!", description: "Keep going!" },
  profile_milestone_50: { title: "Halfway there! 🚀", description: "50% profile complete" },
  profile_milestone_75: { title: "Almost done! 💪", description: "75% profile complete" },
  new_job_posted: { title: "Job posted! 📋", description: "Candidates can now apply" },
  job_recommendation: { title: "New job match! 💼", description: "We found a job for you" },
  application_received: { title: "New application!", description: "Someone applied to your job" },
  application_sent: { title: "Application sent! ✅", description: "Good luck!" },
  auth_error: { title: "Authentication error", description: "Please sign in again" },
  network_error: { title: "Connection error", description: "Please check your internet" },
  validation_error: { title: "Invalid input", description: "Please check your entry" },
  permission_denied: { title: "Permission denied", description: "You don't have access" },
  welcome: { title: "Welcome! 👋", description: "Good to see you" },
  session_expiring: { title: "Session expiring", description: "Please save your work" },
  feature_unlocked: { title: "Feature unlocked! 🔓", description: "You can now access new features" },
};

export function useToastNotifications() {
  const showToast = useCallback((type: ToastType, customMessage?: string) => {
    const defaults = TOAST_DEFAULTS[type];

    switch (type) {
      case "new_match":
      case "match_mutual":
      case "profile_complete":
      case "culture_game_done":
      case "synergy_quiz_done":
      case "linkedin_imported":
      case "feature_unlocked":
      case "welcome":
        sonnerToast.success(customMessage || defaults.title, {
          description: defaults.description,
        });
        break;

      case "like_received":
      case "super_like_received":
      case "new_message":
      case "job_recommendation":
      case "application_received":
        sonnerToast(customMessage || defaults.title, {
          description: defaults.description,
          icon: "✨",
        });
        break;

      case "profile_milestone_25":
      case "profile_milestone_50":
      case "profile_milestone_75":
        sonnerToast.success(customMessage || defaults.title, {
          description: defaults.description,
        });
        break;

      case "auth_error":
      case "network_error":
      case "validation_error":
      case "permission_denied":
        sonnerToast.error(customMessage || defaults.title, {
          description: defaults.description,
        });
        break;

      case "like_sent":
      case "pass_sent":
        sonnerToast(customMessage || defaults.title, {
          description: defaults.description,
          duration: 1500,
        });
        break;

      default:
        sonnerToast(customMessage || defaults.title, {
          description: defaults.description,
        });
    }
  }, []);

  return { showToast };
}
