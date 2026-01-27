import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { Database, Download, Upload, Trash2, AlertTriangle, Loader2, Save, FolderOpen, RotateCcw, Eraser } from "lucide-react";
import { toast } from "sonner";

interface SavedDataset {
  name: string;
  created_at: string;
  size: number;
}

const DATA_TABLES = [
  { id: "swipes", label: "Swipes", description: "All swipe actions" },
  { id: "matches", label: "Matches", description: "Match records between users" },
  { id: "messages", label: "Messages", description: "Chat messages" },
  { id: "notifications", label: "Notifications", description: "User notifications" },
  { id: "job_applications", label: "Job Applications", description: "Application records" },
  { id: "saved_jobs", label: "Saved Jobs", description: "Saved job bookmarks" },
  { id: "interviews", label: "Interviews", description: "Interview records" },
  { id: "shortlists", label: "Shortlists", description: "Employer shortlists" },
];

export function TestDataPanel() {
  const { logAuditAction } = useAdminSettings();
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [isClearing, setIsClearing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isResettingSwipes, setIsResettingSwipes] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [savedDatasets, setSavedDatasets] = useState<SavedDataset[]>([]);
  const [newDatasetName, setNewDatasetName] = useState("");
  const [loadingDataset, setLoadingDataset] = useState<string | null>(null);

  const handleResetSwipes = async () => {
    setIsResettingSwipes(true);
    try {
      const { error } = await supabase
        .from("swipes")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000");

      if (error) throw error;

      await logAuditAction("reset_swipes", "swipes");
      toast.success("All swipes cleared! Refresh the swipe page to see all jobs again.");
    } catch (err) {
      console.error("Failed to reset swipes:", err);
      toast.error("Failed to reset swipes");
    } finally {
      setIsResettingSwipes(false);
    }
  };

  useEffect(() => {
    loadSavedDatasets();
  }, []);

  const loadSavedDatasets = () => {
    try {
      const stored = localStorage.getItem("emploid_test_datasets");
      if (stored) {
        setSavedDatasets(JSON.parse(stored));
      }
    } catch (err) {
      console.error("Failed to load datasets:", err);
    }
  };

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
        const { error } = await supabase.from(table as any).delete().neq("id", "00000000-0000-0000-0000-000000000000");

        if (error) {
          console.error(`Failed to clear ${table}:`, error);
          throw error;
        }
      }

      await logAuditAction("clear_data", "tables", undefined, { tables: selectedTables });
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

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, user_id, full_name, user_type, bio, company_name, job_title, location, skills");
      exportData.profiles = profiles || [];

      const { data: jobs } = await supabase.from("jobs").select("*");
      exportData.jobs = jobs || [];

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `emploid-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      await logAuditAction("export_data", "database");
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
        if (table === "profiles") continue;

        const { error } = await supabase.from(table as any).upsert(rows as any[], { onConflict: "id" });
        if (error) {
          console.error(`Failed to import ${table}:`, error);
        } else {
          importedCount += rows.length;
        }
      }

      await logAuditAction("import_data", "database", undefined, { file: file.name, recordsImported: importedCount });
      toast.success(`Imported ${importedCount} records`);
    } catch (err) {
      toast.error("Failed to import data. Make sure the file is valid JSON.");
    } finally {
      setIsImporting(false);
      event.target.value = "";
    }
  };

  const handleSaveAsDataset = async () => {
    if (!newDatasetName.trim()) {
      toast.error("Please enter a dataset name");
      return;
    }

    setIsSaving(true);
    try {
      const exportData: Record<string, any[]> = {};

      for (const table of DATA_TABLES) {
        const { data } = await supabase.from(table.id as any).select("*");
        exportData[table.id] = data || [];
      }

      const { data: profiles } = await supabase.from("profiles").select("*");
      exportData.profiles = profiles || [];

      const { data: jobs } = await supabase.from("jobs").select("*");
      exportData.jobs = jobs || [];

      const dataset: SavedDataset = {
        name: newDatasetName.trim(),
        created_at: new Date().toISOString(),
        size: JSON.stringify(exportData).length,
      };

      const datasets = [...savedDatasets, dataset];
      localStorage.setItem("emploid_test_datasets", JSON.stringify(datasets));
      localStorage.setItem(`emploid_dataset_${dataset.name}`, JSON.stringify(exportData));

      setSavedDatasets(datasets);
      setNewDatasetName("");
      toast.success(`Dataset "${dataset.name}" saved`);
    } catch (err) {
      toast.error("Failed to save dataset");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadDataset = async (datasetName: string) => {
    setLoadingDataset(datasetName);
    try {
      const stored = localStorage.getItem(`emploid_dataset_${datasetName}`);
      if (!stored) {
        toast.error("Dataset not found");
        return;
      }

      const importData = JSON.parse(stored);

      // Clear existing data first
      for (const table of DATA_TABLES) {
        await supabase.from(table.id as any).delete().neq("id", "00000000-0000-0000-0000-000000000000");
      }

      // Import dataset data
      for (const [table, records] of Object.entries(importData)) {
        if (table === "profiles") continue;
        if (!Array.isArray(records) || records.length === 0) continue;
        await supabase.from(table as any).upsert(records as any[]);
      }

      await logAuditAction("dataset_load", "dataset", datasetName);
      toast.success(`Dataset "${datasetName}" loaded`);
    } catch (err) {
      toast.error("Failed to load dataset");
    } finally {
      setLoadingDataset(null);
    }
  };

  const handleDeleteDataset = (datasetName: string) => {
    const datasets = savedDatasets.filter((d) => d.name !== datasetName);
    localStorage.setItem("emploid_test_datasets", JSON.stringify(datasets));
    localStorage.removeItem(`emploid_dataset_${datasetName}`);
    setSavedDatasets(datasets);
    toast.success(`Dataset "${datasetName}" deleted`);
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Export/Import Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Management
          </CardTitle>
          <CardDescription>
            Export, import, and manage test datasets for QA and development.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleExportData} disabled={isExporting} variant="outline">
              {isExporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
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
                {isImporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                Import Data
              </Button>
            </div>

            <Button 
              onClick={handleResetSwipes} 
              disabled={isResettingSwipes} 
              variant="outline"
              className="border-amber-500/50 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
            >
              {isResettingSwipes ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Eraser className="h-4 w-4 mr-2" />}
              Reset All Swipes
            </Button>
          </div>

          {/* Save as Dataset */}
          <div className="border-t pt-6">
            <Label className="text-sm font-medium mb-2 block">Save Current State as Test Dataset</Label>
            <div className="flex gap-3">
              <Input
                placeholder="Dataset name (e.g., baseline_v1)"
                value={newDatasetName}
                onChange={(e) => setNewDatasetName(e.target.value)}
                className="max-w-xs"
              />
              <Button onClick={handleSaveAsDataset} disabled={isSaving || !newDatasetName.trim()}>
                {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save Dataset
              </Button>
            </div>
          </div>

          {/* Saved Datasets */}
          {savedDatasets.length > 0 && (
            <div className="border-t pt-6">
              <Label className="text-sm font-medium mb-3 block">Saved Test Datasets</Label>
              <div className="space-y-2">
                {savedDatasets.map((dataset) => (
                  <div
                    key={dataset.name}
                    className="flex items-center justify-between p-3 border rounded-lg bg-muted/30"
                  >
                    <div className="flex items-center gap-3">
                      <FolderOpen className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">{dataset.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(dataset.created_at).toLocaleDateString()} · {formatBytes(dataset.size)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleLoadDataset(dataset.name)}
                        disabled={loadingDataset === dataset.name}
                      >
                        {loadingDataset === dataset.name ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <RotateCcw className="h-4 w-4" />
                        )}
                        <span className="ml-1">Load</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteDataset(dataset.name)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Clear Data Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            Clear Test Data
          </CardTitle>
          <CardDescription>
            Select tables to clear. This action cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Select Tables to Clear</h3>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={selectAll}>Select All</Button>
              <Button variant="ghost" size="sm" onClick={clearSelection}>Clear Selection</Button>
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
                  <Label htmlFor={table.id} className="font-medium cursor-pointer">{table.label}</Label>
                  <p className="text-xs text-muted-foreground">{table.description}</p>
                </div>
              </div>
            ))}
          </div>

          <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={selectedTables.length === 0} className="mt-4">
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
                  {isClearing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  Clear Data
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
