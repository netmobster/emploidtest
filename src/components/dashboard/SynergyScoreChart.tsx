import { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { Category } from '@/data/questions';
import { badges } from '@/data/badges';

interface SynergyScoreChartProps {
  scores: Record<Category, number>;
}

const categoryLabels: Record<Category, string> = {
  autonomy: 'Autonomy',
  impact: 'Impact',
  collaboration: 'Collaboration',
  security: 'Security',
  recognition: 'Recognition',
};

const categoryOrder: Category[] = ['autonomy', 'impact', 'collaboration', 'security', 'recognition'];

export function SynergyScoreChart({ scores }: SynergyScoreChartProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const chartData = useMemo(() => {
    return categoryOrder.map((key) => ({
      category: categoryLabels[key],
      score: scores[key] ?? 0,
      fullMark: 10,
    }));
  }, [scores]);

  const primaryBadge = useMemo(() => {
    const maxScore = Math.max(...Object.values(scores));
    const topCategory = Object.entries(scores).find(([_, value]) => value === maxScore)?.[0] as Category;
    return badges[topCategory];
  }, [scores]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
    >
      <Card className="p-5 shadow-card border border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-foreground">Synergy Score</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/synergy-score-quiz', { state: { returnTo: location.pathname } })}
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Retake
          </Button>
        </div>

        {/* Badge Title */}
        <div className="text-center mb-2">
          <span className="text-sm font-medium text-primary">{primaryBadge?.title}</span>
          <p className="text-xs text-muted-foreground mt-0.5">{primaryBadge?.vibe}</p>
        </div>

        {/* Mini Radar Chart */}
        <div className="w-full h-48">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={chartData} cx="50%" cy="50%" outerRadius="70%">
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis
                dataKey="category"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 10]}
                tick={false}
                axisLine={false}
              />
              <Radar
                name="Score"
                dataKey="score"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Score Summary */}
        <div className="flex flex-wrap justify-center gap-1.5 mt-2">
          {categoryOrder.map((cat) => (
            <div
              key={cat}
              className="flex items-center gap-1 bg-muted px-2 py-0.5 rounded-full text-xs"
            >
              <span className="text-muted-foreground">{categoryLabels[cat].slice(0, 3)}:</span>
              <span className="font-medium text-foreground">{scores[cat]}</span>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}
