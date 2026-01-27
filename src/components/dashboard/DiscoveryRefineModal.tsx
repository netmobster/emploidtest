import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Settings2, X, MapPin, Briefcase, Wrench } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export interface DiscoveryFilters {
  threshold: number;
  mustMatchMission: boolean;
  location: string;
  workModes: string[];
  skills: string[];
}

interface DiscoveryRefineModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: DiscoveryFilters;
  onApply: (filters: DiscoveryFilters) => void;
  userType: "candidate" | "employer";
}

const WORK_MODE_OPTIONS = [
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
  { value: "onsite", label: "On-site" },
];

export function DiscoveryRefineModal({
  open,
  onOpenChange,
  filters,
  onApply,
  userType,
}: DiscoveryRefineModalProps) {
  const [localFilters, setLocalFilters] = useState<DiscoveryFilters>(filters);
  const [skillInput, setSkillInput] = useState("");

  useEffect(() => {
    if (open) {
      setLocalFilters(filters);
    }
  }, [open, filters]);

  const handleApply = () => {
    onApply(localFilters);
    onOpenChange(false);
  };

  const handleReset = () => {
    const defaultFilters: DiscoveryFilters = {
      threshold: 70,
      mustMatchMission: false,
      location: "",
      workModes: [],
      skills: [],
    };
    setLocalFilters(defaultFilters);
  };

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !localFilters.skills.includes(trimmed)) {
      setLocalFilters(prev => ({
        ...prev,
        skills: [...prev.skills, trimmed],
      }));
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setLocalFilters(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill),
    }));
  };

  const handleSkillKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-primary" />
            Refine Your Scout
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Synergy Threshold */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="threshold">Synergy Threshold</Label>
              <span className="text-sm font-semibold text-primary">{localFilters.threshold}%</span>
            </div>
            <Slider
              id="threshold"
              min={50}
              max={100}
              step={5}
              value={[localFilters.threshold]}
              onValueChange={(value) => setLocalFilters(prev => ({ ...prev, threshold: value[0] }))}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Only show matches with synergy score at or above this level.
            </p>
          </div>

          {/* Must Match Mission */}
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <Label htmlFor="mustMatch">Must match my core mission</Label>
              <p className="text-xs text-muted-foreground">
                Prioritize matches that align with your stated mission.
              </p>
            </div>
            <Switch
              id="mustMatch"
              checked={localFilters.mustMatchMission}
              onCheckedChange={(checked) => setLocalFilters(prev => ({ ...prev, mustMatchMission: checked }))}
            />
          </div>

          {/* Location Filter */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <Label htmlFor="location">Location</Label>
            </div>
            <Input
              id="location"
              placeholder={userType === "candidate" ? "e.g., New York, London..." : "e.g., San Francisco, Remote..."}
              value={localFilters.location}
              onChange={(e) => setLocalFilters(prev => ({ ...prev, location: e.target.value }))}
            />
            <p className="text-xs text-muted-foreground">
              Filter by city or region name (partial match).
            </p>
          </div>

          {/* Work Mode Filter */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-muted-foreground" />
              <Label>Work Mode</Label>
            </div>
            <ToggleGroup
              type="multiple"
              value={localFilters.workModes}
              onValueChange={(value) => setLocalFilters(prev => ({ ...prev, workModes: value }))}
              className="justify-start flex-wrap"
            >
              {WORK_MODE_OPTIONS.map((option) => (
                <ToggleGroupItem
                  key={option.value}
                  value={option.value}
                  aria-label={option.label}
                  className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                >
                  {option.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <p className="text-xs text-muted-foreground">
              Select one or more work arrangements.
            </p>
          </div>

          {/* Skills Filter */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-muted-foreground" />
              <Label htmlFor="skills">
                {userType === "candidate" ? "Required Skills" : "Candidate Skills"}
              </Label>
            </div>
            <div className="flex gap-2">
              <Input
                id="skills"
                placeholder="Type a skill and press Enter..."
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleSkillKeyDown}
              />
              <Button type="button" variant="secondary" size="sm" onClick={addSkill}>
                Add
              </Button>
            </div>
            {localFilters.skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {localFilters.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="gap-1 pr-1">
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="ml-1 hover:bg-muted rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              {userType === "candidate"
                ? "Only show roles requiring these skills."
                : "Only show candidates with these skills."}
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={handleReset} className="mr-auto">
            Reset
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleApply}>
            Apply Filters
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
