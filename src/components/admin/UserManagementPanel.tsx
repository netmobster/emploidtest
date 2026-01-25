import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Trash2, Eye, AlertTriangle, Users, Shield } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface Profile {
  id: string;
  user_id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  user_type: string;
  created_at: string;
  has_completed_profile: boolean;
}

interface UserRole {
  user_id: string;
  role: string;
}

export function UserManagementPanel() {
  const navigate = useNavigate();
  const { settings, logAuditAction } = useAdminSettings();
  const [users, setUsers] = useState<Profile[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [showPurgeDialog, setShowPurgeDialog] = useState(false);

  const protectedEmails = settings.protected_emails || ["wearecleardigital@gmail.com"];

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      toast.error("Failed to fetch users");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (error) throw error;
      setUserRoles(data || []);
    } catch (err) {
      console.error("Failed to fetch roles:", err);
    }
  };

  const getUserRole = (userId: string): string | null => {
    const role = userRoles.find((r) => r.user_id === userId);
    return role?.role || null;
  };

  const isProtectedUser = (email: string | null): boolean => {
    if (!email) return false;
    return protectedEmails.includes(email.toLowerCase());
  };

  const canDeleteUser = (user: Profile): boolean => {
    if (isProtectedUser(user.email)) return false;
    const role = getUserRole(user.user_id);
    if (role === "super_admin") return false;
    return true;
  };

  const handleDeleteUser = async (userId: string) => {
    const user = users.find((u) => u.user_id === userId);
    if (!user || !canDeleteUser(user)) {
      toast.error("Cannot delete protected user");
      return;
    }

    try {
      // Call the edge function to delete the user (including auth.users)
      const { error } = await supabase.functions.invoke("delete-user", {
        body: { userId },
      });

      if (error) throw error;

      await logAuditAction("user_delete", "user", userId, { email: user.email });
      toast.success("User deleted successfully");
      setDeleteUserId(null);
      fetchUsers();
    } catch (err: any) {
      console.error("Failed to delete user:", err);
      toast.error(err.message || "Failed to delete user");
    }
  };

  const handlePurgeNonSampleUsers = async () => {
    const usersToDelete = users.filter((u) => canDeleteUser(u));

    try {
      for (const user of usersToDelete) {
        await supabase.from("profiles").delete().eq("user_id", user.user_id);
      }

      await logAuditAction("purge_users", "users", null, {
        count: usersToDelete.length,
      });

      toast.success(`Purged ${usersToDelete.length} users`);
      setShowPurgeDialog(false);
      fetchUsers();
    } catch (err) {
      toast.error("Failed to purge users");
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      !searchQuery ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = filterType === "all" || user.user_type === filterType;

    return matchesSearch && matchesType;
  });

  const deletableUsersCount = users.filter((u) => canDeleteUser(u)).length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Management
              </CardTitle>
              <CardDescription>
                Manage all users. Protected users cannot be deleted.
              </CardDescription>
            </div>
            <AlertDialog open={showPurgeDialog} onOpenChange={setShowPurgeDialog}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Purge Non-Sample Users
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-5 w-5" />
                    Confirm User Purge
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete {deletableUsersCount} users. Protected users
                    (super admins and {protectedEmails.join(", ")}) will NOT be deleted.
                    <br />
                    <br />
                    <strong>This action cannot be undone.</strong>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handlePurgeNonSampleUsers}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Purge {deletableUsersCount} Users
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="candidate">Candidates</SelectItem>
                <SelectItem value="employer">Employers</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Users Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Loading users...
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => {
                    const role = getUserRole(user.user_id);
                    const isProtected = isProtectedUser(user.email);
                    const canDelete = canDeleteUser(user);

                    return (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.avatar_url || undefined} />
                              <AvatarFallback>
                                {user.full_name?.charAt(0) || user.email?.charAt(0) || "?"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{user.full_name || "Unnamed"}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.user_type === "employer" ? "default" : "secondary"}>
                            {user.user_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {role ? (
                            <Badge
                              variant="outline"
                              className="bg-primary/10 text-primary border-primary/20"
                            >
                              <Shield className="h-3 w-3 mr-1" />
                              {role}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">user</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {user.has_completed_profile ? (
                            <Badge variant="outline" className="bg-green-500/10 text-green-600">
                              Complete
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600">
                              Incomplete
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(user.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                navigate(
                                  user.user_type === "employer"
                                    ? `/company/${user.user_id}`
                                    : `/candidate/${user.user_id}`
                                )
                              }
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <AlertDialog
                              open={deleteUserId === user.user_id}
                              onOpenChange={(open) => !open && setDeleteUserId(null)}
                            >
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  disabled={!canDelete}
                                  onClick={() => setDeleteUserId(user.user_id)}
                                  className={!canDelete ? "opacity-50 cursor-not-allowed" : ""}
                                >
                                  <Trash2
                                    className={`h-4 w-4 ${canDelete ? "text-destructive" : ""}`}
                                  />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete User</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete {user.full_name || user.email}?
                                    This will also delete all their data (matches, messages, etc.).
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteUser(user.user_id)}
                                    className="bg-destructive text-destructive-foreground"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredUsers.length} of {users.length} users
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
