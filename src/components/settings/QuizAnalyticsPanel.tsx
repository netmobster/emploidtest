import { Loader2, BarChart3, Clock, CheckCircle2, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQuizAnalytics } from "@/hooks/useQuizAnalytics";
import { useCustomQuestionPacks } from "@/hooks/useCustomQuestionPacks";
import { questionPacks } from "@/data/quickFireQuestions";
import { cn } from "@/lib/utils";

export function QuizAnalyticsPanel() {
  const { summary, isLoading: analyticsLoading } = useQuizAnalytics();
  const { packs: customPacks, isLoading: packsLoading } = useCustomQuestionPacks();

  const isLoading = analyticsLoading || packsLoading;

  // Enrich summary with pack titles
  const enrichedSummary = summary.map((item) => {
    let packTitle = item.packId;
    
    if (item.isCustomPack) {
      const customPack = customPacks.find((p) => p.id === item.packId);
      packTitle = customPack?.title || "Custom Pack";
    } else {
      const defaultPack = questionPacks.find((p) => p.id === item.packId);
      packTitle = defaultPack?.title || item.packId;
    }

    return { ...item, packTitle };
  });

  const totalSent = summary.reduce((acc, s) => acc + s.totalSent, 0);
  const totalCompleted = summary.reduce((acc, s) => acc + s.totalCompleted, 0);
  const overallCompletionRate = totalSent > 0 ? (totalCompleted / totalSent) * 100 : 0;

  const formatTime = (seconds: number | null) => {
    if (!seconds) return "—";
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          Quiz Engagement Analytics
        </CardTitle>
        <CardDescription>
          Track which question packs get the best candidate engagement.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold text-foreground">{totalSent}</p>
            <p className="text-xs text-muted-foreground">Quizzes Sent</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold text-foreground">{totalCompleted}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold text-primary">
              {overallCompletionRate.toFixed(0)}%
            </p>
            <p className="text-xs text-muted-foreground">Completion Rate</p>
          </div>
        </div>

        {/* Pack Performance */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Pack Performance
          </h4>

          {enrichedSummary.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No quiz data yet. Send some quizzes to see analytics!
            </p>
          ) : (
            <div className="space-y-3">
              {enrichedSummary.map((item, index) => (
                <div
                  key={item.packId}
                  className="p-3 rounded-lg border border-border bg-card space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {index === 0 && enrichedSummary.length > 1 && (
                        <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30">
                          Top Performer
                        </Badge>
                      )}
                      <span className="font-medium text-sm">{item.packTitle}</span>
                      {item.isCustomPack && (
                        <Badge variant="outline" className="text-[10px]">
                          Custom
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {item.totalCompleted}/{item.totalSent}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {formatTime(item.avgResponseTimeSeconds)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Completion Rate</span>
                      <span
                        className={cn(
                          "font-medium",
                          item.completionRate >= 70
                            ? "text-green-600"
                            : item.completionRate >= 40
                            ? "text-amber-600"
                            : "text-red-600"
                        )}
                      >
                        {item.completionRate.toFixed(0)}%
                      </span>
                    </div>
                    <Progress
                      value={item.completionRate}
                      className={cn(
                        "h-2",
                        item.completionRate >= 70
                          ? "[&>div]:bg-green-500"
                          : item.completionRate >= 40
                          ? "[&>div]:bg-amber-500"
                          : "[&>div]:bg-red-500"
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
