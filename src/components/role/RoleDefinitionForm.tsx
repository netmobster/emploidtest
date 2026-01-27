import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Sparkles, Plus, X, Check, ChevronDown, ChevronUp, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useRoleDefinition, RoleDefinition } from "@/hooks/useRoleDefinition";
import { LocationWorkModeFields } from "@/components/role/LocationWorkModeFields";
import { RolePreviewDialog } from "@/components/role/RolePreviewDialog";
import { cn } from "@/lib/utils";

interface RoleDefinitionFormProps {
  jobId: string;
  onComplete?: () => void;
  onCancel?: () => void;
}

const SUGGESTED_TOOLS = [
  "HubSpot", "Salesforce", "GA4", "Figma", "Slack", "Notion", 
  "Jira", "Asana", "Linear", "GitHub", "VS Code", "Tableau",
  "Looker", "Mixpanel", "Amplitude", "Intercom", "Zendesk"
];

interface FormSection {
  id: string;
  title: string;
  isComplete: boolean;
}

export function RoleDefinitionForm({ jobId, onComplete, onCancel }: RoleDefinitionFormProps) {
  const { isLoading, isSaving, fetchRole, publishRole, generateMissionStatement } = useRoleDefinition(jobId);
  
  const [role, setRole] = useState<RoleDefinition | null>(null);
  const [expandedSection, setExpandedSection] = useState<string>("logistics");
  const [isGeneratingMission, setIsGeneratingMission] = useState(false);
  const [newTool, setNewTool] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    pay_min: "",
    pay_max: "",
    work_mode: "remote" as "onsite" | "hybrid" | "remote",
    city_hub: "",
    geographic_restriction: "none" as "none" | "us_canada" | "north_america" | "emea",
    location_text: "",
    reporting_to: "",
    mission_statement: "",
    big_rocks: ["", "", ""],
    daily_stack: [] as string[],
    vibe_mode: "async-autonomous" as "async-autonomous" | "high-collaboration",
  });

  useEffect(() => {
    const loadRole = async () => {
      const data = await fetchRole();
      if (data) {
        setRole(data);
        // Map work_mode from DB format
        const workModeMap: Record<string, "onsite" | "hybrid" | "remote"> = {
          "on-site": "onsite",
          "onsite": "onsite",
          "hybrid": "hybrid",
          "remote": "remote",
        };
        setFormData({
          pay_min: data.pay_min?.toString() || "",
          pay_max: data.pay_max?.toString() || "",
          work_mode: workModeMap[data.work_mode] || "remote",
          city_hub: data.location_text || "",
          geographic_restriction: (data as any).geographic_restriction || "none",
          location_text: data.location_text || "",
          reporting_to: data.reporting_to || "",
          mission_statement: data.mission_statement || "",
          big_rocks: [
            data.big_rocks?.[0] || "",
            data.big_rocks?.[1] || "",
            data.big_rocks?.[2] || "",
          ],
          daily_stack: data.daily_stack || [],
          vibe_mode: data.vibe_mode,
        });
      }
    };
    loadRole();
  }, [fetchRole]);

  const handleGenerateMission = async () => {
    if (!role) return;
    setIsGeneratingMission(true);
    const mission = await generateMissionStatement(role.title, formData.daily_stack);
    if (mission) {
      setFormData(prev => ({ ...prev, mission_statement: mission }));
    }
    setIsGeneratingMission(false);
  };

  const addTool = (tool: string) => {
    if (tool && !formData.daily_stack.includes(tool)) {
      setFormData(prev => ({ 
        ...prev, 
        daily_stack: [...prev.daily_stack, tool] 
      }));
    }
    setNewTool("");
  };

  const removeTool = (tool: string) => {
    setFormData(prev => ({
      ...prev,
      daily_stack: prev.daily_stack.filter(t => t !== tool)
    }));
  };

  const handlePublish = async () => {
    // Map work_mode back to DB format
    const workModeMap: Record<string, "remote" | "hybrid" | "on-site"> = {
      onsite: "on-site",
      hybrid: "hybrid",
      remote: "remote",
    };
    const success = await publishRole({
      pay_min: formData.pay_min ? parseInt(formData.pay_min) : null,
      pay_max: formData.pay_max ? parseInt(formData.pay_max) : null,
      work_mode: workModeMap[formData.work_mode],
      location_text: formData.city_hub || null,
      reporting_to: formData.reporting_to || null,
      mission_statement: formData.mission_statement || null,
      big_rocks: formData.big_rocks.filter(Boolean),
      daily_stack: formData.daily_stack,
      vibe_mode: formData.vibe_mode,
      geographic_restriction: formData.geographic_restriction,
    } as any);
    
    if (success) {
      onComplete?.();
    }
  };

  const sections: FormSection[] = [
    { 
      id: "logistics", 
      title: "The Logistics", 
      isComplete: Boolean(formData.pay_min && formData.pay_max && 
        (formData.work_mode === "remote" || formData.city_hub))
    },
    { 
      id: "mission", 
      title: "The Mission", 
      isComplete: Boolean(formData.mission_statement) 
    },
    { 
      id: "big-rocks", 
      title: "The Three Big Rocks", 
      isComplete: formData.big_rocks.filter(Boolean).length >= 1 
    },
    { 
      id: "daily-stack", 
      title: "The Daily Stack", 
      isComplete: formData.daily_stack.length > 0 
    },
    { 
      id: "vibe", 
      title: "The Vibe", 
      isComplete: true // Always has a default
    },
  ];

  const completedCount = sections.filter(s => s.isComplete).length;
  const isFormComplete = completedCount === sections.length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">{role?.title || "Role Details"}</h2>
          <Badge variant={isFormComplete ? "default" : "secondary"}>
            {completedCount}/{sections.length} Complete
          </Badge>
        </div>
        <div className="flex gap-1">
          {sections.map((section) => (
            <div 
              key={section.id}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors",
                section.isComplete ? "bg-primary" : "bg-muted"
              )}
            />
          ))}
        </div>
      </div>

      {/* Accordion Sections */}
      <div className="space-y-3">
        {/* Section 1: Logistics */}
        <SectionAccordion
          section={sections[0]}
          isExpanded={expandedSection === "logistics"}
          onToggle={() => setExpandedSection(expandedSection === "logistics" ? "" : "logistics")}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Minimum Pay</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  type="number"
                  placeholder="80,000"
                  className="pl-7"
                  value={formData.pay_min}
                  onChange={(e) => setFormData(prev => ({ ...prev, pay_min: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Maximum Pay</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  type="number"
                  placeholder="120,000"
                  className="pl-7"
                  value={formData.pay_max}
                  onChange={(e) => setFormData(prev => ({ ...prev, pay_max: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <LocationWorkModeFields
            workMode={formData.work_mode}
            cityHub={formData.city_hub}
            geographicRestriction={formData.geographic_restriction}
            onWorkModeChange={(v) => setFormData(prev => ({ ...prev, work_mode: v }))}
            onCityHubChange={(v) => setFormData(prev => ({ ...prev, city_hub: v }))}
            onGeographicRestrictionChange={(v) => setFormData(prev => ({ ...prev, geographic_restriction: v }))}
            errors={{
              cityHub: (formData.work_mode === "onsite" || formData.work_mode === "hybrid") && !formData.city_hub 
                ? "City hub is required for on-site/hybrid roles" 
                : undefined
            }}
          />

          <div className="space-y-2">
            <Label>Reports To</Label>
            <Input
              placeholder="e.g., VP of Engineering"
              value={formData.reporting_to}
              onChange={(e) => setFormData(prev => ({ ...prev, reporting_to: e.target.value }))}
            />
          </div>
        </SectionAccordion>

        {/* Section 2: Mission */}
        <SectionAccordion
          section={sections[1]}
          isExpanded={expandedSection === "mission"}
          onToggle={() => setExpandedSection(expandedSection === "mission" ? "" : "mission")}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Mission Statement</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleGenerateMission}
                disabled={isGeneratingMission}
                className="text-primary"
              >
                {isGeneratingMission ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-1" />
                )}
                Auto-Draft
              </Button>
            </div>
            <Textarea
              placeholder="In 1-2 sentences, describe the specific goal of this role and its impact..."
              rows={3}
              value={formData.mission_statement}
              onChange={(e) => setFormData(prev => ({ ...prev, mission_statement: e.target.value }))}
            />
            <p className="text-xs text-muted-foreground">
              Focus on impact and outcomes, not just responsibilities.
            </p>
          </div>
        </SectionAccordion>

        {/* Section 3: Big Rocks */}
        <SectionAccordion
          section={sections[2]}
          isExpanded={expandedSection === "big-rocks"}
          onToggle={() => setExpandedSection(expandedSection === "big-rocks" ? "" : "big-rocks")}
        >
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              What are the three most important outcomes in the first 90 days?
            </p>
            {[0, 1, 2].map((index) => (
              <div key={index} className="flex items-center gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  {index + 1}
                </span>
                <Input
                  placeholder={
                    index === 0 
                      ? "e.g., Launch new onboarding flow" 
                      : index === 1 
                        ? "e.g., Reduce churn by 15%" 
                        : "e.g., Build analytics dashboard"
                  }
                  value={formData.big_rocks[index]}
                  onChange={(e) => {
                    const newRocks = [...formData.big_rocks];
                    newRocks[index] = e.target.value;
                    setFormData(prev => ({ ...prev, big_rocks: newRocks }));
                  }}
                />
              </div>
            ))}
          </div>
        </SectionAccordion>

        {/* Section 4: Daily Stack */}
        <SectionAccordion
          section={sections[3]}
          isExpanded={expandedSection === "daily-stack"}
          onToggle={() => setExpandedSection(expandedSection === "daily-stack" ? "" : "daily-stack")}
        >
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {formData.daily_stack.map((tool) => (
                <Badge key={tool} variant="secondary" className="gap-1 pr-1">
                  {tool}
                  <button
                    type="button"
                    onClick={() => removeTool(tool)}
                    className="ml-1 rounded-full p-0.5 hover:bg-muted"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
            
            <div className="flex gap-2">
              <Input
                placeholder="Add a tool..."
                value={newTool}
                onChange={(e) => setNewTool(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTool(newTool);
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => addTool(newTool)}
                disabled={!newTool}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {SUGGESTED_TOOLS.filter(t => !formData.daily_stack.includes(t)).slice(0, 8).map((tool) => (
                <button
                  key={tool}
                  type="button"
                  onClick={() => addTool(tool)}
                  className="text-xs px-2 py-1 rounded-md bg-muted hover:bg-muted/80 transition-colors"
                >
                  + {tool}
                </button>
              ))}
            </div>
          </div>
        </SectionAccordion>

        {/* Section 5: Vibe */}
        <SectionAccordion
          section={sections[4]}
          isExpanded={expandedSection === "vibe"}
          onToggle={() => setExpandedSection(expandedSection === "vibe" ? "" : "vibe")}
        >
          <RadioGroup
            value={formData.vibe_mode}
            onValueChange={(v) => setFormData(prev => ({ ...prev, vibe_mode: v as typeof formData.vibe_mode }))}
            className="grid gap-3 sm:grid-cols-2"
          >
            <Label
              className={cn(
                "flex flex-col gap-2 p-4 rounded-xl border cursor-pointer transition-all",
                formData.vibe_mode === "async-autonomous"
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border hover:border-primary/50"
              )}
            >
              <RadioGroupItem value="async-autonomous" className="sr-only" />
              <span className="font-medium">Asynchronous & Autonomous</span>
              <span className="text-sm text-muted-foreground">
                Independent work, async communication, self-directed scheduling
              </span>
            </Label>
            <Label
              className={cn(
                "flex flex-col gap-2 p-4 rounded-xl border cursor-pointer transition-all",
                formData.vibe_mode === "high-collaboration"
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border hover:border-primary/50"
              )}
            >
              <RadioGroupItem value="high-collaboration" className="sr-only" />
              <span className="font-medium">High-Collaboration & Sync</span>
              <span className="text-sm text-muted-foreground">
                Regular meetings, real-time coordination, team-based workflow
              </span>
            </Label>
          </RadioGroup>
        </SectionAccordion>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button 
          type="button"
          variant="ghost"
          onClick={() => setShowPreview(true)}
          className="gap-2"
        >
          <Eye className="w-4 h-4" />
          Preview as Candidate
        </Button>
        <Button 
          className="flex-1" 
          onClick={handlePublish}
          disabled={isSaving || !isFormComplete}
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Publishing...
            </>
          ) : (
            <>
              <Check className="w-4 h-4 mr-2" />
              Publish Role
            </>
          )}
        </Button>
      </div>

      {/* Preview Dialog */}
      <RolePreviewDialog
        open={showPreview}
        onOpenChange={setShowPreview}
        roleData={{
          title: role?.title || "Role Title",
          company: role?.company || "Company",
          pay_min: formData.pay_min ? parseInt(formData.pay_min) : null,
          pay_max: formData.pay_max ? parseInt(formData.pay_max) : null,
          work_mode: formData.work_mode,
          city_hub: formData.city_hub,
          mission_statement: formData.mission_statement,
          big_rocks: formData.big_rocks.filter(Boolean),
          daily_stack: formData.daily_stack,
          vibe_mode: formData.vibe_mode,
        }}
      />
    </div>
  );
}

// Accordion component
function SectionAccordion({ 
  section, 
  isExpanded, 
  onToggle, 
  children 
}: { 
  section: FormSection; 
  isExpanded: boolean; 
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-5 h-5 rounded-full flex items-center justify-center text-xs",
            section.isComplete 
              ? "bg-primary text-primary-foreground" 
              : "bg-muted text-muted-foreground"
          )}>
            {section.isComplete ? <Check className="w-3 h-3" /> : null}
          </div>
          <span className="font-medium">{section.title}</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        )}
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-4 pb-4 space-y-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
