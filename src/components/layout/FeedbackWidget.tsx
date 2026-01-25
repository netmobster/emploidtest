import { useState } from "react";
import { motion } from "framer-motion";
import { Bug, Lightbulb, MessageSquare, Send, Loader2, CheckCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface FeedbackWidgetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type FeedbackType = "bug_report" | "feature_request" | "general";

const feedbackTypes = [
  {
    value: "bug_report" as FeedbackType,
    label: "Bug Report",
    description: "Something isn't working",
    icon: Bug,
  },
  {
    value: "feature_request" as FeedbackType,
    label: "Feature Request",
    description: "Suggest an improvement",
    icon: Lightbulb,
  },
  {
    value: "general" as FeedbackType,
    label: "General Feedback",
    description: "Share your thoughts",
    icon: MessageSquare,
  },
];

export function FeedbackWidget({ open, onOpenChange }: FeedbackWidgetProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    type: "general" as FeedbackType,
    subject: "",
    details: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Not authenticated",
        description: "Please log in to submit feedback.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.subject.trim() || !formData.details.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("user_feedback").insert({
        user_id: user.id,
        type: formData.type,
        subject: formData.subject.trim(),
        details: formData.details.trim(),
      });

      if (error) throw error;

      setIsSuccess(true);
      
      // Reset after showing success
      setTimeout(() => {
        setIsSuccess(false);
        setFormData({ type: "general", subject: "", details: "" });
        onOpenChange(false);
      }, 2000);

    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast({
        title: "Submission failed",
        description: "Please try again or email us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({ type: "general", subject: "", details: "" });
    setIsSuccess(false);
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) resetForm();
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            Submit Feedback
          </DialogTitle>
          <DialogDescription>
            Help us improve Emploid by sharing your thoughts
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-12 text-center"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Thank you!
            </h3>
            <p className="text-sm text-muted-foreground">
              Your feedback has been submitted successfully.
            </p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 mt-4">
            {/* Feedback Type */}
            <div className="space-y-3">
              <Label>What type of feedback?</Label>
              <RadioGroup
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value as FeedbackType })}
                className="grid grid-cols-3 gap-2"
              >
                {feedbackTypes.map((type) => {
                  const Icon = type.icon;
                  const isSelected = formData.type === type.value;
                  return (
                    <label
                      key={type.value}
                      className={`
                        flex flex-col items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all
                        ${isSelected 
                          ? "border-primary bg-primary/5" 
                          : "border-border hover:border-primary/50"
                        }
                      `}
                    >
                      <RadioGroupItem value={type.value} className="sr-only" />
                      <Icon className={`w-5 h-5 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                      <span className={`text-xs font-medium text-center ${isSelected ? "text-primary" : "text-muted-foreground"}`}>
                        {type.label}
                      </span>
                    </label>
                  );
                })}
              </RadioGroup>
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="Brief description..."
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                maxLength={100}
              />
            </div>

            {/* Details */}
            <div className="space-y-2">
              <Label htmlFor="details">Details</Label>
              <Textarea
                id="details"
                placeholder="Please describe in detail..."
                value={formData.details}
                onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                rows={4}
                maxLength={2000}
              />
              <p className="text-xs text-muted-foreground text-right">
                {formData.details.length}/2000
              </p>
            </div>

            {/* Submit */}
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting || !formData.subject || !formData.details}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Feedback
                </>
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
