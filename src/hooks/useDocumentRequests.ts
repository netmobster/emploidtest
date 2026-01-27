import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type DocumentType = "resume" | "portfolio" | "cover_letter" | "references" | "other";
export type RequestStatus = "pending" | "uploaded" | "rejected";

interface DocumentRequest {
  id: string;
  match_id: string;
  requester_id: string;
  document_type: DocumentType;
  custom_label: string | null;
  status: RequestStatus;
  file_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const useDocumentRequests = (matchId: string) => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<DocumentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch document requests for match
  useEffect(() => {
    if (!matchId || !user) return;

    const fetchRequests = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("document_requests")
          .select("*")
          .eq("match_id", matchId)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setRequests((data || []) as DocumentRequest[]);
      } catch (error) {
        console.error("Error fetching document requests:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();

    // Subscribe to changes
    const channel = supabase
      .channel(`document-requests-${matchId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "document_requests",
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setRequests((prev) => [payload.new as DocumentRequest, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setRequests((prev) =>
              prev.map((req) =>
                req.id === payload.new.id ? (payload.new as DocumentRequest) : req
              )
            );
          } else if (payload.eventType === "DELETE") {
            setRequests((prev) =>
              prev.filter((req) => req.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId, user]);

  const requestDocument = useCallback(
    async (
      documentType: DocumentType,
      customLabel?: string,
      notes?: string
    ) => {
      if (!user || !matchId) return false;

      setIsSaving(true);
      try {
        const { error } = await supabase.from("document_requests").insert({
          match_id: matchId,
          requester_id: user.id,
          document_type: documentType,
          custom_label: customLabel || null,
          notes: notes || null,
          status: "pending",
        });

        if (error) throw error;

        toast.success("Document request sent");
        return true;
      } catch (error) {
        console.error("Error requesting document:", error);
        toast.error("Failed to send document request");
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [user, matchId]
  );

  const uploadDocument = useCallback(
    async (requestId: string, file: File) => {
      if (!user || !matchId) return false;

      setIsSaving(true);
      try {
        // Upload to storage
        const fileExt = file.name.split(".").pop();
        const filePath = `${user.id}/${requestId}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("candidate-documents")
          .upload(filePath, file, { upsert: true });

        if (uploadError) throw uploadError;

        // Get signed URL for private bucket (valid for 1 hour)
        const { data: signedUrlData, error: signedUrlError } = await supabase.storage
          .from("candidate-documents")
          .createSignedUrl(filePath, 3600); // 1 hour expiry

        if (signedUrlError) throw signedUrlError;

        // Store the path (not the signed URL) so we can regenerate signed URLs
        // We'll store it in a special format: path::{filePath}
        const storedUrl = `path::${filePath}`;

        // Update request with storage path
        const { error: updateError } = await supabase
          .from("document_requests")
          .update({
            status: "uploaded",
            file_url: storedUrl,
          })
          .eq("id", requestId);

        if (updateError) throw updateError;

        toast.success("Document uploaded");
        return true;
      } catch (error) {
        console.error("Error uploading document:", error);
        toast.error("Failed to upload document");
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [user, matchId]
  );

  // Helper to get a signed URL from stored path
  const getSignedUrl = useCallback(
    async (storedUrl: string): Promise<string | null> => {
      if (!storedUrl) return null;
      
      // Check if it's our path format
      if (storedUrl.startsWith("path::")) {
        const filePath = storedUrl.replace("path::", "");
        const { data, error } = await supabase.storage
          .from("candidate-documents")
          .createSignedUrl(filePath, 3600);
        
        if (error) {
          console.error("Error generating signed URL:", error);
          return null;
        }
        return data.signedUrl;
      }
      
      // Legacy: return as-is if it's already a URL
      return storedUrl;
    },
    []
  );

  const updateRequestStatus = useCallback(
    async (requestId: string, status: RequestStatus) => {
      if (!user) return false;

      setIsSaving(true);
      try {
        const { error } = await supabase
          .from("document_requests")
          .update({ status })
          .eq("id", requestId);

        if (error) throw error;

        toast.success(`Request ${status}`);
        return true;
      } catch (error) {
        console.error("Error updating request:", error);
        toast.error("Failed to update request");
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [user]
  );

  return {
    requests,
    isLoading,
    isSaving,
    requestDocument,
    uploadDocument,
    updateRequestStatus,
    getSignedUrl,
  };
};
