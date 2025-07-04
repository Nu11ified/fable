"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
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
import { DynamicBlockNoteEditor } from "@/components/ui/dynamic-blocknote-editor";
import { useAutoSave, type BlogDraft } from "@/hooks/use-auto-save";
import { api } from "@/trpc/react";
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  AlertCircle, 
  Clock, 
  CheckCircle2,
  Trash2
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import type { Block } from "@blocknote/core";

export default function BlogEditorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const postId = searchParams.get("id");
  const utils = api.useUtils();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState<Block[]>([]);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const { data: existingPost, isLoading: isLoadingPost } = api.admin.blog.getById.useQuery(
    { id: parseInt(postId ?? "0") },
    {
      enabled: !!postId && !isNaN(parseInt(postId)),
    }
  );
  
  const { data: filesList } = api.admin.githubStorage.listFiles.useQuery();

  // Draft state for auto-save
  const [draft, setDraft] = useState<BlogDraft>({
    id: postId ? parseInt(postId) : undefined,
    title: "",
    content: [],
    lastSaved: new Date(),
    isNew: !postId,
  });

  // Auto-save hook
  const { saveDraft: _saveDraft, loadDraft, clearDraft } = useAutoSave(
    draft,
    (savedDraft) => {
      // Only show auto-save notifications for actual user changes, not initial loads
      if (!isInitialLoad && hasUnsavedChanges) {
        setLastSaved(savedDraft.lastSaved);
        setHasUnsavedChanges(false);
        toast.success("Draft saved automatically", {
          duration: 2000,
          className: "text-sm",
        });
        console.log("Draft auto-saved:", savedDraft);
      }
    }
  );

  // Mutations
  const addPost = api.admin.blog.add.useMutation({
    onSuccess: async (_result) => {
      await utils.admin.blog.invalidate();
      clearDraft(draft.id);
      toast.success("Post published successfully!");
      router.push("/admin/blog");
    },
    onError: (error) => {
      toast.error("Failed to publish post: " + error.message);
    },
  });

  const updatePost = api.admin.blog.update.useMutation({
    onSuccess: async () => {
      await utils.admin.blog.invalidate();
      clearDraft(draft.id);
      toast.success("Post updated successfully!");
      router.push("/admin/blog");
    },
    onError: (error) => {
      toast.error("Failed to update post: " + error.message);
    },
  });

  // Load existing post or draft on mount
  useEffect(() => {
    // Don't do anything while loading
    if (isLoadingPost) return;

    if (postId && existingPost) {
      console.log("Loading existing post:", existingPost);
      const postContent = existingPost.content as Block[];
      
      // Clear any existing drafts for this post to avoid conflicts
      clearDraft(existingPost.id);
      
      setTitle(existingPost.title);
      setContent(postContent);
      setDraft({
        id: existingPost.id,
        title: existingPost.title,
        content: postContent,
        lastSaved: new Date(),
        isNew: false,
      });
      setHasUnsavedChanges(false); // Reset unsaved changes for existing post
      setIsInitialLoad(false); // Mark initial load as complete
      toast.success("Post loaded successfully", {
        duration: 2000,
      });
      return;
    }

    // Try to load draft from localStorage if no existing post
    const savedDraft = loadDraft(postId ? parseInt(postId) : undefined);
    if (savedDraft) {
      console.log("Loading saved draft:", savedDraft);
      setTitle(savedDraft.title);
      setContent(savedDraft.content);
      setDraft(savedDraft);
      setLastSaved(savedDraft.lastSaved);
      setHasUnsavedChanges(false); // Reset unsaved changes for draft
      setIsInitialLoad(false); // Mark initial load as complete
      toast.info("Draft recovered from previous session", {
        duration: 3000,
      });
    } else {
      // No existing post or draft, just mark initial load as complete
      setIsInitialLoad(false);
    }
  }, [postId, existingPost, loadDraft, isLoadingPost, clearDraft]);

  // Update draft when title or content changes (only after initial load)
  useEffect(() => {
    // Don't mark as unsaved during initial load
    if (isInitialLoad) return;
    
    console.log("Content changed by user, updating draft:", { title, contentLength: content.length });
    setDraft(prev => ({
      ...prev,
      title,
      content,
    }));
    setHasUnsavedChanges(true);
  }, [title, content, isInitialLoad]);

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  }, []);

  const handleContentChange = useCallback((newContent: Block[]) => {
    setContent(newContent);
  }, []);

  const handlePublish = useCallback(async () => {
    if (!title.trim()) {
      toast.error("Please enter a title for your post");
      return;
    }

    if (!content || content.length === 0) {
      toast.error("Please add some content to your post");
      return;
    }

    setIsPublishing(true);

    try {
      if (postId) {
        await updatePost.mutateAsync({
          id: parseInt(postId),
          title: title.trim(),
          content,
        });
      } else {
        await addPost.mutateAsync({
          title: title.trim(),
          content,
        });
      }
    } catch (_error) {
      // Error handling is done in the mutation onError
    } finally {
      setIsPublishing(false);
    }
  }, [title, content, postId, addPost, updatePost]);

  const handleDiscard = useCallback(() => {
    clearDraft(draft.id);
    router.push("/admin/blog");
  }, [clearDraft, draft.id, router]);

  const handleGoBack = useCallback(() => {
    if (hasUnsavedChanges || title.trim() || content.length > 0) {
      setShowDiscardDialog(true);
    } else {
      router.push("/admin/blog");
    }
  }, [hasUnsavedChanges, title, content, router]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleGoBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Posts
            </Button>
            
            <div className="h-6 w-px bg-border" />
            
            <div>
              <h1 className="text-lg font-semibold">
                {postId ? "Edit Post" : "New Post"}
              </h1>
              {lastSaved && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  {hasUnsavedChanges ? (
                    <>
                      <Clock className="h-3 w-3" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-3 w-3 text-green-600" />
                      Saved {format(lastSaved, "HH:mm")}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              disabled={!title.trim() || content.length === 0}
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            
            <Button 
              onClick={handlePublish}
              disabled={isPublishing || !title.trim() || content.length === 0}
              size="sm"
            >
              <Save className="h-4 w-4 mr-2" />
              {isPublishing ? "Publishing..." : (postId ? "Update" : "Publish")}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl p-6">
        {isLoadingPost ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading post...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Title Input */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">
                Post Title
              </Label>
              <Input
                id="title"
                placeholder="Enter your post title..."
                value={title}
                onChange={handleTitleChange}
                className="text-2xl font-bold border-0 px-0 focus-visible:ring-0 placeholder:text-muted-foreground/50"
                style={{ fontSize: "2rem", lineHeight: "2.5rem" }}
              />
            </div>

            {/* Content Editor */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Content</Label>
              <div className="rounded-lg border bg-card">
                <DynamicBlockNoteEditor
                  key={`editor-${postId}-${isInitialLoad}`} // Force re-render when content changes
                  content={content}
                  onChange={handleContentChange}
                  availableImages={filesList?.files}
                  placeholder="Start writing your blog post..."
                />
              </div>
            </div>

            {/* Draft Info Card */}
            {lastSaved && (
              <Card className="border-dashed">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Draft automatically saved at {format(lastSaved, "MMM d, yyyy 'at' HH:mm")}
                      </span>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowDiscardDialog(true)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Discard Draft
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Discard Confirmation Dialog */}
      <AlertDialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to discard them and go back?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDiscard}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Discard Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 