import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Briefcase, Clock, Wifi, Star, Linkedin, Globe, FileText, ExternalLink, Palette } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { CompanyCultureSection } from "@/components/culture/CompanyCultureSection";

interface CandidateData {
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

interface JobData {
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
  culturePreferences?: Record<string, string>;
}

interface ExtendedProfileModalProps {
  isOpen: boolean;
  data: CandidateData | JobData | null;
  type: "candidate" | "job";
  onClose: () => void;
  onLike: () => void;
  onPass: () => void;
}

const isCandidate = (data: CandidateData | JobData): data is CandidateData => {
  return "name" in data;
};

const ExtendedProfileModal = ({
  isOpen,
  data,
  type,
  onClose,
  onLike,
  onPass,
}: ExtendedProfileModalProps) => {
  if (!data) return null;

  const matchScore = data.matchScore;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-orange-500";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-500/10 border-green-500/30";
    if (score >= 60) return "bg-yellow-500/10 border-yellow-500/30";
    return "bg-orange-500/10 border-orange-500/30";
  };

  const candidate = isCandidate(data) ? data : null;
  const job = !isCandidate(data) ? data : null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 top-16 z-50 bg-background rounded-t-3xl overflow-hidden flex flex-col"
          >
            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 bg-background/80 backdrop-blur-sm rounded-full"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </Button>

            {/* Scrollable content */}
            <ScrollArea className="flex-1">
              {/* Hero Section */}
              <div className="relative h-48 bg-gradient-to-br from-primary/20 to-accent/20">
                {candidate?.coverImageUrl && (
                  <img
                    src={candidate.coverImageUrl}
                    alt="Cover"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* Avatar overlapping hero */}
              <div className="relative px-6 -mt-16">
                <div className="flex items-end gap-4">
                  {type === "candidate" && candidate ? (
                    <div className="w-28 h-28 rounded-2xl bg-card border-4 border-background shadow-lg flex items-center justify-center text-4xl font-bold text-primary overflow-hidden flex-shrink-0">
                      {candidate.avatar && candidate.avatar.startsWith("http") ? (
                        <img
                          src={candidate.avatar}
                          alt={candidate.name}
                          className="w-full h-full object-cover"
                        />
                      ) : candidate.avatar ? (
                        <span className="text-5xl">{candidate.avatar}</span>
                      ) : (
                        candidate.name.charAt(0)
                      )}
                    </div>
                  ) : (
                    <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border-4 border-background shadow-lg flex items-center justify-center text-4xl font-bold text-primary flex-shrink-0">
                      {job?.company.charAt(0)}
                    </div>
                  )}

                  {/* Match Score */}
                  <div className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full border mb-2",
                    getScoreBg(matchScore)
                  )}>
                    <Star className={cn("w-5 h-5", getScoreColor(matchScore))} />
                    <span className={cn("text-lg font-bold", getScoreColor(matchScore))}>
                      {matchScore}% Match
                    </span>
                  </div>
                </div>

                {/* Name and title */}
                <div className="mt-4">
                  <h1 className="text-2xl font-bold text-foreground">
                    {candidate ? candidate.name : job?.title}
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    {candidate ? candidate.title : job?.company}
                  </p>
                </div>

                {/* Location + Remote */}
                <div className="flex items-center gap-3 mt-2 text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{data.location}</span>
                  </div>
                  {data.remote && (
                    <Badge variant="outline" className="text-xs">
                      <Wifi className="w-3 h-3 mr-1" />
                      Remote
                    </Badge>
                  )}
                </div>
              </div>

              {/* Content sections */}
              <div className="p-6 space-y-6">
                {/* Bio/Description */}
                <div>
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    About
                  </h2>
                  <p className="text-foreground leading-relaxed">
                    {candidate ? candidate.bio : job?.description}
                  </p>
                </div>

                {/* Skills/Requirements */}
                <div>
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    {type === "candidate" ? "Skills" : "Requirements"}
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {(candidate ? candidate.skills : job?.requirements || []).map((item, index) => (
                      <Badge key={index} variant="secondary" className="px-3 py-1">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Company Culture Section for Jobs */}
                {job?.culturePreferences && Object.keys(job.culturePreferences).length > 0 && (
                  <CompanyCultureSection
                    culturePreferences={job.culturePreferences}
                  />
                )}

                {/* Candidate-specific info */}
                {candidate && (
                  <>
                    {/* Professional links */}
                    {(candidate.linkedinUrl || candidate.websiteUrl || candidate.portfolioUrl) && (
                      <div>
                        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                          Links
                        </h2>
                        <div className="flex flex-wrap gap-3">
                          {candidate.linkedinUrl && (
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
                          {candidate.websiteUrl && (
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
                          {candidate.portfolioUrl && (
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

                    {/* Experience & Availability */}
                    <div>
                      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                        Details
                      </h2>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2 text-foreground">
                          <Briefcase className="w-4 h-4 text-muted-foreground" />
                          <span>{candidate.experience}</span>
                        </div>
                        <div className="flex items-center gap-2 text-foreground">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span>{candidate.availability}</span>
                        </div>
                      </div>
                    </div>

                    {/* Resume */}
                    {candidate.resumeUrl && (
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

                {/* Job-specific info */}
                {job && (
                  <>
                    {job.salary && (
                      <div>
                        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                          Compensation
                        </h2>
                        <p className="text-xl font-semibold text-foreground">
                          {job.salary}
                        </p>
                      </div>
                    )}

                    {job.benefits && job.benefits.length > 0 && (
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
                  </>
                )}

                {/* Spacer for fixed buttons */}
                <div className="h-24" />
              </div>
            </ScrollArea>

            {/* Fixed action bar */}
            <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-background via-background to-transparent pt-8">
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1 h-14 text-lg font-semibold border-red-500/30 text-red-500 hover:bg-red-500/10"
                  onClick={onPass}
                >
                  <X className="w-5 h-5 mr-2" />
                  Pass
                </Button>
                <Button
                  size="lg"
                  className="flex-1 h-14 text-lg font-semibold bg-green-500 hover:bg-green-600 text-white"
                  onClick={onLike}
                >
                  <Star className="w-5 h-5 mr-2" />
                  Like
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ExtendedProfileModal;
