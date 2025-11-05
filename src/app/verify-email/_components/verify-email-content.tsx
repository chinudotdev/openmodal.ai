"use client";

import { Mail, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      <Link
        href="/"
        className="flex items-center gap-2 self-center font-medium"
      >
        <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
          <Mail className="size-4" />
        </div>
        OpenModal
      </Link>

      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl">Check your email</CardTitle>
          <CardDescription className="text-base">
            We've sent a verification link to
            {email && (
              <>
                <br />
                <span className="font-semibold text-foreground">{email}</span>
              </>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 text-center text-sm text-muted-foreground">
            <p>
              Click the link in the email to verify your account and complete
              your registration.
            </p>
            <p>The verification link will expire in 24 hours.</p>
          </div>

          <div className="border-t pt-4">
            <p className="text-center text-sm text-muted-foreground mb-4">
              Didn't receive the email? Check your spam folder or
            </p>
            <div className="flex flex-col gap-2">
              <Button variant="outline" asChild>
                <Link href="/signup">
                  Try signing up again
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/login">Back to login</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <p className="text-center text-sm text-muted-foreground px-6">
        Need help?{" "}
        <a href="mailto:support@openmodal.ai" className="underline">
          Contact support
        </a>
      </p>
    </div>
  );
}
