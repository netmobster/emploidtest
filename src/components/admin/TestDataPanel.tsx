import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Database, Download, Upload, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";

const DATA_TABLES = [
  { id: "swipes", label: "Swipes", description: "All swipe actions" },
  { id: "matches", label: "Matches", description: "Match records between users" },
  { id: "messages", label: "Messages", description: "Chat messages" },
  { id: "notifications", label: "Notifications", description: "User notifications" },
  { id: "job_applications", label: "Job Applications", description: "Application records" },
  { id: "saved_jobs", label: "Saved Jobs", description: "Saved job bookmarks" },
];

export function TestDataPanel() {
  const { logAuditAction } = useAdminSettings();
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [isClearing, setIsClearing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);

  const toggleTable = (tableId: string) => {
    setSelectedTables((prev) =>
      prev.includes(tableId) ? prev.filter((t) => t !== tableId) : [...prev, tableId]
    );
  };

  const selectAll = () => {
    setSelectedTables(DATA_TABLES.map((t) => t.id));
  };

  const clearSelection = () => {
    setSelectedTables([]);
  };

  const handleClearData = async () => {
    if (selectedTables.length === 0) {
      toast.error("Please select at least one table");
      return;
    }

    setIsClearing(true);
    try {
      for (const table of selectedTables) {
        // Delete all data from each selected table
        const { error } = await supabase.from(table as any).delete().neq("id", "00000000-0000-0000-0000-000000000000");

        if (error) {
          console.error(`Failed to clear ${table}:`, error);
          throw error;
        }
      }

      await logAuditAction("clear_data", "tables", null, {
        tables: selectedTables,
      });

      toast.success(`Cleared data from ${selectedTables.length} tables`);
      setShowClearDialog(false);
      setSelectedTables([]);
    } catch (err) {
      toast.error("Failed to clear data");
    } finally {
      setIsClearing(false);
    }
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const exportData: Record<string, any[]> = {};

      for (const table of DATA_TABLES) {
        const { data, error } = await supabase.from(table.id as any).select("*");

        if (error) {
          console.error(`Failed to export ${table.id}:`, error);
          continue;
        }

        exportData[table.id] = data || [];
      }

      // Also export profiles (without sensitive data)
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, user_id, full_name, user_type, bio, company_name, job_title, location, skills");

      exportData.profiles = profiles || [];

      // Also export jobs
      const { data: jobs } = await supabase.from("jobs").select("*");
      exportData.jobs = jobs || [];

      // Create download
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `emploid-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      await logAuditAction("export_data", "database", null, {
        tables: Object.keys(exportData),
      });

      toast.success("Data exported successfully");
    } catch (err) {
      toast.error("Failed to export data");
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      let importedCount = 0;

      for (const [table, rows] of Object.entries(data)) {
        if (!Array.isArray(rows) || rows.length === 0) continue;

        // Skip profiles for now - they need special handling
        if (table === "profiles") continue;

        const { error } = await supabase.from(table as any).upsert(rows as any[], {
          onConflict: "id",
        });

        if (error) {
          console.error(`Failed to import ${table}:`, error);
        } else {
          importedCount += rows.length;
        }
      }

      await logAuditAction("import_data", "database", null, {
        file: file.name,
        recordsImported: importedCount,
      });

      toast.success(`Imported ${importedCount} records`);
    } catch (err) {
      toast.error("Failed to import data. Make sure the file is valid JSON.");
    } finally {
      setIsImporting(false);
      // Reset file input
      event.target.value = "";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Test Data Management
          </CardTitle>
          <CardDescription>
            Import, export, or clear test data from the database.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleExportData} disabled={isExporting} variant="outline">
              {isExporting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Export All Data
            </Button>

            <div className="relative">
              <Input
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="absolute inset-0 opacity-0 cursor-pointer"
                disabled={isImporting}
              />
              <Button variant="outline" disabled={isImporting}>
                {isImporting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                Import Data
              </Button>
            </div>
          </div>

          {/* Table Selection for Clearing */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Select Tables to Clear</h3>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={selectAll}>
                  Select All
                </Button>
                <Button variant="ghost" size="sm" onClick={clearSelection}>
                  Clear Selection
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {DATA_TABLES.map((table) => (
                <div
                  key={table.id}
                  className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    id={table.id}
                    checked={selectedTables.includes(table.id)}
                    onCheckedChange={() => toggleTable(table.id)}
                  />
                  <div className="space-y-1">
                    <Label htmlFor={table.id} className="font-medium cursor-pointer">
                      {table.label}
                    </Label>
                    <p className="text-xs text-muted-foreground">{table.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  disabled={selectedTables.length === 0}
                  className="mt-4"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Selected Tables ({selectedTables.length})
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-5 w-5" />
                    Confirm Data Clear
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all data from the following tables:
                    <ul className="mt-2 list-disc list-inside">
                      {selectedTables.map((t) => (
                        <li key={t}>{DATA_TABLES.find((dt) => dt.id === t)?.label}</li>
                      ))}
                    </ul>
                    <br />
                    <strong>This action cannot be undone.</strong>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleClearData}
                    disabled={isClearing}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isClearing ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : null}
                    Clear Data
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
