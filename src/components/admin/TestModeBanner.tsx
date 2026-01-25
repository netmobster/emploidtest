import { useFeatureToggle } from "@/contexts/FeatureToggleContext";
import { AlertTriangle } from "lucide-react";

export function TestModeBanner() {
  const { testMode } = useFeatureToggle();

  if (!testMode.enabled) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-yellow-900 py-2 px-4">
      <div className="container mx-auto flex items-center justify-center gap-2 text-sm font-medium">
        <AlertTriangle className="h-4 w-4" />
        <span>PUBLIC MODE - Verification requirements are bypassed</span>
      </div>
    </div>
  );
}
