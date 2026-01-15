import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  Users,
  MessageSquare,
  Heart,
  Briefcase,
  TrendingUp,
  Loader2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface Stats {
  totalUsers: number;
  totalCandidates: number;
  totalEmployers: number;
  totalMatches: number;
  totalMessages: number;
  totalJobs: number;
  activeUsers7d: number;
  activeUsers30d: number;
  completedProfiles: number;
  incompleteProfiles: number;
}

interface DailyStats {
  date: string;
  signups: number;
  matches: number;
  messages: number;
}

const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--muted))"];

export function AnalyticsPanel() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      // Fetch profiles
      const { data: profiles } = await supabase.from("profiles").select("*");

      // Fetch matches
      const { data: matches } = await supabase.from("matches").select("matched_at");

      // Fetch messages
      const { data: messages } = await supabase.from("messages").select("created_at");

      // Fetch jobs
      const { data: jobs } = await supabase.from("jobs").select("id");

      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Calculate stats
      const profileList = profiles || [];
      const matchList = matches || [];
      const messageList = messages || [];

      setStats({
        totalUsers: profileList.length,
        totalCandidates: profileList.filter((p) => p.user_type === "candidate").length,
        totalEmployers: profileList.filter((p) => p.user_type === "employer").length,
        totalMatches: matchList.length,
        totalMessages: messageList.length,
        totalJobs: jobs?.length || 0,
        activeUsers7d: profileList.filter(
          (p) => new Date(p.updated_at) >= sevenDaysAgo
        ).length,
        activeUsers30d: profileList.filter(
          (p) => new Date(p.updated_at) >= thirtyDaysAgo
        ).length,
        completedProfiles: profileList.filter((p) => p.has_completed_profile).length,
        incompleteProfiles: profileList.filter((p) => !p.has_completed_profile).length,
      });

      // Calculate daily stats for last 7 days
      const dailyData: DailyStats[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split("T")[0];
        const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);

        dailyData.push({
          date: date.toLocaleDateString("en-US", { weekday: "short" }),
          signups: profileList.filter((p) => {
            const created = new Date(p.created_at);
            return created >= date && created < nextDate;
          }).length,
          matches: matchList.filter((m) => {
            const created = new Date(m.matched_at);
            return created >= date && created < nextDate;
          }).length,
          messages: messageList.filter((msg) => {
            const created = new Date(msg.created_at);
            return created >= date && created < nextDate;
          }).length,
        });
      }
      setDailyStats(dailyData);
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const userTypeData = [
    { name: "Candidates", value: stats?.totalCandidates || 0 },
    { name: "Employers", value: stats?.totalEmployers || 0 },
  ];

  const profileStatusData = [
    { name: "Complete", value: stats?.completedProfiles || 0 },
    { name: "Incomplete", value: stats?.incompleteProfiles || 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.totalUsers || 0}</p>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-pink-500/10">
                <Heart className="h-6 w-6 text-pink-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.totalMatches || 0}</p>
                <p className="text-sm text-muted-foreground">Total Matches</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-500/10">
                <MessageSquare className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.totalMessages || 0}</p>
                <p className="text-sm text-muted-foreground">Messages Sent</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-500/10">
                <Briefcase className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.totalJobs || 0}</p>
                <p className="text-sm text-muted-foreground">Active Jobs</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Activity (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyStats}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Bar dataKey="signups" fill="hsl(var(--primary))" name="Signups" />
                  <Bar dataKey="matches" fill="hsl(var(--secondary))" name="Matches" />
                  <Bar dataKey="messages" fill="hsl(var(--muted))" name="Messages" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={userTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {userTypeData.map((entry, index) => (
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

      {/* Active Users */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            User Engagement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-3xl font-bold text-primary">{stats?.activeUsers7d || 0}</p>
              <p className="text-sm text-muted-foreground">Active (7 days)</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-3xl font-bold text-primary">{stats?.activeUsers30d || 0}</p>
              <p className="text-sm text-muted-foreground">Active (30 days)</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-3xl font-bold text-green-600">{stats?.completedProfiles || 0}</p>
              <p className="text-sm text-muted-foreground">Complete Profiles</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-3xl font-bold text-yellow-600">{stats?.incompleteProfiles || 0}</p>
              <p className="text-sm text-muted-foreground">Incomplete Profiles</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
