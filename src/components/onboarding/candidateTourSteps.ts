import { Step } from "react-joyride";

export const CANDIDATE_TOUR_STEPS: Step[] = [
  {
    target: "#activity-digest",
    title: "The Pulse",
    content: "Real-time updates on your job search activity. See new matches, interview requests, and employer interest.",
    placement: "bottom",
    disableBeacon: true,
  },
  {
    target: "#synergy-score",
    title: "Your Synergy Profile",
    content: "This is how employers see your work style and culture fit. A higher score means better matches.",
    placement: "left",
    disableBeacon: true,
  },
  {
    target: "#job-recommendations",
    title: "Curated Matches",
    content: "Jobs filtered by synergy—quality over quantity. These are hand-picked based on your Big Rocks.",
    placement: "right",
    disableBeacon: true,
  },
  {
    target: "#profile-section",
    title: "The YOU Profile",
    content: "Complete your profile so the right teams find you first. This is your personal brand.",
    placement: "left",
    disableBeacon: true,
  },
];
