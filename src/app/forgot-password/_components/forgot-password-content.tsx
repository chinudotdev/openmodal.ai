"use client";

import { KeyRound, ArrowLeft } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function ForgotPasswordContent() {
  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      <Link
        href="/"
        className="flex items-center gap-2 self-center font-medium"
      >
        <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
          <KeyRound className="size-4" />
        </div>
        OpenModal
      </Link>

      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <KeyRound className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl">Forgot your password?</CardTitle>
          <CardDescription className="text-base">
            Use &apos;Continue with Google&apos; instead
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground">
              We recommend using social login for a seamless experience.
            </p>

            <Button variant="outline" className="w-full" asChild>
              <Link href="/login">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  aria-label="Google logo"
                  className="mr-2 h-4 w-4"
                >
                  <title>Google logo</title>
                  <path
                    d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                    fill="currentColor"
                  />
                </svg>
                Continue with Google
              </Link>
            </Button>
          </div>

          <div className="border-t pt-4">
            <p className="text-center text-sm text-muted-foreground mb-4">
              Need additional help? Contact me at
            </p>
            <Button variant="outline" className="w-full" asChild>
              <a href="mailto:chinudotdev@gmail.com">chinudotdev@gmail.com</a>
            </Button>
          </div>

          <Button variant="ghost" className="w-full" asChild>
            <Link href="/login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to login
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
