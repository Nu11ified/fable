"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";

export default function SignInPage() {
  const handleSignIn = async () => {
    await authClient.signIn.social({
      provider: "github",
      callbackURL: "/admin",
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>
            Sign in to access the admin panel.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleSignIn} className="w-full">
            Sign in with GitHub
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 