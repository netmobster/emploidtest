import { forwardRef } from "react";
import { MapPin, Wifi, Briefcase, Clock, Linkedin, Globe, FileText, ExternalLink, DollarSign, Target, Rocket, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { MatchScoreBreakdown } from "@/lib/matchScoreUtils";
import MatchScoreSection from "./MatchScoreSection";
import GatedBioSection from "./GatedBioSection";
import LockedSection from "./LockedSection";
import SwipeControls from "./SwipeControls";
import MatchedBadge from "./MatchedBadge";
import { VerifiedProfessionalBadge } from "@/components/verification/VerifiedProfessionalBadge";
import { VerifiedDomainBadge } from "@/components/verification/VerifiedDomainBadge";
import { TimezoneSynergyBadge } from "@/components/role/LocationWorkModeFields";

export interface CandidateData {
  id: string;
  userId?: string;
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
  matchBreakdown?: MatchScoreBreakdown;
  linkedinUrl?: string;
  websiteUrl?: string;
  portfolioUrl?: string;
  remotePreference?: string;
  resumeUrl?: string;
  coverImageUrl?: string;
  cultureCompatibility?: number;
  isVerified?: boolean;
  hasTimezoneSynergy?: boolean;
}

export interface JobData {
  id: string;
  userId?: string;
  title: string;
  company: string;
  description: string;
  location: string;
  salary: string;
  remote: boolean;
  benefits?: string[];
  requirements?: string[];
  matchScore: number;
  matchBreakdown?: MatchScoreBreakdown;
  cultureCompatibility?: number;
  hiringManagerName?: string;
  hiringManagerAvatar?: string;
  culturePreferences?: Record<string, string>;
  isVerified?: boolean;
  verifiedDomain?: string;
  hasTimezoneSynergy?: boolean;
  // Role definition fields
  missionStatement?: string;
  bigRocks?: { title: string; description?: string }[];
  dailyStack?: string[];
  vibeMode?: string;
}

interface FullProfileCardProps {
  data: CandidateData | JobData;
  type: "candidate" | "job";
  isMatched?: boolean;
  dragX?: number;
  onPass: () => void;
  onLike: () => void;
  onSuperLike?: () => void;
  onUndo?: () => void;
  canUndo?: boolean;
}

const isCandidate = (data: CandidateData | JobData): data is CandidateData => {
  return "name" in data;
};

const FullProfileCard = forwardRef<HTMLDivElement, FullProfileCardProps>(
  ({ data, type, isMatched = false, dragX = 0, onPass, onLike, onSuperLike, onUndo, canUndo }, ref) => {
    const candidate = isCandidate(data) ? data : null;
    const job = !isCandidate(data) ? data : null;

    // Calculate overlay opacity based on drag position
    const likeOpacity = Math.min(Math.max(dragX / 100, 0), 1);
    const passOpacity = Math.min(Math.max(-dragX / 100, 0), 1);

    // Default breakdown if not provided
    const matchBreakdown: MatchScoreBreakdown = data.matchBreakdown || {
      skillScore: Math.round(data.matchScore * 0.9),
      cultureScore: data.cultureCompatibility || Math.round(data.matchScore * 1.1),
      synergyScore: Math.round(data.matchScore * 0.95),
      totalScore: data.matchScore,
    };

    return (
      <div
        ref={ref}
        className="relative w-full h-full bg-card rounded-3xl shadow-card overflow-hidden flex flex-col"
      >
        {/* Like/Pass overlay indicators */}
        <div
          className="absolute inset-0 bg-green-500/20 z-20 pointer-events-none rounded-3xl border-4 border-green-500 transition-opacity"
          style={{ opacity: likeOpacity }}
        />
        <div
          className="absolute inset-0 bg-red-500/20 z-20 pointer-events-none rounded-3xl border-4 border-red-500 transition-opacity"
          style={{ opacity: passOpacity }}
        />

        {/* Like/Pass text indicators */}
        {likeOpacity > 0.3 && (
          <div className="absolute top-20 left-6 z-30 rotate-[-15deg]">
            <span className="text-4xl font-black text-green-500 border-4 border-green-500 px-4 py-2 rounded-lg bg-background/80">
              LIKE
            </span>
          </div>
        )}
        {passOpacity > 0.3 && (
          <div className="absolute top-20 right-6 z-30 rotate-[15deg]">
            <span className="text-4xl font-black text-red-500 border-4 border-red-500 px-4 py-2 rounded-lg bg-background/80">
              PASS
            </span>
          </div>
        )}
        {/* Matched Badge */}
        {isMatched && (
          <div className="absolute top-4 left-4 z-30">
            <MatchedBadge />
          </div>
        )}

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto touch-pan-y overscroll-contain">
          {/* Hero Section - Avatar/Photo */}
          <div className="relative h-56 bg-gradient-to-br from-primary/20 to-accent/20">
            {type === "candidate" && candidate ? (
              candidate.coverImageUrl ? (
                <img
                  src={candidate.coverImageUrl}
                  alt={candidate.name}
                  className="w-full h-full object-cover"
                />
              ) : candidate.avatar && candidate.avatar.startsWith("http") ? (
                <img
                  src={candidate.avatar}
                  alt={candidate.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  {candidate.avatar ? (
                    <span className="text-9xl">{candidate.avatar}</span>
                  ) : (
                    <span className="text-9xl font-bold text-primary/30">
                      {candidate.name.charAt(0)}
                    </span>
                  )}
                </div>
              )
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                <span className="text-9xl font-bold text-primary/30">
                  {job?.company.charAt(0)}
                </span>
              </div>
            )}
          </div>

          {/* Profile Info Section */}
          <div className="px-5 py-4 space-y-4">
            {/* Name, Title, Location */}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-foreground">
                  {candidate ? candidate.name : job?.title}
                </h1>
                {candidate?.isVerified && (
                  <VerifiedProfessionalBadge isVerified size="md" />
                )}
                {job?.isVerified && (
                  <VerifiedDomainBadge domain={job.verifiedDomain} isVerified size="md" />
                )}
              </div>
              <p className="text-base text-muted-foreground">
                {candidate ? candidate.title : job?.company}
              </p>

              {/* Location Badge - Prominent */}
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary" className="text-sm px-3 py-1 font-medium">
                  <MapPin className="w-3.5 h-3.5 mr-1.5" />
                  {data.location}
                </Badge>
                {data.remote && (
                  <Badge variant="outline" className="text-sm px-3 py-1">
                    <Wifi className="w-3.5 h-3.5 mr-1.5" />
                    Remote OK
                  </Badge>
                )}
                {(candidate?.hasTimezoneSynergy || job?.hasTimezoneSynergy) && (
                  <TimezoneSynergyBadge />
                )}
              </div>
            </div>

            {/* Match Score Breakdown - Clickable */}
            <MatchScoreSection
              breakdown={matchBreakdown}
              candidateName={candidate?.name}
              employerName={job?.company}
            />

            {/* Skills / Requirements */}
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                {type === "candidate" ? "Top Skills" : "Requirements"}
              </h2>
              <div className="flex flex-wrap gap-2">
                {(candidate ? candidate.skills : job?.requirements || []).slice(0, 6).map((item, index) => (
                  <Badge key={index} variant="secondary" className="px-3 py-1">
                    {item}
                  </Badge>
                ))}
                {((candidate ? candidate.skills : job?.requirements || []).length > 6) && (
                  <Badge variant="outline" className="px-3 py-1">
                    +{(candidate ? candidate.skills : job?.requirements || []).length - 6} more
                  </Badge>
                )}
              </div>
            </div>

            {/* Bio / Description - Gated for candidates */}
            {candidate && (
              <GatedBioSection
                bio={candidate.bio || "No bio provided yet."}
                isUnlocked={isMatched}
                teaserLength={100}
              />
            )}
            
            {/* Salary for Jobs - Prominent placement */}
            {job?.salary && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <DollarSign className="w-5 h-5 text-green-500" />
                <span className="font-semibold text-foreground">{job.salary}</span>
              </div>
            )}

            {/* About the Role - Mission & Big Rocks */}
            {job && (
              <div className="space-y-4">
                {/* Mission Statement */}
                {job.missionStatement && (
                  <div>
                    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      The Mission
                    </h2>
                    <div className="p-4 rounded-lg bg-secondary border border-border">
                      <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                        {job.missionStatement}
                      </p>
                    </div>
                  </div>
                )}

                {/* Big Rocks - 90-Day Outcomes */}
                {job.bigRocks && job.bigRocks.length > 0 && (
                  <div>
                    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Rocket className="w-4 h-4" />
                      The Three Big Rocks
                    </h2>
                    <p className="text-xs text-muted-foreground mb-3">Your 90-day focus areas</p>
                    <div className="space-y-2">
                      {job.bigRocks.map((rock, index) => (
                        <div 
                          key={index} 
                          className="p-3 rounded-lg bg-secondary border border-border"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-xs font-bold text-primary">{index + 1}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground">{rock.title}</p>
                              {rock.description && (
                                <p className="text-sm text-muted-foreground mt-1">{rock.description}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Daily Stack / Tools */}
                {job.dailyStack && job.dailyStack.length > 0 && (
                  <div>
                    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Daily Stack
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {job.dailyStack.map((tool, index) => (
                        <Badge key={index} variant="outline" className="px-3 py-1">
                          {tool}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Vibe Mode */}
                {job.vibeMode && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary">
                    <span className="text-sm text-muted-foreground">Work Style:</span>
                    <Badge variant="secondary" className="capitalize">
                      {job.vibeMode.replace(/-/g, " ")}
                    </Badge>
                  </div>
                )}

                {/* Fallback to description if no mission */}
                {!job.missionStatement && job.description && (
                  <div>
                    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                      About the Role
                    </h2>
                    <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                      {job.description}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Experience & Availability for Candidates */}
            {candidate && (
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                  <Briefcase className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Experience</p>
                    <p className="text-sm font-medium text-foreground">{candidate.experience || "Not specified"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Availability</p>
                    <p className="text-sm font-medium text-foreground">{candidate.availability || "Not specified"}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Benefits for Jobs */}
            {job?.benefits && job.benefits.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Benefits
                </h2>
                <div className="flex flex-wrap gap-2">
                  {job.benefits.map((benefit, index) => (
                    <Badge key={index} variant="outline" className="px-3 py-1">
                      {benefit}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Gated Extended Profile Section */}
            {!isMatched ? (
              <>
                {/* Hiring Team - Locked */}
                {type === "job" && (
                  <LockedSection
                    title="Hiring Team"
                    description="Match to see who you'll be working with"
                  />
                )}

                {/* Extended Links - Locked for Candidates */}
                {type === "candidate" && (candidate?.linkedinUrl || candidate?.websiteUrl || candidate?.portfolioUrl || candidate?.resumeUrl) && (
                  <LockedSection
                    title="Extended Profile"
                    description="Match to unlock portfolio, resume & links"
                  />
                )}
              </>
            ) : (
              <>
                {/* Unlocked Hiring Team */}
                {type === "job" && job?.hiringManagerName && (
                  <div>
                    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                      Hiring Team
                    </h2>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        {job.hiringManagerAvatar ? (
                          <img src={job.hiringManagerAvatar} alt={job.hiringManagerName} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <span className="text-lg font-semibold text-primary">{job.hiringManagerName.charAt(0)}</span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{job.hiringManagerName}</p>
                        <p className="text-sm text-muted-foreground">Hiring Manager</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Unlocked Links for Candidates */}
                {type === "candidate" && (candidate?.linkedinUrl || candidate?.websiteUrl || candidate?.portfolioUrl) && (
                  <div>
                    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                      Links
                    </h2>
                    <div className="flex flex-wrap gap-3">
                      {candidate?.linkedinUrl && (
                        <a
                          href={candidate.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-primary hover:underline"
                        >
                          <Linkedin className="w-4 h-4" />
                          LinkedIn
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {candidate?.websiteUrl && (
                        <a
                          href={candidate.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-primary hover:underline"
                        >
                          <Globe className="w-4 h-4" />
                          Website
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {candidate?.portfolioUrl && (
                        <a
                          href={candidate.portfolioUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-primary hover:underline"
                        >
                          <Globe className="w-4 h-4" />
                          Portfolio
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Unlocked Resume */}
                {candidate?.resumeUrl && (
                  <div>
                    <a
                      href={candidate.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg text-foreground hover:bg-secondary/80 transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                      View Resume
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </>
            )}

            {/* Spacer for fixed controls */}
            <div className="h-28" />
          </div>
        </div>

        {/* Fixed Action Buttons */}
        <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-card via-card to-transparent pt-8 z-10">
          <SwipeControls
            onPass={onPass}
            onLike={onLike}
            onSuperLike={onSuperLike}
            onUndo={onUndo}
            canUndo={canUndo}
          />
        </div>
      </div>
    );
  }
);

FullProfileCard.displayName = "FullProfileCard";

export default FullProfileCard;
