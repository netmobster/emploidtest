import CompactProfileCard from "./CompactProfileCard";

export interface CandidateData {
  id: string;
  name: string;
  title: string;
  avatar: string;
  bio: string;
  skills: string[];
  location: string;
  experience: string;
  availability: string;
  remote: boolean;
  matchScore: number;
  linkedinUrl?: string;
  websiteUrl?: string;
  portfolioUrl?: string;
  remotePreference?: string;
  resumeUrl?: string;
  coverImageUrl?: string;
}

export interface JobData {
  id: string;
  title: string;
  company: string;
  description: string;
  location: string;
  salary: string;
  remote: boolean;
  benefits?: string[];
  requirements?: string[];
  matchScore: number;
}

interface SwipeableProfileCardProps {
  data: CandidateData | JobData;
  type: "candidate" | "job";
  dragX?: number;
  onExpand?: () => void;
}

const SwipeableProfileCard = ({ data, type, dragX = 0, onExpand }: SwipeableProfileCardProps) => {
  return (
    <CompactProfileCard 
      data={data} 
      type={type} 
      dragX={dragX}
      onExpand={onExpand}
    />
  );
};

export default SwipeableProfileCard;
