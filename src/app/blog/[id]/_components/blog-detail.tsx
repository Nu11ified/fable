"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/trpc/react";
import { format } from "date-fns";
import { User, Calendar, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DynamicBlockNoteEditor } from "@/components/ui/dynamic-blocknote-editor";
import type { PartialBlock } from "@blocknote/core";

interface BlogDetailProps {
  id: number;
}

export default function BlogDetail({ id }: BlogDetailProps) {
  const router = useRouter();
  const { data: post, isLoading } = api.public.blog.getById.useQuery({ id });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">Loading post...</div>
      </div>
    );
  }

  if (!post) {
    // If no post found, redirect back to blog listing
    router.push("/blog");
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/blog" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Link>
        </Button>

        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>

        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
          <div className="flex items-center gap-1">
            <User className="h-4 w-4" />
            <span>{post.author.name}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{format(post.createdAt, "MMM d, yyyy")}</span>
          </div>
        </div>

        <div className="prose max-w-none">
          <DynamicBlockNoteEditor content={post.content as PartialBlock[]} editable={false} />
        </div>
      </div>
    </div>
  );
} 