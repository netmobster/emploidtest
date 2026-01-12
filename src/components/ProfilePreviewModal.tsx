import { Eye, MapPin, Briefcase, Clock, Globe, Linkedin, ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { getPrimaryBadge } from "@/lib/badgeUtils";

interface ProfilePreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfilePreviewModal({ open, onOpenChange }: ProfilePreviewModalProps) {
  const { profile } = useAuth();

  if (!profile) return null;

  const isEmployer = profile.user_type === "employer";
  const primaryBadge = profile.synergy_scores 
    ? getPrimaryBadge(profile.synergy_scores as Record<string, number>)
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-primary" />
            Profile Preview
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <p className="text-sm text-muted-foreground mb-6">
            This is how your profile appears to {isEmployer ? "candidates" : "employers"}.
          </p>

          {/* Profile Card Preview */}
          <div className="border border-border rounded-xl overflow-hidden bg-card">
            {/* Cover Image */}
            {profile.cover_image_url && (
              <div 
                className="h-32 bg-cover bg-center"
                style={{ backgroundImage: `url(${profile.cover_image_url})` }}
              />
            )}
            {!profile.cover_image_url && (
              <div className="h-32 bg-gradient-to-r from-primary/20 to-accent/20" />
            )}

            {/* Profile Content */}
            <div className="p-6">
              <div className="flex items-start gap-4 -mt-16">
                <Avatar className="w-24 h-24 border-4 border-card shadow-lg">
                  <AvatarImage src={profile.avatar_url || undefined} />
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                    {isEmployer
                      ? profile.company_name?.charAt(0) || "C"
                      : profile.full_name?.slice(0, 2).toUpperCase() || "??"}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 pt-12">
                  <h2 className="text-xl font-bold text-foreground">
                    {isEmployer ? profile.company_name : profile.full_name}
                  </h2>
                  {!isEmployer && profile.job_title && (
                    <p className="text-muted-foreground">{profile.job_title}</p>
                  )}
                  {isEmployer && profile.full_name && (
                    <p className="text-muted-foreground">{profile.full_name}</p>
                  )}
                </div>
              </div>

              {/* Badges Row */}
              <div className="flex flex-wrap gap-2 mt-4">
                {(isEmployer ? profile.company_location : profile.location) && (
                  <Badge variant="secondary" className="gap-1">
                    <MapPin className="w-3 h-3" />
                    {isEmployer ? profile.company_location : profile.location}
                  </Badge>
                )}
                {!isEmployer && profile.years_of_experience && (
                  <Badge variant="secondary" className="gap-1">
                    <Briefcase className="w-3 h-3" />
                    {profile.years_of_experience} years
                  </Badge>
                )}
                {!isEmployer && profile.availability && (
                  <Badge variant="secondary" className="gap-1">
                    <Clock className="w-3 h-3" />
                    {profile.availability}
                  </Badge>
                )}
                {!isEmployer && profile.remote_preference && (
                  <Badge variant="outline">{profile.remote_preference}</Badge>
                )}
                {isEmployer && profile.company_size && (
                  <Badge variant="secondary">{profile.company_size}</Badge>
                )}
                {isEmployer && profile.company_industry && (
                  <Badge variant="outline">{profile.company_industry}</Badge>
                )}
              </div>

              {/* Primary Badge */}
              {primaryBadge && (
                <div className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <div className="flex items-center gap-2">
                    <div>
                      <p className="font-medium text-foreground">{primaryBadge.name}</p>
                      <p className="text-xs text-muted-foreground">{primaryBadge.vibe}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Bio */}
              {profile.bio && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-foreground mb-2">About</h3>
                  <p className="text-muted-foreground text-sm">{profile.bio}</p>
                </div>
              )}

              {/* Skills */}
              {!isEmployer && profile.skills && profile.skills.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-foreground mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.skills.map((skill, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Links */}
              <div className="flex flex-wrap gap-2 mt-4">
                {profile.linkedin_url && (
                  <Badge variant="outline" className="gap-1.5 cursor-pointer hover:bg-muted">
                    <Linkedin className="w-3 h-3" />
                    LinkedIn
                  </Badge>
                )}
                {(profile.website_url || (isEmployer && profile.company_website)) && (
                  <Badge variant="outline" className="gap-1.5 cursor-pointer hover:bg-muted">
                    <Globe className="w-3 h-3" />
                    Website
                  </Badge>
                )}
                {profile.portfolio_url && (
                  <Badge variant="outline" className="gap-1.5 cursor-pointer hover:bg-muted">
                    <ExternalLink className="w-3 h-3" />
                    Portfolio
                  </Badge>
                )}
              </div>

              {/* Synergy Scores Summary */}
              {profile.synergy_scores && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-foreground mb-2">Work Style</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(profile.synergy_scores as Record<string, number>).map(([key, value]) => (
                      <Badge key={key} variant="secondary" className="text-xs capitalize">
                        {key}: {value}/10
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Missing Items Warning */}
          <div className="mt-6 space-y-2">
            <h4 className="text-sm font-semibold text-foreground">Profile Completeness Tips:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              {!profile.avatar_url && (
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
                  Add a {isEmployer ? "company logo" : "profile photo"}
                </li>
              )}
              {!profile.bio && (
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
                  Write a compelling bio
                </li>
              )}
              {!profile.synergy_scores && (
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
                  Complete the Synergy Score quiz
                </li>
              )}
              {!isEmployer && (!profile.skills || profile.skills.length === 0) && (
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
                  Add your skills
                </li>
              )}
              {!isEmployer && !profile.linkedin_url && (
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                  Consider adding your LinkedIn profile
                </li>
              )}
            </ul>
          </div>

          <div className="flex justify-end mt-6">
            <Button onClick={() => onOpenChange(false)}>
              Close Preview
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
