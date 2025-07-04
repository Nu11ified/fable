import { api, HydrateClient } from "@/trpc/server";
import { BlogContent } from "./_components/blog-content";

export default async function BlogPage() {
  // Prefetch blog posts for better performance
  await api.public.blog.getAll.prefetch();

  return (
    <HydrateClient>
      <div className="min-h-screen bg-background">
        <BlogContent />
      </div>
    </HydrateClient>
  );
} 