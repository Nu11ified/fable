"use client";

import { useTheme } from "next-themes";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Dock, DockIcon } from "@/components/magicui/dock";
import { Home, Briefcase, Globe, Mail, Sun, Moon, LogIn, LogOut, Settings } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { authClient } from "@/lib/auth-client";
import { env } from "@/env";

export function MagicDock() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  
  // Don't show dock on admin pages
  if (pathname.startsWith('/admin') || pathname.startsWith('/signin')) {
    return null;
  }

  const dockItems = [
    {
      title: "Home",
      icon: Home,
      href: "/",
      isActive: pathname === "/",
    },
    {
      title: "Portfolio",
      icon: Briefcase,
      href: "/portfolio",
      isActive: pathname.startsWith("/portfolio"),
    },
    {
      title: "Blog",
      icon: Globe,
      href: "/blog",
      isActive: pathname.startsWith("/blog"),
    },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <Dock direction="middle" className="bg-background/80 backdrop-blur-md border shadow-lg">
        {dockItems.map((item) => (
          <Tooltip key={item.title}>
            <TooltipTrigger asChild>
              <DockIcon>
                <Link
                  href={item.href}
                  className={`
                    flex items-center justify-center w-full h-full rounded-full transition-all duration-200
                    ${item.isActive 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }
                  `}
                >
                  <item.icon className="h-5 w-5" />
                </Link>
              </DockIcon>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>{item.title}</p>
            </TooltipContent>
          </Tooltip>
        ))}
        {!session?.user && !isPending && (
          <Tooltip>
            <TooltipTrigger asChild>
              <DockIcon>
                <Link
                  href="/signin"
                  className="flex items-center justify-center w-full h-full rounded-full transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-accent"
                >
                  <LogIn className="h-5 w-5" />
                </Link>
              </DockIcon>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Login</p>
            </TooltipContent>
          </Tooltip>
        )}
        {session?.user && (
          <>
            {session.user.email === env.NEXT_PUBLIC_GITHUB_USER_EMAIL && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <DockIcon>
                    <Link
                      href="/admin"
                      className={`flex items-center justify-center w-full h-full rounded-full transition-all duration-200 ${pathname.startsWith("/admin") ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent'}`}
                    >
                      <Settings className="h-5 w-5" />
                    </Link>
                  </DockIcon>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>Admin</p>
                </TooltipContent>
              </Tooltip>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <DockIcon>
                  <button
                    onClick={async () => {
                      await authClient.signOut({
                        fetchOptions: {
                          onSuccess: () => { router.push("/"); },
                        },
                      });
                    }}
                    className="flex items-center justify-center w-full h-full rounded-full transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-accent"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </DockIcon>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Logout</p>
              </TooltipContent>
            </Tooltip>
          </>
        )}
        <Tooltip>
          <TooltipTrigger asChild>
            <DockIcon>
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="flex items-center justify-center w-full h-full rounded-full transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-accent"
              >
                <Sun className="h-5 w-5 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                <Moon className="absolute h-5 w-5 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                <span className="sr-only">Toggle theme</span>
              </button>
            </DockIcon>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>Toggle Theme</p>
          </TooltipContent>
        </Tooltip>
      </Dock>
    </div>
  );
} 