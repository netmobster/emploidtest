import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MapPin, Globe, Building2, Clock } from "lucide-react";

type WorkMode = "onsite" | "hybrid" | "remote";
type GeographicRestriction = "none" | "us_canada" | "north_america" | "emea";

interface LocationWorkModeFieldsProps {
  workMode: WorkMode;
  cityHub: string;
  geographicRestriction: GeographicRestriction;
  onWorkModeChange: (value: WorkMode) => void;
  onCityHubChange: (value: string) => void;
  onGeographicRestrictionChange: (value: GeographicRestriction) => void;
  errors?: {
    cityHub?: string;
  };
}

const workModeOptions: { value: WorkMode; label: string; icon: React.ElementType; description: string }[] = [
  { value: "onsite", label: "On-site", icon: Building2, description: "Work from the office" },
  { value: "hybrid", label: "Hybrid", icon: Clock, description: "Mix of office and remote" },
  { value: "remote", label: "Remote", icon: Globe, description: "Work from anywhere" },
];

const geoRestrictionOptions: { value: GeographicRestriction; label: string; badge: string }[] = [
  { value: "none", label: "Remote Anywhere", badge: "🌐 Global" },
  { value: "us_canada", label: "US & Canada Only", badge: "🇺🇸🇨🇦" },
  { value: "north_america", label: "North America Only", badge: "🌎 N. America" },
  { value: "emea", label: "EMEA Only", badge: "🌍 EMEA" },
];

export function LocationWorkModeFields({
  workMode,
  cityHub,
  geographicRestriction,
  onWorkModeChange,
  onCityHubChange,
  onGeographicRestrictionChange,
  errors,
}: LocationWorkModeFieldsProps) {
  const requiresCityHub = workMode === "onsite" || workMode === "hybrid";
  const showGeoRestriction = workMode === "remote";

  return (
    <div className="space-y-4">
      {/* Work Mode Selection */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Work Mode</Label>
        <div className="grid grid-cols-3 gap-2">
          {workModeOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = workMode === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onWorkModeChange(option.value)}
                className={`
                  p-3 rounded-lg border-2 transition-all text-center
                  ${isSelected 
                    ? "border-primary bg-primary/5" 
                    : "border-border hover:border-primary/50"
                  }
                `}
              >
                <Icon className={`w-5 h-5 mx-auto mb-1 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                <p className={`text-sm font-medium ${isSelected ? "text-primary" : "text-foreground"}`}>
                  {option.label}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{option.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* City Hub (required for onsite/hybrid) */}
      {requiresCityHub && (
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            City Hub <span className="text-destructive">*</span>
          </Label>
          <Input
            placeholder="e.g., Toronto, ON or New York, NY"
            value={cityHub}
            onChange={(e) => onCityHubChange(e.target.value)}
            className={errors?.cityHub ? "border-destructive" : ""}
          />
          {errors?.cityHub && (
            <p className="text-xs text-destructive">{errors.cityHub}</p>
          )}
          <p className="text-xs text-muted-foreground">
            This is where the role is based. Candidates will need to match this location.
          </p>
        </div>
      )}

      {/* Geographic Restriction (for remote) */}
      {showGeoRestriction && (
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Geographic Restriction
          </Label>
          <Select
            value={geographicRestriction}
            onValueChange={(v) => onGeographicRestrictionChange(v as GeographicRestriction)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select restriction" />
            </SelectTrigger>
            <SelectContent>
              {geoRestrictionOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    <span>{option.label}</span>
                    <Badge variant="secondary" className="text-xs">
                      {option.badge}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Candidates outside this region won't see this role.
          </p>
        </div>
      )}

      {/* City Hub for timezone (optional for remote) */}
      {showGeoRestriction && (
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Primary Timezone Hub <span className="text-muted-foreground text-xs">(optional)</span>
          </Label>
          <Input
            placeholder="e.g., Toronto, ON (for timezone matching)"
            value={cityHub}
            onChange={(e) => onCityHubChange(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Candidates within ±3 hours will get a "Timezone Synergy" badge.
          </p>
        </div>
      )}

      {/* Preview Badge */}
      <div className="pt-2">
        <Label className="text-xs text-muted-foreground mb-2 block">Preview:</Label>
        <LocationBadge 
          workMode={workMode} 
          cityHub={cityHub} 
          geographicRestriction={geographicRestriction}
        />
      </div>
    </div>
  );
}

// Reusable location badge component
export function LocationBadge({
  workMode,
  cityHub,
  geographicRestriction,
}: {
  workMode: WorkMode;
  cityHub?: string;
  geographicRestriction?: GeographicRestriction;
}) {
  if (workMode === "onsite" || workMode === "hybrid") {
    const modeLabel = workMode === "onsite" ? "On-site" : "Hybrid";
    return (
      <Badge variant="secondary" className="gap-1">
        <MapPin className="w-3 h-3" />
        {modeLabel}: {cityHub || "Location TBD"}
      </Badge>
    );
  }

  // Remote
  const geoLabels: Record<GeographicRestriction, string> = {
    none: "Global",
    us_canada: "US/Canada",
    north_america: "North America",
    emea: "EMEA",
  };

  return (
    <Badge variant="secondary" className="gap-1">
      <Globe className="w-3 h-3" />
      Remote: {geoLabels[geographicRestriction || "none"]}
    </Badge>
  );
}

// Timezone synergy badge
export function TimezoneSynergyBadge() {
  return (
    <Badge variant="outline" className="gap-1 border-emerald-500/50 text-emerald-600 bg-emerald-500/10">
      <Clock className="w-3 h-3" />
      Timezone Synergy
    </Badge>
  );
}
