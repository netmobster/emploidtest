import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Bell, UserX, Mail, ChevronRight, Loader2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useBlock } from "@/hooks/useBlock";
import { toast } from "sonner";
import { CalendlyUrlInput } from "@/components/interviews/CalendlyUrlInput";
import { QuickQuestionsSettings } from "@/components/settings/QuickQuestionsSettings";
import { ShortlistsSettings } from "@/components/settings/ShortlistsSettings";

interface BlockedUser {
  blocked_id: string;
  created_at: string;
  profile?: {
    full_name: string;
    avatar_url: string | null;
  };
}

const Settings = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { unblockUser } = useBlock();

  // Notification preferences
  const [pushNotifications, setPushNotifications] = useState(true);
  const [messageNotifications, setMessageNotifications] = useState(true);
  const [matchNotifications, setMatchNotifications] = useState(true);

  // Email preferences
  const [emailDigest, setEmailDigest] = useState(true);
  const [digestFrequency, setDigestFrequency] = useState("daily");

  // Blocked users
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [isLoadingBlocked, setIsLoadingBlocked] = useState(true);
  const [userToUnblock, setUserToUnblock] = useState<BlockedUser | null>(null);

  // Fetch blocked users
  useEffect(() => {
    const fetchBlockedUsers = async () => {
      if (!user) return;

      setIsLoadingBlocked(true);
      try {
        const { data, error } = await supabase
          .from("blocked_users")
          .select("blocked_id, created_at")
          .eq("blocker_id", user.id);

        if (error) throw error;

        // Fetch profiles for blocked users
        const enrichedBlocked = await Promise.all(
          (data || []).map(async (blocked) => {
            const { data: profileData } = await supabase
              .from("profiles")
              .select("full_name, avatar_url")
              .eq("user_id", blocked.blocked_id)
              .single();

            return {
              ...blocked,
              profile: profileData || undefined,
            };
          })
        );

        setBlockedUsers(enrichedBlocked);
      } catch (error) {
        console.error("Error fetching blocked users:", error);
      } finally {
        setIsLoadingBlocked(false);
      }
    };

    fetchBlockedUsers();
  }, [user]);

  const handleUnblock = async () => {
    if (!userToUnblock) return;

    const success = await unblockUser(userToUnblock.blocked_id);
    if (success) {
      setBlockedUsers((prev) =>
        prev.filter((u) => u.blocked_id !== userToUnblock.blocked_id)
      );
    }
    setUserToUnblock(null);
  };

  const handleSavePreferences = () => {
    // In a real app, this would save to the database
    toast.success("Preferences saved");
  };

  const getDashboardRoute = () => {
    return profile?.user_type === "employer"
      ? "/employer-dashboard"
      : "/candidate-dashboard";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border"
      >
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(getDashboardRoute())}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold">Settings</h1>
          </div>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
      </motion.header>

      <div className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Notification Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
              </CardTitle>
              <CardDescription>
                Manage how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="push-notifications" className="flex-1">
                  Push Notifications
                  <p className="text-sm text-muted-foreground font-normal">
                    Receive notifications on your device
                  </p>
                </Label>
                <Switch
                  id="push-notifications"
                  checked={pushNotifications}
                  onCheckedChange={setPushNotifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="message-notifications" className="flex-1">
                  New Messages
                  <p className="text-sm text-muted-foreground font-normal">
                    Get notified when you receive a message
                  </p>
                </Label>
                <Switch
                  id="message-notifications"
                  checked={messageNotifications}
                  onCheckedChange={setMessageNotifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="match-notifications" className="flex-1">
                  New Matches
                  <p className="text-sm text-muted-foreground font-normal">
                    Get notified when you have a new match
                  </p>
                </Label>
                <Switch
                  id="match-notifications"
                  checked={matchNotifications}
                  onCheckedChange={setMatchNotifications}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Email Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Email Digest
              </CardTitle>
              <CardDescription>
                Configure your email digest preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="email-digest" className="flex-1">
                  Email Digest
                  <p className="text-sm text-muted-foreground font-normal">
                    Receive a summary of your activity
                  </p>
                </Label>
                <Switch
                  id="email-digest"
                  checked={emailDigest}
                  onCheckedChange={setEmailDigest}
                />
              </div>

              {emailDigest && (
                <div className="space-y-2">
                  <Label htmlFor="digest-frequency">Frequency</Label>
                  <Select
                    value={digestFrequency}
                    onValueChange={setDigestFrequency}
                  >
                    <SelectTrigger id="digest-frequency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Interview Availability - Employers Only */}
        {profile?.user_type === "employer" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <CalendlyUrlInput />
          </motion.div>
        )}

        {/* Quick Questions - Employers Only */}
        {profile?.user_type === "employer" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <QuickQuestionsSettings />
          </motion.div>
        )}

        {/* Shortlists - Employers Only */}
        {profile?.user_type === "employer" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <ShortlistsSettings />
          </motion.div>
        )}

        {/* Blocked Users */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserX className="w-5 h-5" />
                Blocked Users
              </CardTitle>
              <CardDescription>
                Manage users you've blocked
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingBlocked ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : blockedUsers.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  You haven't blocked anyone
                </p>
              ) : (
                <div className="space-y-2">
                  {blockedUsers.map((blocked) => (
                    <div
                      key={blocked.blocked_id}
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-sm font-medium overflow-hidden">
                          {blocked.profile?.avatar_url ? (
                            <img
                              src={blocked.profile.avatar_url}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            blocked.profile?.full_name?.charAt(0) || "?"
                          )}
                        </div>
                        <div>
                          <p className="font-medium">
                            {blocked.profile?.full_name || "Unknown User"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Blocked {new Date(blocked.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setUserToUnblock(blocked)}
                      >
                        Unblock
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Button className="w-full" size="lg" onClick={handleSavePreferences}>
            Save Preferences
          </Button>
        </motion.div>
      </div>

      {/* Unblock Confirmation Dialog */}
      <AlertDialog
        open={!!userToUnblock}
        onOpenChange={() => setUserToUnblock(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Unblock {userToUnblock?.profile?.full_name}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This user will be able to appear in your results and send you
              messages again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleUnblock}>
              Unblock
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Settings;
