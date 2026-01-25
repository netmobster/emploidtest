import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Users, Briefcase, Handshake, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface AdminMetrics {
  totalHires: number;
  activeSynergyScore: number;
  totalCandidates: number;
  totalEmployers: number;
  activeRoles: number;
}

export function AdminMetricsBar() {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      // Fetch hires count
      const { count: hiresCount } = await supabase
        .from("hires")
        .select("*", { count: "exact", head: true });

      // Fetch profiles
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_type, synergy_scores");

      // Fetch active jobs
      const { data: jobs } = await supabase
        .from("jobs")
        .select("status")
        .eq("status", "active" as any);

      // Fetch active matches for synergy calculation
      const { data: matches } = await supabase
        .from("matches")
        .select("id")
        .eq("status", "active");

      const candidates = profiles?.filter((p) => p.user_type === "candidate") || [];
      const employers = profiles?.filter((p) => p.user_type === "employer") || [];

      // Calculate average synergy score from profiles with synergy_scores
      let totalSynergy = 0;
      let synergyCount = 0;
      profiles?.forEach((p) => {
        if (p.synergy_scores && typeof p.synergy_scores === "object") {
          const scores = Object.values(p.synergy_scores as Record<string, number>);
          if (scores.length > 0) {
            const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
            totalSynergy += avg;
            synergyCount++;
          }
        }
      });

      const avgSynergy = synergyCount > 0 ? Math.round(totalSynergy / synergyCount) : 0;

      setMetrics({
        totalHires: hiresCount || 0,
        activeSynergyScore: avgSynergy,
        totalCandidates: candidates.length,
        totalEmployers: employers.length,
        activeRoles: jobs?.length || 0,
      });
    } catch (err) {
      console.error("Failed to fetch admin metrics:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const metricsData = [
    {
      title: "Total Hires",
      value: metrics?.totalHires || 0,
      icon: Handshake,
      color: "bg-success/10 text-success",
      description: "Successful placements",
    },
    {
      title: "Active Synergy",
      value: `${metrics?.activeSynergyScore || 0}%`,
      icon: TrendingUp,
      color: "bg-primary/10 text-primary",
      description: "Avg match quality",
    },
    {
      title: "Total Users",
      value: (metrics?.totalCandidates || 0) + (metrics?.totalEmployers || 0),
      icon: Users,
      color: "bg-blue-500/10 text-blue-500",
      description: `${metrics?.totalCandidates} candidates, ${metrics?.totalEmployers} employers`,
    },
    {
      title: "Active Roles",
      value: metrics?.activeRoles || 0,
      icon: Briefcase,
      color: "bg-orange-500/10 text-orange-500",
      description: "Open positions",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {metricsData.map((metric, index) => (
        <motion.div
          key={metric.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-full ${metric.color}`}>
                  <metric.icon className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-2xl font-bold text-foreground">{metric.value}</p>
                  <p className="text-sm font-medium text-foreground">{metric.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{metric.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
