import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  delay?: number;
}

export function StatsCard({ title, value, icon: Icon, trend, delay = 0 }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-card rounded-xl p-6 shadow-card border border-border hover-lift"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-3xl font-bold text-foreground mt-2">{value}</p>
          {trend && (
            <p className={`text-sm mt-1 ${trend.isPositive ? 'text-success' : 'text-destructive'}`}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% from last week
            </p>
          )}
        </div>
        <div className="p-3 rounded-lg bg-primary/10">
          <Icon className="w-6 h-6 text-primary" />
        </div>
      </div>
    </motion.div>
  );
}