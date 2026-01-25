import { useState, useEffect } from "react";
import { Loader2, XCircle, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface ReasonCount {
  reason: string;
  label: string;
  count: number;
  percentage: number;
}

const REASON_LABELS: Record<string, string> = {
  hired_elsewhere: "Hired elsewhere",
  budget_cut: "Budget cut / Role eliminated",
  role_changed: "Role requirements changed",
  internal_hire: "Internal hire",
  on_hold: "Hiring put on hold",
  other: "Other",
};

export function UnfilledReasonsTable() {
  const [reasons, setReasons] = useState<ReasonCount[]>([]);
  const [totalClosures, setTotalClosures] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReasons();
  }, []);

  const fetchReasons = async () => {
    try {
      const { data, error } = await supabase
        .from("role_closures")
        .select("reason");

      if (error) throw error;

      const reasonCounts: Record<string, number> = {};
      data?.forEach((closure) => {
        reasonCounts[closure.reason] = (reasonCounts[closure.reason] || 0) + 1;
      });

      const total = data?.length || 0;
      setTotalClosures(total);

      const reasonsList: ReasonCount[] = Object.entries(reasonCounts)
        .map(([reason, count]) => ({
          reason,
          label: REASON_LABELS[reason] || reason,
          count,
          percentage: total > 0 ? Math.round((count / total) * 100) : 0,
        }))
        .sort((a, b) => b.count - a.count);

      setReasons(reasonsList);
    } catch (err) {
      console.error("Failed to fetch unfilled reasons:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityColor = (percentage: number) => {
    if (percentage >= 40) return "bg-destructive/10 text-destructive";
    if (percentage >= 20) return "bg-orange-500/10 text-orange-600";
    return "bg-muted text-muted-foreground";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          <div>
            <CardTitle>Failed Match Analysis</CardTitle>
            <CardDescription>
              Reasons for unfilled roles ({totalClosures} total closures)
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : reasons.length === 0 ? (
          <div className="text-center py-8">
            <XCircle className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground">No unfilled roles yet</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              This is a good sign! All roles are being filled.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reason</TableHead>
                <TableHead className="text-right">Count</TableHead>
                <TableHead className="text-right">% of Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reasons.map((reason) => (
                <TableRow key={reason.reason}>
                  <TableCell className="font-medium">{reason.label}</TableCell>
                  <TableCell className="text-right">{reason.count}</TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant="secondary"
                      className={getSeverityColor(reason.percentage)}
                    >
                      {reason.percentage}%
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
