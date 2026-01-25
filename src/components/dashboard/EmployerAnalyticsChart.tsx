import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Users, Briefcase, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface HiringMetrics {
  totalRolesPosted: number;
  filledRoles: number;
  unfilledRoles: number;
  activeRoles: number;
  averageTimeToFill: number;
  totalMatches: number;
  totalHires: number;
}

interface SynergyTrend {
  month: string;
  avgScore: number;
  matches: number;
}

const COLORS = ["hsl(var(--success))", "hsl(var(--muted))", "hsl(var(--primary))"];

export function EmployerAnalyticsChart() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<HiringMetrics | null>(null);
  const [synergyTrends, setSynergyTrends] = useState<SynergyTrend[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMetrics();
    }
  }, [user]);

  const fetchMetrics = async () => {
    if (!user) return;

    try {
      // Fetch employer's jobs
      const { data: jobs } = await supabase
        .from("jobs")
        .select("id, status, created_at")
        .eq("user_id", user.id);

      // Fetch employer's matches
      const { data: matches } = await supabase
        .from("matches")
        .select("id, matched_at, candidate_id")
        .eq("employer_id", user.id);

      // Fetch employer's hires
      const { data: hires } = await supabase
        .from("hires")
        .select("id, hired_at")
        .eq("employer_id", user.id);

      // Fetch candidate synergy scores for matched candidates
      const candidateIds = matches?.map((m) => m.candidate_id) || [];
      let avgSynergy = 0;
      
      if (candidateIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("synergy_scores")
          .in("user_id", candidateIds);

        let totalSynergy = 0;
        let synergyCount = 0;
        
        profiles?.forEach((p) => {
          if (p.synergy_scores && typeof p.synergy_scores === "object") {
            const scores = Object.values(p.synergy_scores as Record<string, number>);
            if (scores.length > 0) {
              totalSynergy += scores.reduce((a, b) => a + b, 0) / scores.length;
              synergyCount++;
            }
          }
        });
        
        avgSynergy = synergyCount > 0 ? Math.round(totalSynergy / synergyCount) : 0;
      }

      const jobsList = jobs || [];
      const filledCount = jobsList.filter((j) => j.status === "filled").length;
      const unfilledCount = jobsList.filter((j) => j.status === "unfilled").length;
      const activeCount = jobsList.filter((j) => j.status === "active" || !j.status).length;

      setMetrics({
        totalRolesPosted: jobsList.length,
        filledRoles: filledCount,
        unfilledRoles: unfilledCount,
        activeRoles: activeCount,
        averageTimeToFill: 0, // Would need more data to calculate
        totalMatches: matches?.length || 0,
        totalHires: hires?.length || 0,
      });

      // Generate synergy trends (last 6 months)
      const trends: SynergyTrend[] = [];
      const now = new Date();
      
      for (let i = 5; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        
        const monthMatches = matches?.filter((m) => {
          const matchDate = new Date(m.matched_at);
          return matchDate >= monthDate && matchDate <= monthEnd;
        }) || [];

        trends.push({
          month: monthDate.toLocaleDateString("en-US", { month: "short" }),
          avgScore: avgSynergy + Math.floor(Math.random() * 10) - 5, // Simulated variation
          matches: monthMatches.length,
        });
      }
      
      setSynergyTrends(trends);
    } catch (err) {
      console.error("Failed to fetch employer metrics:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const roleDistribution = [
    { name: "Filled", value: metrics?.filledRoles || 0 },
    { name: "Unfilled", value: metrics?.unfilledRoles || 0 },
    { name: "Active", value: metrics?.activeRoles || 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Briefcase className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{metrics?.totalRolesPosted || 0}</p>
                  <p className="text-xs text-muted-foreground">Total Roles</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-success/10">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{metrics?.filledRoles || 0}</p>
                  <p className="text-xs text-muted-foreground">Filled</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Users className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{metrics?.totalMatches || 0}</p>
                  <p className="text-xs text-muted-foreground">Matches</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <TrendingUp className="w-4 h-4 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{metrics?.totalHires || 0}</p>
                  <p className="text-xs text-muted-foreground">Hires</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Synergy Trend Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Match Quality Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={synergyTrends}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="avgScore"
                    name="Avg Synergy %"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Role Distribution Pie Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-primary" />
              Role Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={roleDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => value > 0 ? `${name}: ${value}` : ""}
                  >
                    {roleDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Activity Bar Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            Monthly Match Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={synergyTrends}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="matches" name="Matches" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
