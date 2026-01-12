import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { useMatches } from "@/hooks/useMatches";
import { useUnmatch } from "@/hooks/useUnmatch";
import { formatDistanceToNow } from "date-fns";

export default function ChatsDropdown() {
  const navigate = useNavigate();
  const { matches, isLoading } = useMatches();
  const { unmatch, isUnmatching } = useUnmatch();
  const [deleteMatchId, setDeleteMatchId] = useState<string | null>(null);

  // Calculate total unread messages
  const totalUnread = matches.reduce((acc, match) => acc + (match.unread_count || 0), 0);

  const handleDeleteChat = async () => {
    if (deleteMatchId) {
      await unmatch(deleteMatchId);
      setDeleteMatchId(null);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <MessageCircle className="w-5 h-5" />
            {totalUnread > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs font-medium rounded-full flex items-center justify-center">
                {totalUnread > 9 ? "9+" : totalUnread}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <div className="px-3 py-2 border-b border-border">
            <h4 className="font-semibold text-foreground">Chats</h4>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : matches.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No chats yet
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {matches.slice(0, 10).map((match) => (
                <DropdownMenuItem
                  key={match.id}
                  className="flex items-center gap-3 p-3 cursor-pointer"
                  onClick={() => navigate(`/chat/${match.id}`)}
                >
                  <Avatar className="w-10 h-10 flex-shrink-0">
                    <AvatarImage src={match.other_user?.avatar_url || undefined} />
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                      {match.other_user?.full_name?.slice(0, 2).toUpperCase() || "??"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground truncate">
                        {match.other_user?.full_name || "Unknown"}
                      </p>
                      {match.unread_count > 0 && (
                        <span className="w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center flex-shrink-0">
                          {match.unread_count}
                        </span>
                      )}
                    </div>
                    {match.last_message && (
                      <p className="text-xs text-muted-foreground truncate">
                        {match.last_message.content}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground/70">
                      {formatDistanceToNow(new Date(match.matched_at), { addSuffix: true })}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 flex-shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteMatchId(match.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </DropdownMenuItem>
              ))}
            </div>
          )}

          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="justify-center text-primary font-medium"
            onClick={() => navigate("/matches")}
          >
            View All Chats
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteMatchId} onOpenChange={() => setDeleteMatchId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this chat?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this match and all messages. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteChat}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isUnmatching}
            >
              {isUnmatching ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
