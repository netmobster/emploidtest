import { useMemo } from "react";
import type { Step } from "react-joyride";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface TourDebugPanelProps {
  title: string;
  status: {
    hasSeenPhilosophy: boolean;
    hasCompletedWalkthrough: boolean;
    hasCompletedDashboardTour: boolean;
  };
  isLoading: boolean;
  restartNonce: number;
  run: boolean;
  stepIndex: number;
  steps: Step[];
}

function isEnabled() {
  if (!import.meta.env.DEV) return false;
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get("tourDebug") === "1";
  } catch {
    return false;
  }
}

export function TourDebugPanel(props: TourDebugPanelProps) {
  const enabled = isEnabled();
  const analysis = useMemo(() => {
    const valid: string[] = [];
    const missing: string[] = [];

    props.steps.forEach((s) => {
      const target = String(s.target);
      const el = document.querySelector(target) as HTMLElement | null;
      if (el && el.offsetParent !== null) valid.push(target);
      else missing.push(target);
    });

    return { valid, missing };
  }, [props.steps]);

  if (!enabled) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[10001] w-[320px] max-w-[calc(100vw-2rem)]">
      <Card className="border border-border bg-card/95 backdrop-blur-sm p-3 shadow-lg">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{props.title}</p>
            <p className="text-[11px] text-muted-foreground">
              Add <span className="font-mono">?tourDebug=1</span> to enable (dev only)
            </p>
          </div>
          <Badge variant="secondary" className="text-[10px]">
            {props.isLoading ? "loading" : props.run ? "running" : "idle"}
          </Badge>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
          <div className="rounded-md border border-border p-2">
            <p className="text-muted-foreground">Completed</p>
            <p className={cn("font-mono", props.status.hasCompletedDashboardTour ? "text-foreground" : "text-muted-foreground")}>
              {String(props.status.hasCompletedDashboardTour)}
            </p>
          </div>
          <div className="rounded-md border border-border p-2">
            <p className="text-muted-foreground">Restart nonce</p>
            <p className="font-mono text-foreground">{props.restartNonce}</p>
          </div>
          <div className="rounded-md border border-border p-2">
            <p className="text-muted-foreground">stepIndex</p>
            <p className="font-mono text-foreground">{props.stepIndex}</p>
          </div>
          <div className="rounded-md border border-border p-2">
            <p className="text-muted-foreground">Targets</p>
            <p className="font-mono text-foreground">
              {analysis.valid.length}/{props.steps.length}
            </p>
          </div>
        </div>

        {analysis.missing.length > 0 && (
          <div className="mt-3">
            <p className="text-[11px] font-medium text-foreground">Missing targets</p>
            <ul className="mt-1 max-h-28 overflow-auto space-y-1 pr-1">
              {analysis.missing.map((t) => (
                <li key={t} className="text-[11px] font-mono text-muted-foreground truncate">
                  {t}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>
    </div>
  );
}
