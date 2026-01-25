import { useState, useEffect } from "react";
import { Loader2, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

interface TrendData {
  date: string;
  users: number;
  hires: number;
  activeRoles: number;
}

export function GrowthTrendline() {
  const [data, setData] = useState<TrendData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"weekly" | "monthly">("weekly");

  useEffect(() => {
    fetchTrendData();
  }, [timeRange]);

  const fetchTrendData = async () => {
    setIsLoading(true);
    try {
      const now = new Date();
      const periods = timeRange === "weekly" ? 8 : 6;
      const trendData: TrendData[] = [];

      for (let i = periods - 1; i >= 0; i--) {
        const periodStart = new Date(now);
        const periodEnd = new Date(now);

        if (timeRange === "weekly") {
          periodStart.setDate(periodStart.getDate() - (i + 1) * 7);
          periodEnd.setDate(periodEnd.getDate() - i * 7);
        } else {
          periodStart.setMonth(periodStart.getMonth() - (i + 1));
          periodEnd.setMonth(periodEnd.getMonth() - i);
        }

        // Count users created in this period
        const { count: usersCount } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .lte("created_at", periodEnd.toISOString());

        // Count hires in this period
        const { count: hiresCount } = await supabase
          .from("hires")
          .select("*", { count: "exact", head: true })
          .lte("hired_at", periodEnd.toISOString());

        // Count active roles at this point
        const { count: rolesCount } = await supabase
          .from("jobs")
          .select("*", { count: "exact", head: true })
          .eq("status", "active" as any)
          .lte("created_at", periodEnd.toISOString());

        const label = timeRange === "weekly"
          ? `Week ${periods - i}`
          : periodEnd.toLocaleDateString("en-US", { month: "short" });

        trendData.push({
          date: label,
          users: usersCount || 0,
          hires: hiresCount || 0,
          activeRoles: rolesCount || 0,
        });
      }

      setData(trendData);
    } catch (err) {
      console.error("Failed to fetch trend data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Growth Trendline</CardTitle>
              <CardDescription>Platform growth over time</CardDescription>
            </div>
          </div>
          <Select value={timeRange} onValueChange={(v) => setTimeRange(v as "weekly" | "monthly")}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="users"
                  name="Total Users"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))" }}
                />
                <Line
                  type="monotone"
                  dataKey="hires"
                  name="Total Hires"
                  stroke="hsl(142, 71%, 45%)"
                  strokeWidth={2}
                  dot={{ fill: "hsl(142, 71%, 45%)" }}
                />
                <Line
                  type="monotone"
                  dataKey="activeRoles"
                  name="Active Roles"
                  stroke="hsl(38, 92%, 50%)"
                  strokeWidth={2}
                  dot={{ fill: "hsl(38, 92%, 50%)" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
