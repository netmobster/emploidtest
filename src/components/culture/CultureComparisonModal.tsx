import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DualRadarChart } from "./DualRadarChart";
import { CulturePreferenceComparison } from "./CulturePreferenceComparison";
import { calculateCultureCompatibility, getCultureCompatibilityLabel, getCultureCompatibilityBg } from "@/lib/cultureUtils";
import { cn } from "@/lib/utils";
import { Heart, BarChart3 } from "lucide-react";

interface CultureComparisonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userPreferences: Record<string, string> | null | undefined;
  otherPreferences: Record<string, string> | null | undefined;
  userName?: string;
  otherName?: string;
}

export function CultureComparisonModal({
  open,
  onOpenChange,
  userPreferences,
  otherPreferences,
  userName = "You",
  otherName = "Company",
}: CultureComparisonModalProps) {
  const compatibility = calculateCultureCompatibility(userPreferences, otherPreferences);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary" />
            Culture Comparison
          </DialogTitle>
        </DialogHeader>

        {/* Compatibility Score Banner */}
        <div className={cn(
          "mx-6 p-4 rounded-lg text-center",
          getCultureCompatibilityBg(compatibility.score)
        )}>
          <div className="text-3xl font-bold">{compatibility.score}%</div>
          <div className="text-sm font-medium">
            {getCultureCompatibilityLabel(compatibility.score)}
          </div>
          <div className="flex justify-center gap-4 mt-2 text-xs text-muted-foreground">
            <span>{compatibility.matchingAreas.length} matching areas</span>
            <span>•</span>
            <span>{compatibility.differingAreas.length} different approaches</span>
          </div>
        </div>

        <Tabs defaultValue="radar" className="flex-1">
          <TabsList className="mx-6">
            <TabsTrigger value="radar" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="details" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Details
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[50vh] px-6 pb-6">
            <TabsContent value="radar" className="mt-4">
              <DualRadarChart
                userPreferences={userPreferences}
                otherPreferences={otherPreferences}
                userLabel={userName}
                otherLabel={otherName}
              />
              
              {/* Quick summary */}
              <div className="mt-6 space-y-3">
                {compatibility.matchingAreas.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-emerald-600 mb-2">
                      ✓ Strong alignment in:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {compatibility.matchingAreas.slice(0, 5).map((area) => (
                        <span
                          key={area}
                          className="px-2 py-1 bg-emerald-500/10 text-emerald-700 text-xs rounded-md"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {compatibility.differingAreas.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-amber-600 mb-2">
                      ⚡ Different approaches in:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {compatibility.differingAreas.slice(0, 5).map((area) => (
                        <span
                          key={area}
                          className="px-2 py-1 bg-amber-500/10 text-amber-700 text-xs rounded-md"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="details" className="mt-4">
              <CulturePreferenceComparison
                userPreferences={userPreferences}
                otherPreferences={otherPreferences}
                userLabel={userName}
                otherLabel={otherName}
              />
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
