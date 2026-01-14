import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Loader2, MapPin, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { CITIES, ROLES } from "@/lib/gameData";

interface CreateJobDialogProps {
  onJobCreated?: () => void;
}

export function CreateJobDialog({ onJobCreated }: CreateJobDialogProps) {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    company: "",
    roleId: "",
    cityId: "",
    description: "",
    salary: "",
    remote: false,
    requirements: "",
    benefits: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !formData.title || !formData.roleId || !formData.cityId) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsCreating(true);
    try {
      const { error } = await supabase.from("jobs").insert({
        user_id: user.id,
        title: formData.title,
        company: formData.company || profile?.company_name || "My Company",
        role_id: formData.roleId,
        city_id: formData.cityId,
        description: formData.description || null,
        salary: formData.salary || null,
        remote: formData.remote,
        requirements: formData.requirements
          ? formData.requirements.split(",").map((r) => r.trim()).filter(Boolean)
          : null,
        benefits: formData.benefits
          ? formData.benefits.split(",").map((b) => b.trim()).filter(Boolean)
          : null,
      });

      if (error) throw error;

      toast.success("Job posted successfully!");
      setOpen(false);
      setFormData({
        title: "",
        company: "",
        roleId: "",
        cityId: "",
        description: "",
        salary: "",
        remote: false,
        requirements: "",
        benefits: "",
      });
      onJobCreated?.();
    } catch (error) {
      console.error("Error creating job:", error);
      toast.error("Failed to create job");
    } finally {
      setIsCreating(false);
    }
  };

  // Get unique cities for selector
  const uniqueCities = CITIES;

  // Get roles for the selected city (or all if none selected)
  const availableRoles = formData.cityId
    ? ROLES.filter((r) => r.cityId === formData.cityId)
    : ROLES;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-1" />
          New Job
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Post a New Job</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Job Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Job Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Senior Software Engineer"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          {/* Company */}
          <div className="space-y-2">
            <Label htmlFor="company">Company Name</Label>
            <Input
              id="company"
              placeholder={profile?.company_name || "Your company name"}
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label>Location *</Label>
            <Select
              value={formData.cityId}
              onValueChange={(value) => setFormData({ ...formData, cityId: value, roleId: "" })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a city">
                  {formData.cityId && (
                    <span className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {uniqueCities.find((c) => c.id === formData.cityId)?.name}
                    </span>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {uniqueCities.map((city) => (
                  <SelectItem key={city.id} value={city.id}>
                    <span className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      {city.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Remote Toggle */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Wifi className="w-4 h-4 text-muted-foreground" />
              <Label htmlFor="remote" className="cursor-pointer">
                Remote work available
              </Label>
            </div>
            <Switch
              id="remote"
              checked={formData.remote}
              onCheckedChange={(checked) => setFormData({ ...formData, remote: checked })}
            />
          </div>

          {/* Role Category */}
          <div className="space-y-2">
            <Label>Role Category *</Label>
            <Select
              value={formData.roleId}
              onValueChange={(value) => setFormData({ ...formData, roleId: value })}
              disabled={!formData.cityId}
            >
              <SelectTrigger>
                <SelectValue placeholder={formData.cityId ? "Select a role" : "Select city first"} />
              </SelectTrigger>
              <SelectContent>
                {availableRoles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Salary */}
          <div className="space-y-2">
            <Label htmlFor="salary">Salary Range</Label>
            <Input
              id="salary"
              placeholder="e.g., $120,000 - $150,000"
              value={formData.salary}
              onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Job Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the role, responsibilities, and what you're looking for..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
            />
          </div>

          {/* Requirements */}
          <div className="space-y-2">
            <Label htmlFor="requirements">Requirements (comma separated)</Label>
            <Input
              id="requirements"
              placeholder="e.g., React, TypeScript, 3+ years experience"
              value={formData.requirements}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
            />
          </div>

          {/* Benefits */}
          <div className="space-y-2">
            <Label htmlFor="benefits">Benefits (comma separated)</Label>
            <Input
              id="benefits"
              placeholder="e.g., Health insurance, 401k, Remote work"
              value={formData.benefits}
              onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isCreating || !formData.title || !formData.roleId || !formData.cityId}
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Post Job"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
