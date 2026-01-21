import { useMemo } from "react";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  Legend,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

interface Candidate {
  candidate_id: string;
  profile: {
    full_name: string | null;
    synergy_scores: Record<string, number> | null;
  } | null;
}

interface SynergyComparisonChartProps {
  candidates: Candidate[];
  employerScores: Record<string, number> | null;
}

const CATEGORIES = ["autonomy", "impact", "collaboration", "security", "recognition"];
const CATEGORY_LABELS: Record<string, string> = {
  autonomy: "Autonomy",
  impact: "Impact",
  collaboration: "Collaboration",
  security: "Security",
  recognition: "Recognition",
};

const COLORS = [
  "hsl(var(--primary))",
  "hsl(221, 83%, 53%)", // Blue
  "hsl(142, 71%, 45%)", // Green
  "hsl(38, 92%, 50%)", // Orange
];

export function SynergyComparisonChart({
  candidates,
  employerScores,
}: SynergyComparisonChartProps) {
  const chartData = useMemo(() => {
    return CATEGORIES.map((category) => {
      const dataPoint: Record<string, any> = {
        category: CATEGORY_LABELS[category],
      };

      // Add employer score
      if (employerScores) {
        dataPoint["You (Employer)"] = employerScores[category] || 0;
      }

      // Add candidate scores
      candidates.forEach((candidate, index) => {
        const name = candidate.profile?.full_name || `Candidate ${index + 1}`;
        dataPoint[name] = candidate.profile?.synergy_scores?.[category] || 0;
      });

      return dataPoint;
    });
  }, [candidates, employerScores]);

  const radarKeys = useMemo(() => {
    const keys: { key: string; color: string }[] = [];

    if (employerScores) {
      keys.push({ key: "You (Employer)", color: "hsl(var(--muted-foreground))" });
    }

    candidates.forEach((candidate, index) => {
      const name = candidate.profile?.full_name || `Candidate ${index + 1}`;
      keys.push({ key: name, color: COLORS[index % COLORS.length] });
    });

    return keys;
  }, [candidates, employerScores]);

  if (candidates.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          Synergy Score Comparison
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <RadarChart data={chartData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis
              dataKey="category"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            />
            {radarKeys.map(({ key, color }, index) => (
              <Radar
                key={key}
                name={key}
                dataKey={key}
                stroke={color}
                fill={color}
                fillOpacity={index === 0 && employerScores ? 0.1 : 0.2}
                strokeWidth={2}
                strokeDasharray={index === 0 && employerScores ? "5 5" : undefined}
              />
            ))}
            <Legend
              wrapperStyle={{ fontSize: 12 }}
              iconType="circle"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: 12,
              }}
              formatter={(value: number) => [value.toFixed(1), ""]}
            />
          </RadarChart>
        </ResponsiveContainer>

        {/* Score Legend */}
        <div className="mt-4 flex flex-wrap gap-4 justify-center text-sm">
          {radarKeys.map(({ key, color }) => (
            <div key={key} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-muted-foreground">{key}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
