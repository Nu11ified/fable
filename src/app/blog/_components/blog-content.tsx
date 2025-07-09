"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Clock, 
  ArrowLeft,
  User,
  Star,
  ExternalLink
} from "lucide-react";
import { format } from "date-fns";
import type { PartialBlock } from "@blocknote/core";

export function BlogContent() {
  const { data: blogPosts, isLoading } = api.public.blog.getAll.useQuery();

  /* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unnecessary-type-assertion */
  // Extract a brief snippet from the content JSON (stringified or array)
  const extractSnippet = (post: any): string => {
    let text = "";
    let blocks: any[] = [];
    // Parse JSON string or use array directly
    if (typeof post.content === "string") {
      try {
        blocks = JSON.parse(post.content as string);
      } catch {
        return "";
      }
    } else if (Array.isArray(post.content)) {
      blocks = post.content;
    } else {
      return "";
    }

    const traverse = (node: any): void => {
      if (!node) return;
      if (Array.isArray(node)) {
        node.forEach(traverse);
      } else if (typeof node === "object") {
        if ("text" in node && typeof node.text === "string") {
          text += node.text + " ";
        }
        if ("children" in node && Array.isArray(node.children)) {
          node.children.forEach(traverse);
        }
        if ("content" in node && Array.isArray((node).content)) {
          (node).content.forEach(traverse);
        }
      }
    };
    traverse(blocks);

    const sentences = text.trim().split(/\.\s/);
    const snippet = sentences.slice(0, 2).join(". ");
    return snippet + (sentences.length > 1 && !snippet.endsWith(".") ? "." : "");
  };
  /* eslint-enable @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unnecessary-type-assertion */

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-muted-foreground">Loading blog posts...</p>
        </div>
      </div>
    );
  }

  if (!blogPosts || blogPosts.length === 0) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
              <Link href="/" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>
          
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">No blog posts found</h2>
            <p className="text-muted-foreground">Articles will appear here once they&apos;re published</p>
          </div>
        </div>
      </div>
    );
  }

  // Separate starred and non-starred posts
  const starredPosts = blogPosts.filter(p => p.isStarred);
  const otherPosts = blogPosts.filter(p => !p.isStarred).sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
              <Link href="/" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>
          
          <div className="text-right">
            <h1 className="text-3xl font-bold mb-2">Blog</h1>
            <p className="text-muted-foreground">
              {blogPosts.length} article{blogPosts.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Featured Posts (Starred) */}
        {starredPosts.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Star className="w-5 h-5 text-yellow-500" />
              <h2 className="text-xl font-semibold">Featured Articles</h2>
            </div>
            
            <div className="space-y-6">
              {starredPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Link href={`/blog/${post.id}`}>
                    <Card className="bg-card border-border hover:border-primary transition-all duration-300 group cursor-pointer">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                              <div className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                <span>{post.author.name}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>{format(post.createdAt, "MMM d, yyyy")}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>5 min read</span>
                              </div>
                            </div>
                            
                            <h3 className="text-xl font-semibold mb-3 group-hover:text-blue-400 transition-colors">
                              {post.title}
                            </h3>
                            
                            <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                              {extractSnippet(post)}
                            </p>
                            
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-500">
                                Featured
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <ExternalLink className="w-5 h-5 text-gray-400" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Other Posts */}
        {otherPosts.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-semibold mb-6">
              {starredPosts.length > 0 ? 'All Articles' : 'Recent Articles'}
            </h2>
            
            <div className="space-y-4">
              {otherPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: (starredPosts.length + index) * 0.1 }}
                >
                  <Link href={`/blog/${post.id}`}>
                    <Card className="bg-card border-border hover:border-primary transition-all duration-300 group cursor-pointer">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-400 transition-colors">
                              {post.title}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3" />
                                <span>{format(post.createdAt, "MMM d, yyyy")}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>5 min read</span>
                              </div>
                            </div>
                            <p className="text-muted-foreground text-sm mt-2 line-clamp-2">
                              {extractSnippet(post)}
                            </p>
                          </div>
                          <ExternalLink className="w-5 h-5 text-gray-400" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-center pt-16 border-t border-gray-800 mt-16">
          <Link href="/" className="text-blue-400 hover:text-blue-300 transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
} 