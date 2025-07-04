import { api, HydrateClient } from "@/trpc/server";
import BlogDetail from "./_components/blog-detail";

interface BlogPostParams {
  params: { id: string | Promise<string> };
}

export default async function BlogPostPage({ params }: BlogPostParams) {
  const id = await params.id;
  const postId = Number(id);
  // Prefetch the individual blog post for client-side hydration
  await api.public.blog.getById.prefetch({ id: postId });

  return (
    <HydrateClient>
      <BlogDetail id={postId} />
    </HydrateClient>
  );
} 