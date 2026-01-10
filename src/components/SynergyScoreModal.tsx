import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Trophy, AlertTriangle, Heart } from 'lucide-react';
import { Category } from '@/data/questions';
import { badges } from '@/data/badges';
import { getPrimaryBadge } from '@/lib/badgeUtils';

interface SynergyScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  scores: Record<string, number>;
}

const categoryLabels: Record<Category, string> = {
  autonomy: 'Autonomy',
  impact: 'Impact',
  collaboration: 'Collaboration',
  security: 'Security',
  recognition: 'Recognition',
};

const categoryOrder: Category[] = ['autonomy', 'impact', 'collaboration', 'security', 'recognition'];

const categoryIcons: Record<Category, string> = {
  autonomy: '🏠',
  impact: '🚀',
  collaboration: '🤝',
  security: '🛡️',
  recognition: '⭐',
};

export function SynergyScoreModal({ isOpen, onClose, userName, scores }: SynergyScoreModalProps) {
  const chartData = useMemo(() => {
    return categoryOrder.map((key) => ({
      category: categoryLabels[key],
      score: scores[key] ?? 0,
      fullMark: 10,
    }));
  }, [scores]);

  const primaryBadge = useMemo(() => {
    return getPrimaryBadge(scores);
  }, [scores]);

  // Sort categories by score to show highest first
  const sortedCategories = useMemo(() => {
    return [...categoryOrder].sort((a, b) => (scores[b] ?? 0) - (scores[a] ?? 0));
  }, [scores]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            {userName}'s Synergy Score
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Primary Badge */}
          {primaryBadge && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center p-4 bg-primary/10 rounded-xl"
            >
              <Badge className="mb-2 text-sm px-3 py-1">
                {primaryBadge.title}
              </Badge>
              <p className="text-sm text-muted-foreground italic">
                "{primaryBadge.vibe}"
              </p>
              <p className="text-sm text-foreground mt-2">
                {primaryBadge.description}
              </p>
            </motion.div>
          )}

          {/* Radar Chart */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={chartData} cx="50%" cy="50%" outerRadius="70%">
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis
                  dataKey="category"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
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

          {/* Score Breakdown */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground">Score Breakdown</h4>
            <div className="space-y-2">
              {sortedCategories.map((cat, index) => (
                <motion.div
                  key={cat}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-3"
                >
                  <span className="text-xl">{categoryIcons[cat]}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{categoryLabels[cat]}</span>
                      <span className="text-sm text-muted-foreground">{scores[cat] ?? 0}/10</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${((scores[cat] ?? 0) / 10) * 100}%` }}
                        transition={{ delay: index * 0.05 + 0.2, duration: 0.5 }}
                        className="h-full bg-primary rounded-full"
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Badge Details */}
          {primaryBadge && (
            <div className="space-y-4 pt-4 border-t border-border">
              {/* Wins */}
              <div>
                <h4 className="font-medium text-sm flex items-center gap-2 mb-2">
                  <Trophy className="w-4 h-4 text-green-500" />
                  Strengths
                </h4>
                <ul className="space-y-1">
                  {primaryBadge.wins.map((win, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      {win}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Watch-outs */}
              <div>
                <h4 className="font-medium text-sm flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  Watch-outs
                </h4>
                <ul className="space-y-1">
                  {primaryBadge.watchOuts.map((watchOut, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-yellow-500 mt-0.5">!</span>
                      {watchOut}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Best Match */}
              <div>
                <h4 className="font-medium text-sm flex items-center gap-2 mb-2">
                  <Heart className="w-4 h-4 text-primary" />
                  Best Match
                </h4>
                <p className="text-sm text-muted-foreground">
                  {primaryBadge.bestMatch}
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
