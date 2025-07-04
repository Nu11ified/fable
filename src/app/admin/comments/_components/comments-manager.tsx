"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { api } from "@/trpc/react";
import { Trash2, Star, StarOff, MessageSquare, Search, ChevronLeft, ChevronRight } from "lucide-react";
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
import Image from "next/image";

type Comment = {
  id: number;
  content: string;
  postId: number;
  userId: string;
  isStarred: boolean;
  createdAt: Date;
  updatedAt?: Date | null;
  author: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
  post: {
    id: number;
    title: string;
    slug: string;
  };
};

export function CommentsManager() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to first page when searching
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, error } = api.admin.comments.getAll.useQuery({
    page,
    limit: 10,
    search: debouncedSearch || undefined,
  });

  const comments = data?.items ?? [];
  const pagination = data?.pagination;
  const utils = api.useUtils();

  const deleteComment = api.admin.comments.delete.useMutation({
    onSuccess: async () => {
      await utils.admin.comments.invalidate();
    },
  });

  const starComment = api.admin.comments.star.useMutation({
    onSuccess: async () => {
      await utils.admin.comments.invalidate();
    },
  });

  const unstarComment = api.admin.comments.unstar.useMutation({
    onSuccess: async () => {
      await utils.admin.comments.invalidate();
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Comments</h3>
        </div>
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-48" />
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
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Comments</h3>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              Failed to load comments. Please try refreshing the page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const sortedComments = comments ? [...comments].sort((a, b) => {
    if (a.isStarred && !b.isStarred) return -1;
    if (!a.isStarred && b.isStarred) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  }) : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Comments</h3>
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          <span className="text-sm text-muted-foreground">
            {pagination?.totalCount ?? 0} total
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search comments, authors, or posts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid gap-4">
        {sortedComments.map((comment) => (
          <Card key={comment.id} className="relative">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    {comment.author?.image && (
                      <Image 
                        src={comment.author.image} 
                        alt={comment.author.name}
                        className="h-6 w-6 rounded-full"
                        width={24}
                        height={24}
                      />
                    )}
                    <span className="font-medium text-sm">{comment.author?.name}</span>
                  </div>
                  {comment.isStarred && (
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (comment.isStarred) {
                        unstarComment.mutate({ id: comment.id });
                      } else {
                        starComment.mutate({ id: comment.id });
                      }
                    }}
                  >
                    {comment.isStarred ? (
                      <StarOff className="h-4 w-4" />
                    ) : (
                      <Star className="h-4 w-4" />
                    )}
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Comment</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this comment? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteComment.mutate({ id: comment.id })}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
                             <div className="text-xs text-muted-foreground">
                 Posted on: <span className="font-medium">{comment.post?.title}</span>
                 <span className="mx-2">•</span>
                 {new Date(comment.createdAt).toLocaleDateString()}
               </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
            </CardContent>
          </Card>
        ))}
        
        {sortedComments.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground text-center">
                {search ? "No comments found matching your search." : "No comments found."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.totalCount)} of{" "}
              {pagination.totalCount} results
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={!pagination.hasPrevPage}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={!pagination.hasNextPage}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 