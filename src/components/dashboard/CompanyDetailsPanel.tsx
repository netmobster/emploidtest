import { Building2, Globe, Users, MapPin, Briefcase, Pencil, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { useState } from "react";
import { EditCompanyDialog } from "./EditCompanyDialog";

interface Profile {
  company_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  company_website: string | null;
  company_size: string | null;
  company_industry: string | null;
  company_location: string | null;
}

interface CompanyDetailsPanelProps {
  profile: Profile;
  onEditSuccess: () => void;
  onPreview?: () => void;
}

export function CompanyDetailsPanel({ profile, onEditSuccess, onPreview }: CompanyDetailsPanelProps) {
  const [editOpen, setEditOpen] = useState(false);

  const hasDetails = profile.company_name || profile.bio || profile.company_website || 
                     profile.company_size || profile.company_industry || profile.company_location;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="h-5 w-5 text-primary" />
              Company Details
            </CardTitle>
            <div className="flex items-center gap-2">
              {onPreview && (
                <Button variant="ghost" size="sm" onClick={onPreview}>
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {hasDetails ? (
              <div className="space-y-6">
                {/* Company Header */}
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={profile.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xl">
                      {profile.company_name?.charAt(0) || "C"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-foreground">
                      {profile.company_name || "Company Name"}
                    </h3>
                    {profile.bio && (
                      <p className="text-muted-foreground mt-1 text-sm">{profile.bio}</p>
                    )}
                  </div>
                </div>

                {/* Company Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {profile.company_website && (
                    <div className="flex items-center gap-2 text-sm">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <a 
                        href={profile.company_website.startsWith('http') ? profile.company_website : `https://${profile.company_website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline truncate"
                      >
                        {profile.company_website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  )}
                  {profile.company_size && (
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground">{profile.company_size}</span>
                    </div>
                  )}
                  {profile.company_industry && (
                    <div className="flex items-center gap-2 text-sm">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground">{profile.company_industry}</span>
                    </div>
                  )}
                  {profile.company_location && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground">{profile.company_location}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">
                  Complete your company profile to attract better candidates
                </p>
                <Button onClick={() => setEditOpen(true)}>
                  Add Company Details
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <EditCompanyDialog 
        open={editOpen} 
        onOpenChange={setEditOpen} 
        profile={profile}
        onSuccess={() => {
          setEditOpen(false);
          onEditSuccess();
        }}
      />
    </>
  );
}
