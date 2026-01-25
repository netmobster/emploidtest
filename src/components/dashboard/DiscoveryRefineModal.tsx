import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Settings2 } from "lucide-react";

interface DiscoveryRefineModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  threshold: number;
  mustMatchMission: boolean;
  onApply: (threshold: number, mustMatchMission: boolean) => void;
}

export function DiscoveryRefineModal({
  open,
  onOpenChange,
  threshold,
  mustMatchMission,
  onApply,
}: DiscoveryRefineModalProps) {
  const [localThreshold, setLocalThreshold] = useState(threshold);
  const [localMustMatch, setLocalMustMatch] = useState(mustMatchMission);

  const handleApply = () => {
    onApply(localThreshold, localMustMatch);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
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
              <span className="text-sm font-semibold text-primary">{localThreshold}%</span>
            </div>
            <Slider
              id="threshold"
              min={50}
              max={100}
              step={5}
              value={[localThreshold]}
              onValueChange={(value) => setLocalThreshold(value[0])}
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
              checked={localMustMatch}
              onCheckedChange={setLocalMustMatch}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
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