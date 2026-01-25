import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardList, ExternalLink, Copy, Check, Lock } from "lucide-react";
import { toast } from "sonner";

const BASE_URL = "https://emploidtest.lovable.app";

interface ReviewLink {
  label: string;
  path: string;
  description: string;
  requiresAuth?: boolean;
}

const reviewLinks: ReviewLink[] = [
  {
    label: "Auth (Candidate)",
    path: "/auth?type=candidate",
    description: "Initial sign-in page for candidates",
  },
  {
    label: "Auth (Employer)",
    path: "/auth?type=employer",
    description: "Initial sign-in page for employers",
  },
  {
    label: "Welcome Screen",
    path: "/welcome",
    description: "Post-OAuth welcome screen",
    requiresAuth: true,
  },
  {
    label: "Public Home",
    path: "/public-home",
    description: "Marketing homepage for logged-in users",
    requiresAuth: true,
  },
  {
    label: "Tour Debug Panel",
    path: "/employer-dashboard?tourDebug=1",
    description: "Dashboard with tour debug overlay",
    requiresAuth: true,
  },
];

export function ManualReviewCard() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = async (path: string, index: number) => {
    const fullUrl = `${BASE_URL}${path}`;
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopiedIndex(index);
      toast.success("URL copied to clipboard");
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      toast.error("Failed to copy URL");
    }
  };

  const openLink = (path: string) => {
    window.open(`${BASE_URL}${path}`, "_blank");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-cyan-500/10 text-cyan-500">
            <ClipboardList className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg">Manual Review</CardTitle>
            <CardDescription>Quick links for QA and manual testing</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {reviewLinks.map((link, index) => (
            <div
              key={link.path}
              className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">{link.label}</span>
                  {link.requiresAuth && (
                    <Lock className="h-3 w-3 text-muted-foreground" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {link.description}
                </p>
              </div>
              <div className="flex items-center gap-1 ml-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => copyToClipboard(link.path, index)}
                >
                  {copiedIndex === index ? (
                    <Check className="h-4 w-4 text-success" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => openLink(link.path)}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
