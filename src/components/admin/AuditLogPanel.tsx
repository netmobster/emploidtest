import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Shield, Search, Loader2, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";

interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  target_type: string | null;
  target_id: string | null;
  details: unknown;
  created_at: string;
  user_email?: string;
}

const ACTION_CATEGORIES: Record<string, string[]> = {
  authentication: ["signup", "signin", "signout", "login", "logout", "token_refresh"],
  users: ["user_delete", "user_purge", "profile_update", "user_create"],
  jobs: ["job_create", "job_update", "job_close", "job_fill", "job_delete"],
  matches: ["match_create", "unmatch", "swipe_like", "swipe_pass"],
  emails: ["email_sent", "email_failed", "broadcast_email"],
  admin: ["settings_update", "feature_toggle", "test_mode_toggle", "data_purge"],
};

const CATEGORY_COLORS: Record<string, string> = {
  authentication: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  users: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  jobs: "bg-green-500/10 text-green-600 border-green-500/20",
  matches: "bg-pink-500/10 text-pink-600 border-pink-500/20",
  emails: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  admin: "bg-red-500/10 text-red-600 border-red-500/20",
};

const PAGE_SIZE = 50;

export function AuditLogPanel() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchLogs();
  }, [page, categoryFilter]);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      // Get actions for selected category
      let actionsToFilter: string[] = [];
      if (categoryFilter !== "all") {
        actionsToFilter = ACTION_CATEGORIES[categoryFilter] || [];
      }

      // Build query
      let query = supabase
        .from("audit_logs")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      if (actionsToFilter.length > 0) {
        query = query.in("action", actionsToFilter);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      // Fetch user emails for display
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map((log) => log.user_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, email")
          .in("user_id", userIds);

        const emailMap = new Map(profiles?.map((p) => [p.user_id, p.email]) || []);

        setLogs(
          data.map((log) => ({
            ...log,
            user_email: emailMap.get(log.user_id) || "Unknown",
          }))
        );
      } else {
        setLogs([]);
      }

      setTotalCount(count || 0);
    } catch (err) {
      console.error("Failed to fetch audit logs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const getActionCategory = (action: string): string => {
    for (const [category, actions] of Object.entries(ACTION_CATEGORIES)) {
      if (actions.some((a) => action.toLowerCase().includes(a.toLowerCase()))) {
        return category;
      }
    }
    return "admin";
  };

  const getActionColor = (action: string) => {
    const category = getActionCategory(action);
    return CATEGORY_COLORS[category] || "bg-muted text-muted-foreground";
  };

  const filteredLogs = logs.filter((log) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      log.action.toLowerCase().includes(query) ||
      log.user_email?.toLowerCase().includes(query) ||
      log.target_type?.toLowerCase().includes(query) ||
      log.target_id?.toLowerCase().includes(query)
    );
  });

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Audit Logs
              </CardTitle>
              <CardDescription>
                Track all platform activity including signups, matches, jobs, and admin actions.
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={fetchLogs} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by action, user, or target..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setPage(0); }}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="authentication">Authentication</SelectItem>
                <SelectItem value="users">Users</SelectItem>
                <SelectItem value="jobs">Jobs</SelectItem>
                <SelectItem value="matches">Matches</SelectItem>
                <SelectItem value="emails">Emails</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category Legend */}
          <div className="flex flex-wrap gap-2 mb-4">
            {Object.entries(CATEGORY_COLORS).map(([category, colorClass]) => (
              <Badge key={category} variant="outline" className={colorClass}>
                {category}
              </Badge>
            ))}
          </div>

          {/* Logs Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No audit logs found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-sm max-w-[150px] truncate">
                        {log.user_email}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getActionColor(log.action)}>
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {log.target_type ? (
                          <span>
                            {log.target_type}
                            {log.target_id && (
                              <span className="text-muted-foreground ml-1 text-xs">
                                ({log.target_id.slice(0, 8)}...)
                              </span>
                            )}
                          </span>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell className="text-xs font-mono max-w-[200px] truncate">
                        {log.details ? JSON.stringify(log.details) : "-"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {page * PAGE_SIZE + 1}-{Math.min((page + 1) * PAGE_SIZE, totalCount)} of {totalCount} logs
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0 || isLoading}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page + 1} of {Math.max(1, totalPages)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= totalPages - 1 || isLoading}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
