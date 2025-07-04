import { PortfolioProjectsManager } from "./_components/portfolio-projects-manager";

export default function PortfolioPage() {
  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Portfolio Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage your portfolio projects and showcase your work
        </p>
      </div>

      <div className="grid gap-8">
        <PortfolioProjectsManager />
      </div>
    </div>
  );
}
