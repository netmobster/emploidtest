import { Routes, Route, Navigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { UserManagementPanel } from "@/components/admin/UserManagementPanel";
import { TestDataPanel } from "@/components/admin/TestDataPanel";
import { EmailTemplatePanel } from "@/components/admin/EmailTemplatePanel";
import { BroadcastEmailPanel } from "@/components/admin/BroadcastEmailPanel";
import { ToastConfigPanel } from "@/components/admin/ToastConfigPanel";
import { AnalyticsPanel } from "@/components/admin/AnalyticsPanel";
import { FeatureTogglePanel } from "@/components/admin/FeatureTogglePanel";
import { AuditLogPanel } from "@/components/admin/AuditLogPanel";
import { AdminSettingsPanel } from "@/components/admin/AdminSettingsPanel";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Database, Mail, BarChart3, ToggleLeft, Shield } from "lucide-react";
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
