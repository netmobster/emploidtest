import { Routes, Route, Navigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { UserManagementPanel } from "@/components/admin/UserManagementPanel";
import { TestDataPanel } from "@/components/admin/TestDataPanel";
import { TestDataEditorPanel } from "@/components/admin/TestDataEditorPanel";
import { AdminChatPanel } from "@/components/admin/AdminChatPanel";
import { ForceMatchPanel } from "@/components/admin/ForceMatchPanel";
import { EmailTemplatePanel } from "@/components/admin/EmailTemplatePanel";
import { BroadcastEmailPanel } from "@/components/admin/BroadcastEmailPanel";
import { ToastConfigPanel } from "@/components/admin/ToastConfigPanel";
import { AnalyticsPanel } from "@/components/admin/AnalyticsPanel";
import { FeatureTogglePanel } from "@/components/admin/FeatureTogglePanel";
import { AuditLogPanel } from "@/components/admin/AuditLogPanel";
import { AdminSettingsPanel } from "@/components/admin/AdminSettingsPanel";
import { DemoModeToggle } from "@/components/admin/DemoModeToggle";
import { AdminMetricsBar } from "@/components/admin/AdminMetricsBar";
import { GrowthTrendline } from "@/components/admin/GrowthTrendline";
import { UnfilledReasonsTable } from "@/components/admin/UnfilledReasonsTable";
import { ManualReviewCard } from "@/components/admin/ManualReviewCard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Database, Mail, BarChart3, ToggleLeft, Shield, FlaskConical, MessageSquare, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
  const navigate = useNavigate();

  const quickLinks = [
    {
      title: "User Management",
      description: "Manage users, roles, and permissions",
      icon: Users,
      path: "/admin/users",
      color: "bg-blue-500/10 text-blue-500",
    },
    {
      title: "Test Data",
      description: "Import, export, or clear test data",
      icon: Database,
      path: "/admin/data",
      color: "bg-green-500/10 text-green-500",
    },
    {
      title: "Data Editor",
      description: "Edit test jobs and candidates directly",
      icon: FlaskConical,
      path: "/admin/editor",
      color: "bg-amber-500/10 text-amber-500",
    },
    {
      title: "Test Chats",
      description: "View and respond as test users",
      icon: MessageSquare,
      path: "/admin/chats",
      color: "bg-cyan-500/10 text-cyan-500",
    },
    {
      title: "Force Match",
      description: "Create matches between any users",
      icon: Zap,
      path: "/admin/force-match",
      color: "bg-yellow-500/10 text-yellow-500",
    },
    {
      title: "Email Templates",
      description: "Customize notification emails",
      icon: Mail,
      path: "/admin/emails",
      color: "bg-purple-500/10 text-purple-500",
    },
    {
      title: "Analytics",
      description: "View app statistics and metrics",
      icon: BarChart3,
      path: "/admin/analytics",
      color: "bg-orange-500/10 text-orange-500",
    },
    {
      title: "Feature Toggles",
      description: "Enable/disable features",
      icon: ToggleLeft,
      path: "/admin/features",
      color: "bg-pink-500/10 text-pink-500",
    },
    {
      title: "Audit Logs",
      description: "View admin activity history",
      icon: Shield,
      path: "/admin/audit",
      color: "bg-red-500/10 text-red-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Manage your application settings and users
        </p>
      </div>

      {/* Demo Mode Toggle */}
      <DemoModeToggle />

      {/* Real-time Metrics Bar */}
      <AdminMetricsBar />

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {quickLinks.map((link) => (
          <Card
            key={link.path}
            className="cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => navigate(link.path)}
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${link.color}`}>
                  <link.icon className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">{link.title}</CardTitle>
                  <CardDescription>{link.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Manual Review Links */}
      <ManualReviewCard />

      {/* Growth Trendline Chart */}
      <GrowthTrendline />

      {/* Failed Match Analysis */}
      <UnfilledReasonsTable />
    </div>
  );
}

export default function Admin() {
  return (
    <AdminLayout requireSuperAdmin>
      <div className="flex min-h-screen bg-background">
        <AdminSidebar />
        <main className="flex-1 p-8">
          <Routes>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<UserManagementPanel />} />
            <Route path="data" element={<TestDataPanel />} />
            <Route path="editor" element={<TestDataEditorPanel />} />
            <Route path="chats" element={<AdminChatPanel />} />
            <Route path="force-match" element={<ForceMatchPanel />} />
            <Route path="emails" element={<EmailTemplatePanel />} />
            <Route path="broadcast" element={<BroadcastEmailPanel />} />
            <Route path="toasts" element={<ToastConfigPanel />} />
            <Route path="analytics" element={<AnalyticsPanel />} />
            <Route path="features" element={<FeatureTogglePanel />} />
            <Route path="audit" element={<AuditLogPanel />} />
            <Route path="settings" element={<AdminSettingsPanel />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </main>
      </div>
    </AdminLayout>
  );
}
