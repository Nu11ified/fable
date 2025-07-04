import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "@/trpc/server";
import {
  FileText,
  MessageSquare,
  Package,
  Users,
} from "lucide-react";
import Link from "next/link";
import { use } from "react";

export default function AdminPage() {
  const blogPosts = use(api.admin.blog.getAll());
  const portfolioProjects = use(api.admin.portfolio.getAll());
  const resumeData = use(api.admin.resume.getAll());
  const users = use(api.admin.user.getAll({ page: 1, limit: 100 }));
  const comments = use(api.admin.comments.getAll({ page: 1, limit: 100 }));

  const stats = [
    {
      title: "Blog Posts",
      value: blogPosts.length,
      description: "published posts",
      href: "/admin/blog",
      icon: FileText,
    },
    {
      title: "Portfolio",
      value: portfolioProjects.length,
      description: "projects",
      href: "/admin/portfolio",
      icon: Package,
    },
    {
      title: "Resume",
      value: resumeData.experience.length,
      description: "experiences",
      href: "/admin/resume",
      icon: FileText,
    },
    {
      title: "Users",
      value: users.items.length,
      description: "registered users",
      href: "/admin/user",
      icon: Users,
    },
    {
      title: "Comments",
      value: comments.items.length,
      description: "total comments",
      href: "/admin/comments",
      icon: MessageSquare,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Overview of your website&apos;s content and activity
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Link href={stat.href} key={stat.title} className="block">
            <Card className="transition-all hover:shadow-md hover:bg-accent/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
