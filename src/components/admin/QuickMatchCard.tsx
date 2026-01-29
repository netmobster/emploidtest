import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Zap, 
  Loader2, 
  Search, 
  User, 
  Building2,
  CheckCircle,
} from "lucide-react";
import { TEST_EMPLOYER_ID, TEST_CANDIDATE_ID } from "@/lib/gameData";
import { useNavigate } from "react-router-dom";

interface Profile {
  user_id: string;
  full_name: string | null;
  company_name: string | null;
  avatar_url: string | null;
  user_type: string;
  email: string | null;
}

interface QuickMatchCardProps {
  testUserType: "employer" | "candidate";
  onMatchCreated?: () => void;
}

export function QuickMatchCard({ testUserType, onMatchCreated }: QuickMatchCardProps) {
  const navigate = useNavigate();
  const [users, setUsers] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMatching, setIsMatching] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Fetch users of the opposite type
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const targetType = testUserType === "employer" ? "candidate" : "employer";
        const { data, error } = await supabase
          .from("profiles")
          .select("user_id, full_name, company_name, avatar_url, user_type, email")
          .eq("user_type", targetType)
          .order("created_at", { ascending: false })
          .limit(50);

        if (error) throw error;
        
        // Filter out test users
        const realUsers = (data || []).filter(
          (u) => u.user_id !== TEST_EMPLOYER_ID && u.user_id !== TEST_CANDIDATE_ID
        );
        setUsers(realUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [testUserType]);

  const handleQuickMatch = async (targetUser: Profile) => {
    setIsMatching(targetUser.user_id);
    try {
      const candidateId = testUserType === "employer" ? targetUser.user_id : TEST_CANDIDATE_ID;
      const employerId = testUserType === "employer" ? TEST_EMPLOYER_ID : targetUser.user_id;

      const { data, error } = await supabase.functions.invoke("force-match", {
        body: { candidateId, employerId },
      });

      if (error) throw error;

      if (data.error) {
        toast.error(data.error);
        return;
      }

      if (data.alreadyExisted) {
        toast.info("Match already exists", {
          action: {
            label: "Open Chat",
            onClick: () => navigate(`/chat/${data.matchId}`),
          },
        });
      } else {
        toast.success(`Matched with ${targetUser.full_name || targetUser.company_name}`, {
          action: {
            label: "Open Chat",
            onClick: () => navigate(`/chat/${data.matchId}`),
          },
        });
      }

      onMatchCreated?.();
    } catch (error) {
      console.error("Error creating quick match:", error);
      toast.error("Failed to create match");
    } finally {
      setIsMatching(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const searchLower = search.toLowerCase();
    return (
      u.full_name?.toLowerCase().includes(searchLower) ||
      u.company_name?.toLowerCase().includes(searchLower) ||
      u.email?.toLowerCase().includes(searchLower)
    );
  });

  const targetTypeLabel = testUserType === "employer" ? "candidate" : "employer";

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Zap className="h-4 w-4 text-yellow-500" />
          Quick Match
        </CardTitle>
        <CardDescription className="text-xs">
          Instantly match test {testUserType} with a real {targetTypeLabel}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder={`Search ${targetTypeLabel}s...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">
            No {targetTypeLabel}s found
          </p>
        ) : (
          <ScrollArea className="h-[200px]">
            <div className="space-y-1.5">
              {filteredUsers.slice(0, 10).map((user) => (
                <div
                  key={user.user_id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={user.avatar_url || undefined} />
                      <AvatarFallback>
                        {user.user_type === "employer" ? (
                          <Building2 className="h-3.5 w-3.5" />
                        ) : (
                          <User className="h-3.5 w-3.5" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {user.user_type === "employer" 
                          ? user.company_name || user.full_name 
                          : user.full_name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2"
                    onClick={() => handleQuickMatch(user)}
                    disabled={isMatching === user.user_id}
                  >
                    {isMatching === user.user_id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Zap className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
