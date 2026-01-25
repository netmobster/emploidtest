import { Step } from "react-joyride";

export const EMPLOYER_TOUR_STEPS: Step[] = [
  {
    target: "#activity-digest",
    title: "The Pulse",
    content: "Real-time updates on your 1:1 connections. See new matches, messages, and hiring activity at a glance.",
    placement: "bottom",
    disableBeacon: true,
  },
  {
    target: "#job-postings",
    title: "The Brief",
    content: "Deep-context JDs that protect your time by filtering for synergy. Define your mission, Big Rocks, and Daily Stack.",
    placement: "right",
    disableBeacon: true,
  },
  {
    target: "#profile-strength",
    title: "Trust Layer",
    content: "Complete your profile to earn the 'Verified' status. Verified employers get 3x more quality candidates.",
    placement: "left",
    disableBeacon: true,
  },
  {
    target: "#company-details",
    title: "The Human Element",
    content: "Show candidates the team and mission they are actually joining. This is your competitive advantage.",
    placement: "top",
    disableBeacon: true,
  },
];
