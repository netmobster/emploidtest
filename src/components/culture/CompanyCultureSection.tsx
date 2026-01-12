import { motion } from "framer-motion";
import { Palette } from "lucide-react";
import { CultureRadarChart } from "./CultureRadarChart";
import { CultureItem } from "./CultureItem";
import {
  getCultureDimensions,
  parseCulturePreferences,
  groupPreferencesByCategory,
  getCultureCategoryColor,
  getCultureCategoryBgColor,
} from "@/lib/cultureUtils";
import { cn } from "@/lib/utils";

interface CompanyCultureSectionProps {
  culturePreferences: Record<string, string> | null | undefined;
  className?: string;
  compact?: boolean;
}

export function CompanyCultureSection({
  culturePreferences,
  className,
  compact = false,
}: CompanyCultureSectionProps) {
  if (!culturePreferences || Object.keys(culturePreferences).length === 0) {
    return null;
  }

  const dimensions = getCultureDimensions(culturePreferences);
  const preferences = parseCulturePreferences(culturePreferences);
  const categories = groupPreferencesByCategory(preferences);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("space-y-6", className)}
    >
      {/* Section Header */}
      <div className="flex items-center gap-2">
        <Palette className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Company Culture</h3>
      </div>

      {/* Radar Chart */}
      <div className="bg-card rounded-xl p-4 border border-border">
        <p className="text-sm text-muted-foreground mb-2 text-center">
          Culture Profile Overview
        </p>
        <CultureRadarChart dimensions={dimensions} />
      </div>

      {/* Culture Categories */}
      {!compact && (
        <div className="space-y-4">
          {categories.map((category) => {
            const CategoryIcon = category.icon;
            const colorClass = getCultureCategoryColor(category.name);
            const bgColorClass = getCultureCategoryBgColor(category.name);

            return (
              <div key={category.name} className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className={cn("p-1.5 rounded-md", bgColorClass)}>
                    <CategoryIcon className={cn("w-4 h-4", colorClass)} />
                  </div>
                  <h4 className="text-sm font-semibold text-foreground">
                    {category.name}
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {category.preferences.map((pref) => (
                    <CultureItem
                      key={pref.id}
                      label={pref.label}
                      value={pref.value}
                      icon={pref.icon}
                      colorClass={colorClass}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Compact view - just show key preferences */}
      {compact && preferences.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {preferences.slice(0, 6).map((pref) => (
            <div
              key={pref.id}
              className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-secondary/50 text-xs"
            >
              <pref.icon className="w-3 h-3 text-muted-foreground" />
              <span className="text-foreground">{pref.label}</span>
            </div>
          ))}
          {preferences.length > 6 && (
            <div className="px-2 py-1 rounded-full bg-primary/10 text-xs text-primary">
              +{preferences.length - 6} more
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
