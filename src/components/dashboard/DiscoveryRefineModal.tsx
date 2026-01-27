import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Settings2, X, MapPin, Briefcase, Wrench } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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
  suggestedSkills?: string[];
}

const WORK_MODE_OPTIONS = [
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
  { value: "onsite", label: "On-site" },
];

export const DEFAULT_FILTERS: DiscoveryFilters = {
  threshold: 70,
  mustMatchMission: false,
  location: "",
  workModes: [],
  skills: [],
};

export function DiscoveryRefineModal({
  open,
  onOpenChange,
  filters,
  onApply,
  userType,
  suggestedSkills = [],
}: DiscoveryRefineModalProps) {
  const [localFilters, setLocalFilters] = useState<DiscoveryFilters>(filters);
  const [skillInput, setSkillInput] = useState("");
  const [skillsPopoverOpen, setSkillsPopoverOpen] = useState(false);

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
    setLocalFilters(DEFAULT_FILTERS);
  };

  const addSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !localFilters.skills.includes(trimmed)) {
      setLocalFilters(prev => ({
        ...prev,
        skills: [...prev.skills, trimmed],
      }));
      setSkillInput("");
      setSkillsPopoverOpen(false);
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
      addSkill(skillInput);
    }
  };

  // Filter suggestions based on input and exclude already selected
  const filteredSuggestions = useMemo(() => {
    const query = skillInput.toLowerCase();
    return suggestedSkills
      .filter(skill => 
        !localFilters.skills.includes(skill) &&
        skill.toLowerCase().includes(query)
      )
      .slice(0, 8);
  }, [suggestedSkills, skillInput, localFilters.skills]);

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

          {/* Skills Filter with Autocomplete */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-muted-foreground" />
              <Label htmlFor="skills">
                {userType === "candidate" ? "Required Skills" : "Candidate Skills"}
              </Label>
            </div>
            
            <Popover open={skillsPopoverOpen} onOpenChange={setSkillsPopoverOpen}>
              <PopoverTrigger asChild>
                <div className="flex gap-2">
                  <Input
                    id="skills"
                    placeholder="Type a skill..."
                    value={skillInput}
                    onChange={(e) => {
                      setSkillInput(e.target.value);
                      if (e.target.value && !skillsPopoverOpen) {
                        setSkillsPopoverOpen(true);
                      }
                    }}
                    onKeyDown={handleSkillKeyDown}
                    onFocus={() => {
                      if (suggestedSkills.length > 0) {
                        setSkillsPopoverOpen(true);
                      }
                    }}
                  />
                  <Button 
                    type="button" 
                    variant="secondary" 
                    size="sm" 
                    onClick={() => addSkill(skillInput)}
                  >
                    Add
                  </Button>
                </div>
              </PopoverTrigger>
              {suggestedSkills.length > 0 && (
                <PopoverContent className="w-[280px] p-0" align="start" onOpenAutoFocus={(e) => e.preventDefault()}>
                  <Command>
                    <CommandList>
                      {filteredSuggestions.length === 0 ? (
                        <CommandEmpty>
                          {skillInput ? "No matching skills. Press Enter to add." : "Type to search skills..."}
                        </CommandEmpty>
                      ) : (
                        <CommandGroup heading="Popular Skills">
                          {filteredSuggestions.map((skill) => (
                            <CommandItem
                              key={skill}
                              value={skill}
                              onSelect={() => addSkill(skill)}
                              className="cursor-pointer"
                            >
                              {skill}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              )}
            </Popover>

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
