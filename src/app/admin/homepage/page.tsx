import { HomepageManager } from "./_components/homepage-manager";

export default function HomepageAdminPage() {
  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Homepage Management</h1>
        <p className="text-muted-foreground mt-2">
          Customize your homepage content, design, and layout
        </p>
      </div>

      <div className="grid gap-8">
        <HomepageManager />
      </div>
    </div>
  );
} 