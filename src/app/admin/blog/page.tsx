import { BlogManager } from "./_components/blog-manager";

export default function BlogAdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Blog Management</h2>
        <p className="text-muted-foreground">
          Create, edit, and manage your blog posts with a rich text editor.
        </p>
      </div>
      
      <BlogManager />
    </div>
  );
}
