"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { api } from "@/trpc/react";
import { Edit, Plus, Trash2, Star, StarOff, Lock, Unlock, PenTool, Clock, FileText } from "lucide-react";
import { format } from "date-fns";
import { useAutoSave, type BlogDraft } from "@/hooks/use-auto-save";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

type BlogPostFromAPI = {
  id: number;
  title: string;
  content: unknown;
  authorId: string;
  isLocked: boolean;
  isStarred: boolean;
  createdAt: Date;
  updatedAt?: Date | null;
};

export function BlogManager() {
  const router = useRouter();
  const { data: blogPosts, isLoading, error } = api.admin.blog.getAll.useQuery();
  const utils = api.useUtils();
  const [drafts, setDrafts] = useState<BlogDraft[]>([]);
  const { getAllDrafts, clearDraft } = useAutoSave({
    title: "",
    content: [],
    lastSaved: new Date(),
    isNew: true,
  });

  // Load drafts on mount
  useEffect(() => {
    const savedDrafts = getAllDrafts();
    setDrafts(savedDrafts);
  }, [getAllDrafts]);

  // addPost and updatePost mutations are now handled in the editor page

  const deletePost = api.admin.blog.delete.useMutation({
    onSuccess: async () => {
      await utils.admin.blog.invalidate();
      toast.success("Post deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete post: " + error.message);
    },
  });

  const starPost = api.admin.blog.star.useMutation({
    onSuccess: async () => {
      await utils.admin.blog.invalidate();
      toast.success("Post starred");
    },
  });

  const unstarPost = api.admin.blog.unstar.useMutation({
    onSuccess: async () => {
      await utils.admin.blog.invalidate();
      toast.success("Post unstarred");
    },
  });

  const lockPost = api.admin.blog.lock.useMutation({
    onSuccess: async () => {
      await utils.admin.blog.invalidate();
      toast.success("Post locked");
    },
  });

  const unlockPost = api.admin.blog.unlock.useMutation({
    onSuccess: async () => {
      await utils.admin.blog.invalidate();
      toast.success("Post unlocked");
    },
  });

  // BlogForm is no longer needed since we use the dedicated editor page

  const handleCreateNew = () => {
    router.push("/admin/blog/editor");
  };

  const handleEditPost = (post: BlogPostFromAPI) => {
    router.push(`/admin/blog/editor?id=${post.id}`);
  };

  const handleDeletePost = (post: BlogPostFromAPI) => {
    deletePost.mutate({ id: post.id });
  };

  const handleStarPost = (post: BlogPostFromAPI) => {
    if (post.isStarred) {
      unstarPost.mutate({ id: post.id });
    } else {
      starPost.mutate({ id: post.id });
    }
  };

  const handleLockPost = (post: BlogPostFromAPI) => {
    if (post.isLocked) {
      unlockPost.mutate({ id: post.id });
    } else {
      lockPost.mutate({ id: post.id });
    }
  };

  const handleContinueDraft = (draft: BlogDraft) => {
    if (draft.id) {
      router.push(`/admin/blog/editor?id=${draft.id}`);
    } else {
      router.push("/admin/blog/editor");
    }
  };

  const handleDeleteDraft = (draft: BlogDraft) => {
    clearDraft(draft.id);
    const updatedDrafts = getAllDrafts();
    setDrafts(updatedDrafts);
    toast.success("Draft deleted");
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold">Blog Posts</h3>
            <p className="text-muted-foreground">Manage your blog content</p>
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold">Blog Posts</h3>
            <p className="text-muted-foreground">Manage your blog content</p>
          </div>
          <Button onClick={handleCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            New Post
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              Failed to load blog posts. Please try refreshing the page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const sortedPosts = blogPosts ? [...blogPosts].sort((a, b) => {
    if (a.isStarred && !b.isStarred) return -1;
    if (!a.isStarred && b.isStarred) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  }) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground">
          </p>
        </div>
        <Button onClick={handleCreateNew} size="lg">
          <PenTool className="h-4 w-4 mr-2" />
          Write New Post
        </Button>
      </div>

      {/* Drafts Section */}
      {drafts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <h4 className="text-lg font-semibold">Draft Posts</h4>
            <Badge variant="secondary">{drafts.length}</Badge>
          </div>
          
          <div className="grid gap-3">
            {drafts.map((draft) => (
              <Card key={`draft-${draft.id ?? 'new'}`} className="border-dashed border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-950/20">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="h-4 w-4 text-orange-600" />
                                                 <h5 className="font-medium truncate">
                           {draft.title ?? "Untitled Draft"}
                         </h5>
                        <Badge variant="outline" className="text-orange-600 border-orange-600">
                          Draft
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Last saved {format(draft.lastSaved, "MMM d, yyyy 'at' HH:mm")}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleContinueDraft(draft)}
                      >
                        Continue Writing
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete draft?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete this draft. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeleteDraft(draft)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete Draft
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Published Posts Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h4 className="text-lg font-semibold">Published Posts</h4>
          {sortedPosts.length > 0 && (
            <Badge variant="secondary">{sortedPosts.length}</Badge>
          )}
        </div>

        {sortedPosts.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h5 className="text-lg font-medium mb-2">No posts yet</h5>
              <p className="text-sm text-muted-foreground mb-4">
                Start creating amazing content for your blog
              </p>
              <Button onClick={handleCreateNew}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Post
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {sortedPosts.map((post) => (
              <Card key={post.id} className="group hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="font-semibold truncate">{post.title}</h5>
                        {post.isStarred && (
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        )}
                        {post.isLocked && (
                          <Lock className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Created {format(post.createdAt, "MMM d, yyyy")}</span>
                        {post.updatedAt && (
                          <span>Updated {format(post.updatedAt, "MMM d, yyyy")}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditPost(post)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStarPost(post)}
                      >
                        {post.isStarred ? (
                          <StarOff className="h-4 w-4" />
                        ) : (
                          <Star className="h-4 w-4" />
                        )}
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLockPost(post)}
                      >
                        {post.isLocked ? (
                          <Unlock className="h-4 w-4" />
                        ) : (
                          <Lock className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete post?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete &quot;{post.title}&quot;. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDeletePost(post)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete Post
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 