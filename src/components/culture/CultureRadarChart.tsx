import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from "recharts";
import { CultureDimension } from "@/lib/cultureUtils";

interface CultureRadarChartProps {
  dimensions: CultureDimension[];
  className?: string;
}

export function CultureRadarChart({ dimensions, className }: CultureRadarChartProps) {
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={250}>
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={dimensions}>
          <PolarGrid 
            stroke="hsl(var(--border))" 
            strokeOpacity={0.5}
          />
          <PolarAngleAxis 
            dataKey="name" 
            tick={{ 
              fill: "hsl(var(--muted-foreground))", 
              fontSize: 12,
              fontWeight: 500
            }}
          />
          <Radar
            name="Culture"
            dataKey="value"
            stroke="hsl(var(--primary))"
            fill="hsl(var(--primary))"
            fillOpacity={0.3}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
