import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, Legend, Tooltip } from "recharts";
import { getCultureDimensions } from "@/lib/cultureUtils";

interface DualRadarChartProps {
  userPreferences: Record<string, string> | null | undefined;
  otherPreferences: Record<string, string> | null | undefined;
  userLabel?: string;
  otherLabel?: string;
  userColor?: string;
  otherColor?: string;
  className?: string;
}

export function DualRadarChart({
  userPreferences,
  otherPreferences,
  userLabel = "You",
  otherLabel = "Company",
  userColor = "hsl(var(--primary))",
  otherColor = "hsl(var(--secondary))",
  className,
}: DualRadarChartProps) {
  const userDimensions = getCultureDimensions(userPreferences);
  const otherDimensions = getCultureDimensions(otherPreferences);

  // Merge dimensions for dual display
  const mergedData = userDimensions.map((dim) => {
    const otherDim = otherDimensions.find((d) => d.name === dim.name);
    return {
      dimension: dim.name,
      userScore: dim.value,
      otherScore: otherDim?.value || 0,
    };
  });

  if (!userPreferences && !otherPreferences) {
    return (
      <div className={`flex items-center justify-center h-64 text-muted-foreground ${className}`}>
        No culture data available
      </div>
    );
  }

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={mergedData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
          <PolarGrid stroke="hsl(var(--border))" />
          <PolarAngleAxis
            dataKey="dimension"
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
          />
          <Radar
            name={userLabel}
            dataKey="userScore"
            stroke={userColor}
            fill={userColor}
            fillOpacity={0.3}
            strokeWidth={2}
          />
          <Radar
            name={otherLabel}
            dataKey="otherScore"
            stroke={otherColor}
            fill={otherColor}
            fillOpacity={0.3}
            strokeWidth={2}
          />
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
            formatter={(value: number, name: string) => [`${value}%`, name]}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
