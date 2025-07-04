import { CommentsManager } from "./_components/comments-manager";

export default function CommentsPage() {
  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Comments Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage and moderate user comments across all blog posts
        </p>
      </div>

      <div className="grid gap-8">
        <CommentsManager />
      </div>
    </div>
  );
}
