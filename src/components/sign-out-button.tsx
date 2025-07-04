"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
        },
      },
    });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className="justify-start hover:bg-red-500/10 hover:text-red-600 dark:hover:bg-red-500/20 dark:hover:text-red-400 transition-colors"
      onClick={handleSignOut}
    >
      <LogOut className="h-4 w-4" />
      <span>Sign Out</span>
    </Button>
  );
} 