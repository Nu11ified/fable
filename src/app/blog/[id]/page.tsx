import { api, HydrateClient } from "@/trpc/server";
import BlogDetail from "./_components/blog-detail";

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const postId = Number(id);
  // Prefetch the individual blog post for client-side hydration
  await api.public.blog.getById.prefetch({ id: postId });

  return (
    <HydrateClient>
      <BlogDetail id={postId} />
    </HydrateClient>
  );
} 