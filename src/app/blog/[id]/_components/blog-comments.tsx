"use client";

import { useState } from "react";
import { format } from "date-fns";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Send, Trash2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { 
  ContextMenu, 
  ContextMenuContent, 
  ContextMenuItem, 
  ContextMenuTrigger 
} from "@/components/ui/context-menu";
import { env } from "@/env";

interface BlogCommentsProps {
  postId: number;
}

export function BlogComments({ postId }: BlogCommentsProps) {
  const { data: session } = authClient.useSession();
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const utils = api.useContext();

  const { data: comments, isLoading, refetch } = api.public.blog.getComments.useQuery({
    postId,
  });

  const addComment = api.member.comment.add.useMutation({
    onSuccess: async () => {
      setComment("");
      setIsSubmitting(false);
      await utils.public.blog.getComments.invalidate({ postId });
    },
    onError: (error) => {
      console.error("Error adding comment:", error);
      setIsSubmitting(false);
    },
  });

  const deleteComment = api.admin.comments.delete.useMutation({
    onSuccess: async () => {
      await utils.public.blog.getComments.invalidate({ postId });
    },
    onError: (error) => {
      console.error("Error deleting comment:", error);
    },
  });

  const isAdmin = session?.user?.email === env.NEXT_PUBLIC_GITHUB_USER_EMAIL;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || !session?.user) return;

    setIsSubmitting(true);
    addComment.mutate({
      postId,
      content: comment.trim(),
    });
  };

  const handleDeleteComment = (commentId: number) => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      deleteComment.mutate({ id: commentId });
    }
  };

  if (isLoading) {
    return (
      <div className="mt-8">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-5 h-5" />
          <h3 className="text-lg font-semibold">Comments</h3>
        </div>
        <div className="text-center text-muted-foreground">Loading comments...</div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="w-5 h-5" />
        <h3 className="text-lg font-semibold">
          Comments ({comments?.length ?? 0})
        </h3>
      </div>

      {/* Comment Form */}
      {session?.user ? (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Add a comment</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts..."
                className="min-h-[100px]"
                disabled={isSubmitting}
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={!comment.trim() || isSubmitting}
                  className="flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting ? "Posting..." : "Post Comment"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                Sign in to join the conversation
              </p>
              <Button asChild>
                <Link href="/signin">Sign In</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comments List */}
      {comments && comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment) => (
            <ContextMenu key={comment.id}>
              <ContextMenuTrigger>
                <Card className="bg-card/50">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={comment.author.image ?? undefined} />
                        <AvatarFallback>
                          {comment.author.name?.[0]?.toUpperCase() ?? "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">
                            {comment.author.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {format(comment.createdAt, "MMM d, yyyy 'at' h:mm a")}
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </ContextMenuTrigger>
              {isAdmin && (
                <ContextMenuContent>
                  <ContextMenuItem
                    onClick={() => handleDeleteComment(comment.id)}
                    className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Comment
                  </ContextMenuItem>
                </ContextMenuContent>
              )}
            </ContextMenu>
          ))}
        </div>
      ) : (
        <div className="text-center text-muted-foreground py-8">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No comments yet. Be the first to share your thoughts!</p>
        </div>
      )}
    </div>
  );
} 