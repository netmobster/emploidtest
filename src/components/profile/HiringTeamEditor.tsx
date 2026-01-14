import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Crown, GripVertical } from "lucide-react";
import { useHiringTeam, HiringTeamMember, CreateHiringTeamMemberData } from "@/hooks/useHiringTeam";
import { cn } from "@/lib/utils";

interface HiringTeamEditorProps {
  className?: string;
}

export function HiringTeamEditor({ className }: HiringTeamEditorProps) {
  const { teamMembers, createTeamMember, updateTeamMember, deleteTeamMember, setPrimaryMember } = useHiringTeam();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<HiringTeamMember | null>(null);
  const [formData, setFormData] = useState<CreateHiringTeamMemberData>({
    name: "",
    title: "",
    email: "",
    linkedin_url: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingMember) {
      await updateTeamMember(editingMember.id, formData);
      setEditingMember(null);
    } else {
      await createTeamMember(formData);
    }
    
    setFormData({ name: "", title: "", email: "", linkedin_url: "" });
    setIsAddDialogOpen(false);
  };

  const openEditDialog = (member: HiringTeamMember) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      title: member.title || "",
      email: member.email || "",
      linkedin_url: member.linkedin_url || "",
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to remove this team member?")) {
      await deleteTeamMember(id);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Hiring Team</h3>
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) {
            setEditingMember(null);
            setFormData({ name: "", title: "", email: "", linkedin_url: "" });
          }
        }}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Add Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingMember ? "Edit Team Member" : "Add Team Member"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Smith"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Senior Recruiter"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@company.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn URL</Label>
                <Input
                  id="linkedin"
                  value={formData.linkedin_url}
                  onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                  placeholder="https://linkedin.com/in/johnsmith"
                />
              </div>
              <Button type="submit" className="w-full">
                {editingMember ? "Save Changes" : "Add Team Member"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {teamMembers.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No team members yet.</p>
          <p className="text-sm">Add your hiring team to personalize candidate interactions.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {teamMembers.map((member) => {
            const initials = member.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);

            return (
              <div
                key={member.id}
                className="flex items-center gap-3 p-3 rounded-lg border bg-card"
              >
                <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                
                <Avatar className="w-10 h-10">
                  <AvatarImage src={member.avatar_url || undefined} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{member.name}</span>
                    {member.is_primary && (
                      <Badge variant="secondary" className="text-xs gap-1">
                        <Crown className="w-3 h-3" />
                        Primary
                      </Badge>
                    )}
                  </div>
                  {member.title && (
                    <p className="text-sm text-muted-foreground truncate">{member.title}</p>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {!member.is_primary && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPrimaryMember(member.id)}
                      title="Set as primary contact"
                    >
                      <Crown className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(member)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(member.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
