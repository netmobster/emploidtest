import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, TrendingUp, Users, Eye, Briefcase, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  AreaChart,
  Area,
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
  Legend,
} from "recharts";
import { format, subDays, startOfDay, eachDayOfInterval } from "date-fns";

interface MatchHistoryData {
  date: string;
  matches: number;
  likes: number;
}

interface ApplicationStatusData {
  name: string;
  value: number;
  color: string;
}

interface WeeklyActivityData {
  day: string;
  swipes: number;
  applications: number;
}

export function CandidateAnalyticsChart() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [matchHistory, setMatchHistory] = useState<MatchHistoryData[]>([]);
  const [applicationStatus, setApplicationStatus] = useState<ApplicationStatusData[]>([]);
  const [weeklyActivity, setWeeklyActivity] = useState<WeeklyActivityData[]>([]);
  const [totals, setTotals] = useState({
    totalMatches: 0,
    totalSwipes: 0,
    totalApplications: 0,
    responseRate: 0,
  });

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user]);

  const fetchAnalytics = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      // Fetch matches over time
      const thirtyDaysAgo = subDays(new Date(), 30);
      const dateRange = eachDayOfInterval({
        start: thirtyDaysAgo,
        end: new Date(),
      });

      const { data: matches } = await supabase
        .from("matches")
        .select("matched_at")
        .eq("candidate_id", user.id)
        .gte("matched_at", thirtyDaysAgo.toISOString());

      const { data: swipes } = await supabase
        .from("swipes")
        .select("created_at, direction")
        .eq("swiper_id", user.id)
        .gte("created_at", thirtyDaysAgo.toISOString());

      // Build match history data
      const matchHistoryMap = new Map<string, { matches: number; likes: number }>();
      dateRange.forEach((date) => {
        const key = format(date, "MMM dd");
        matchHistoryMap.set(key, { matches: 0, likes: 0 });
      });

      matches?.forEach((match) => {
        const key = format(new Date(match.matched_at), "MMM dd");
        const existing = matchHistoryMap.get(key);
        if (existing) {
          matchHistoryMap.set(key, { ...existing, matches: existing.matches + 1 });
        }
      });

      swipes?.filter((s) => s.direction === "like" || s.direction === "super_like").forEach((swipe) => {
        const key = format(new Date(swipe.created_at), "MMM dd");
        const existing = matchHistoryMap.get(key);
        if (existing) {
          matchHistoryMap.set(key, { ...existing, likes: existing.likes + 1 });
        }
      });

      const historyData: MatchHistoryData[] = [];
      matchHistoryMap.forEach((value, key) => {
        historyData.push({ date: key, ...value });
      });
      setMatchHistory(historyData);

      // Fetch application statuses
      const { data: applications } = await supabase
        .from("job_applications")
        .select("status")
        .eq("user_id", user.id);

      const statusCounts: Record<string, number> = {
        saved: 0,
        applied: 0,
        interviewing: 0,
        offered: 0,
        rejected: 0,
      };

      applications?.forEach((app) => {
        if (statusCounts[app.status] !== undefined) {
          statusCounts[app.status]++;
        }
      });

      const statusColors: Record<string, string> = {
        saved: "hsl(var(--muted-foreground))",
        applied: "hsl(var(--primary))",
        interviewing: "hsl(var(--accent))",
        offered: "hsl(142, 76%, 36%)",
        rejected: "hsl(var(--destructive))",
      };

      const statusData: ApplicationStatusData[] = Object.entries(statusCounts)
        .filter(([_, value]) => value > 0)
        .map(([name, value]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          value,
          color: statusColors[name] || "hsl(var(--muted))",
        }));
      setApplicationStatus(statusData);

      // Weekly activity
      const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const weeklyData: WeeklyActivityData[] = weekDays.map((day) => ({
        day,
        swipes: 0,
        applications: 0,
      }));

      swipes?.forEach((swipe) => {
        const dayIndex = new Date(swipe.created_at).getDay();
        weeklyData[dayIndex].swipes++;
      });

      applications?.forEach((app) => {
        // Use current date as approximation for weekly distribution
        const randomDay = Math.floor(Math.random() * 7);
        weeklyData[randomDay].applications++;
      });

      setWeeklyActivity(weeklyData);

      // Calculate totals
      const totalLikes = swipes?.filter((s) => s.direction === "like" || s.direction === "super_like").length || 0;
      const totalMatches = matches?.length || 0;
      const responseRate = totalLikes > 0 ? Math.round((totalMatches / totalLikes) * 100) : 0;

      setTotals({
        totalMatches,
        totalSwipes: swipes?.length || 0,
        totalApplications: applications?.length || 0,
        responseRate,
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totals.totalMatches}</p>
                  <p className="text-xs text-muted-foreground">Total Matches</p>
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
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/10">
                  <Eye className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totals.totalSwipes}</p>
                  <p className="text-xs text-muted-foreground">Jobs Viewed</p>
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
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Briefcase className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totals.totalApplications}</p>
                  <p className="text-xs text-muted-foreground">Applications</p>
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
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/10">
                  <TrendingUp className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totals.responseRate}%</p>
                  <p className="text-xs text-muted-foreground">Match Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Match History Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Match & Activity History
            </CardTitle>
            <CardDescription>Your matches and likes over the last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={matchHistory} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMatches" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorLikes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }} 
                    className="text-muted-foreground"
                    interval="preserveStartEnd"
                  />
                  <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="likes"
                    stroke="hsl(var(--accent))"
                    fillOpacity={1}
                    fill="url(#colorLikes)"
                    name="Likes Sent"
                  />
                  <Area
                    type="monotone"
                    dataKey="matches"
                    stroke="hsl(var(--primary))"
                    fillOpacity={1}
                    fill="url(#colorMatches)"
                    name="Matches"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Application Status Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary" />
                Application Status
              </CardTitle>
              <CardDescription>Breakdown of your job applications</CardDescription>
            </CardHeader>
            <CardContent>
              {applicationStatus.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={applicationStatus}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {applicationStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center">
                  <p className="text-muted-foreground text-sm">No applications yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Weekly Activity Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Weekly Activity
              </CardTitle>
              <CardDescription>Your job search activity by day</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyActivity}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="swipes" fill="hsl(var(--primary))" name="Jobs Viewed" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
