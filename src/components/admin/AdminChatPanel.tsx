import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { 
  MessageSquare, 
  Send, 
  Loader2, 
  User, 
  Briefcase, 
  RefreshCw,
  ArrowRight,
  Clock,
  Wifi,
  WifiOff,
} from "lucide-react";
import { TEST_EMPLOYER_ID, TEST_CANDIDATE_ID } from "@/lib/gameData";
import { formatDistanceToNow } from "date-fns";
import { QuickMatchCard } from "./QuickMatchCard";

interface Match {
  id: string;
  candidate_id: string;
  employer_id: string;
  matched_at: string;
  status: string | null;
  job_id: string | null;
  candidate_profile?: {
    full_name: string | null;
    avatar_url: string | null;
    user_type: string;
  };
  employer_profile?: {
    full_name: string | null;
    company_name: string | null;
    avatar_url: string | null;
    user_type: string;
  };
  job?: {
    title: string;
    company: string;
  };
  last_message?: {
    content: string;
    created_at: string;
    sender_id: string;
  };
  unread_count?: number;
}

interface Message {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
}

export function AdminChatPanel() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [activeTab, setActiveTab] = useState<"employer" | "candidate">("employer");
  const [channelStatus, setChannelStatus] = useState<"connected" | "disconnected">("disconnected");
  const scrollRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Fetch matches involving test users
  const fetchMatches = useCallback(async () => {
    setIsLoading(true);
    try {
      // First get all matches involving test users
      const { data: matchesData, error: matchesError } = await supabase
        .from("matches")
        .select("*")
        .or(`candidate_id.eq.${TEST_CANDIDATE_ID},employer_id.eq.${TEST_EMPLOYER_ID}`)
        .order("matched_at", { ascending: false });

      if (matchesError) throw matchesError;

      // Now enrich with profile data
      const enrichedMatches: Match[] = await Promise.all(
        (matchesData || []).map(async (match) => {
          // Fetch candidate profile
          const { data: candidateProfile } = await supabase
            .from("profiles")
            .select("full_name, avatar_url, user_type")
            .eq("user_id", match.candidate_id)
            .single();

          // Fetch employer profile
          const { data: employerProfile } = await supabase
            .from("profiles")
            .select("full_name, company_name, avatar_url, user_type")
            .eq("user_id", match.employer_id)
            .single();

          // Fetch job info if available
          let jobInfo = null;
          if (match.job_id) {
            const { data: job } = await supabase
              .from("jobs")
              .select("title, company")
              .eq("id", match.job_id)
              .single();
            jobInfo = job;
          }

          // Fetch last message
          const { data: lastMessage } = await supabase
            .from("messages")
            .select("content, created_at, sender_id")
            .eq("match_id", match.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          // Count unread messages (messages not from test users that are unread)
          const testUserId = match.candidate_id === TEST_CANDIDATE_ID ? TEST_CANDIDATE_ID : TEST_EMPLOYER_ID;
          const { count: unreadCount } = await supabase
            .from("messages")
            .select("*", { count: "exact", head: true })
            .eq("match_id", match.id)
            .neq("sender_id", testUserId)
            .is("read_at", null);

          return {
            ...match,
            candidate_profile: candidateProfile || undefined,
            employer_profile: employerProfile || undefined,
            job: jobInfo || undefined,
            last_message: lastMessage || undefined,
            unread_count: unreadCount || 0,
          };
        })
      );

      setMatches(enrichedMatches);
    } catch (error) {
      console.error("Error fetching matches:", error);
      toast.error("Failed to load test user chats");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  // Fetch messages for selected match
  const fetchMessages = useCallback(async (matchId: string) => {
    setIsLoadingMessages(true);
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("match_id", matchId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load messages");
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    if (selectedMatch) {
      fetchMessages(selectedMatch.id);
      
      // Set up realtime subscription for messages
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      
      const channel = supabase
        .channel(`admin-chat-${selectedMatch.id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `match_id=eq.${selectedMatch.id}`,
          },
          (payload) => {
            console.log("[AdminChatPanel] New message via realtime:", payload.new);
            const newMessage = payload.new as Message;
            setMessages((prev) => {
              if (prev.some((m) => m.id === newMessage.id)) return prev;
              return [...prev, newMessage];
            });
          }
        )
        .subscribe((status) => {
          console.log("[AdminChatPanel] Channel status:", status);
          setChannelStatus(status === "SUBSCRIBED" ? "connected" : "disconnected");
        });
      
      channelRef.current = channel;
    }
    
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [selectedMatch, fetchMessages]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Send message as test user
  const sendMessage = async () => {
    if (!inputValue.trim() || !selectedMatch) return;

    setIsSending(true);
    try {
      // Determine which test user to send as
      const senderId = activeTab === "employer" ? TEST_EMPLOYER_ID : TEST_CANDIDATE_ID;

      const { error } = await supabase.from("messages").insert({
        match_id: selectedMatch.id,
        sender_id: senderId,
        content: inputValue.trim(),
      });

      if (error) throw error;

      setInputValue("");
      // Refresh messages
      fetchMessages(selectedMatch.id);
      toast.success(`Message sent as test ${activeTab}`);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Filter matches based on active tab
  const filteredMatches = matches.filter((match) => {
    if (activeTab === "employer") {
      return match.employer_id === TEST_EMPLOYER_ID;
    } else {
      return match.candidate_id === TEST_CANDIDATE_ID;
    }
  });

  const getTestUserId = () => {
    return activeTab === "employer" ? TEST_EMPLOYER_ID : TEST_CANDIDATE_ID;
  };

  const getOtherUserInfo = (match: Match) => {
    if (activeTab === "employer") {
      // Test user is employer, other user is candidate
      return {
        name: match.candidate_profile?.full_name || "Unknown Candidate",
        avatar: match.candidate_profile?.avatar_url,
        type: "candidate",
      };
    } else {
      // Test user is candidate, other user is employer
      return {
        name: match.employer_profile?.company_name || match.employer_profile?.full_name || "Unknown Employer",
        avatar: match.employer_profile?.avatar_url,
        type: "employer",
      };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Test User Chats</h2>
          <p className="text-muted-foreground">
            View and respond as test users to conversations with real users
          </p>
        </div>
        <Button variant="outline" onClick={fetchMatches} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "employer" | "candidate")}>
        <TabsList>
          <TabsTrigger value="employer" className="gap-2">
            <Briefcase className="h-4 w-4" />
            Test Employer
          </TabsTrigger>
          <TabsTrigger value="candidate" className="gap-2">
            <User className="h-4 w-4" />
            Test Candidate
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Chat List */}
            <Card className="lg:col-span-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Conversations</CardTitle>
                <CardDescription>
                  {filteredMatches.length} active chat{filteredMatches.length !== 1 ? "s" : ""}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredMatches.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No conversations found</p>
                    <p className="text-sm">Match with real users to start testing</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px]">
                    {filteredMatches.map((match) => {
                      const otherUser = getOtherUserInfo(match);
                      const isSelected = selectedMatch?.id === match.id;
                      
                      return (
                        <div
                          key={match.id}
                          className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                            isSelected ? "bg-primary/10 border-l-4 border-l-primary" : ""
                          }`}
                          onClick={() => setSelectedMatch(match)}
                        >
                          <div className="flex items-start gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={otherUser.avatar} />
                              <AvatarFallback>
                                {otherUser.name?.charAt(0) || "?"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="font-medium truncate">{otherUser.name}</p>
                                {match.unread_count && match.unread_count > 0 && (
                                  <Badge variant="default" className="ml-2">
                                    {match.unread_count}
                                  </Badge>
                                )}
                              </div>
                              {match.job && (
                                <p className="text-xs text-muted-foreground truncate">
                                  {match.job.title}
                                </p>
                              )}
                              {match.last_message && (
                                <p className="text-sm text-muted-foreground truncate mt-1">
                                  {match.last_message.sender_id === getTestUserId() ? "You: " : ""}
                                  {match.last_message.content}
                                </p>
                              )}
                              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {formatDistanceToNow(new Date(match.matched_at), { addSuffix: true })}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </ScrollArea>
                )}
              </CardContent>
              
              {/* Quick Match Section */}
              <div className="p-4 border-t">
                <QuickMatchCard 
                  testUserType={activeTab} 
                  onMatchCreated={fetchMatches}
                />
              </div>
            </Card>

            {/* Chat Interface */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2 border-b">
                {selectedMatch ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={getOtherUserInfo(selectedMatch).avatar} />
                        <AvatarFallback>
                          {getOtherUserInfo(selectedMatch).name?.charAt(0) || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">
                          {getOtherUserInfo(selectedMatch).name}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          {selectedMatch.job?.title && (
                            <>
                              <Briefcase className="h-3 w-3" />
                              {selectedMatch.job.title}
                            </>
                          )}
                          <Badge variant="outline" className="ml-2">
                            Responding as Test {activeTab === "employer" ? "Employer" : "Candidate"}
                          </Badge>
                        </CardDescription>
                      </div>
                    </div>
                    {/* Realtime Status Indicator */}
                    <div className="flex items-center gap-1.5">
                      {channelStatus === "connected" ? (
                        <>
                          <Wifi className="h-4 w-4 text-emerald-500" />
                          <span className="text-xs text-emerald-500">Live</span>
                        </>
                      ) : (
                        <>
                          <WifiOff className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">Offline</span>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-4">
                    <ArrowRight className="h-5 w-5 mx-auto mb-2" />
                    <p>Select a conversation to view messages</p>
                  </div>
                )}
              </CardHeader>
              <CardContent className="p-0 flex flex-col h-[500px]">
                {selectedMatch ? (
                  <>
                    {/* Messages */}
                    <ScrollArea ref={scrollRef} className="flex-1 p-4">
                      {isLoadingMessages ? (
                        <div className="flex items-center justify-center h-full">
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                      ) : messages.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                          <div className="text-center">
                            <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>No messages yet</p>
                            <p className="text-sm">Start the conversation!</p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {messages.map((message) => {
                            const isTestUser = message.sender_id === getTestUserId();
                            return (
                              <div
                                key={message.id}
                                className={`flex ${isTestUser ? "justify-end" : "justify-start"}`}
                              >
                                <div
                                  className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                                    isTestUser
                                      ? "bg-primary text-primary-foreground"
                                      : "bg-muted"
                                  }`}
                                >
                                  <p className="text-sm">{message.content}</p>
                                  <p
                                    className={`text-xs mt-1 ${
                                      isTestUser ? "text-primary-foreground/70" : "text-muted-foreground"
                                    }`}
                                  >
                                    {formatTime(message.created_at)}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </ScrollArea>

                    {/* Input */}
                    <div className="p-4 border-t">
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          sendMessage();
                        }}
                        className="flex gap-2"
                      >
                        <Input
                          placeholder={`Message as test ${activeTab}...`}
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          disabled={isSending}
                        />
                        <Button type="submit" disabled={isSending || !inputValue.trim()}>
                          {isSending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                        </Button>
                      </form>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-30" />
                      <p className="text-lg">No chat selected</p>
                      <p className="text-sm">Choose a conversation from the list</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
