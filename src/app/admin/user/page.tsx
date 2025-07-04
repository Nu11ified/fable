import { UsersManager } from "./_components/users-manager";

export default function UsersPage() {
  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Users Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage users and their permissions across the platform
        </p>
      </div>

      <div className="grid gap-8">
        <UsersManager />
      </div>
    </div>
  );
}
