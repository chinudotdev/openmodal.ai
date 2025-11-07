"use client";

import {
  ArrowRight,
  BarChart3,
  Briefcase,
  CheckCircle,
  Cpu,
  Gift,
  MapPin,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface OnboardingCompletionProps {
  pointsAwarded: number;
  tier: string;
}

export function OnboardingCompletion({
  pointsAwarded,
  tier,
}: OnboardingCompletionProps) {
  const router = useRouter();

  const tierLabels: Record<string, string> = {
    observer: "Observer",
    contributor: "Contributor",
    trusted: "Trusted",
    expert: "Expert",
  };

  const quickLinks = [
    {
      href: "/jobs",
      label: "Explore Jobs",
      description: "Browse jobs and track automation risk",
      icon: Briefcase,
    },
    {
      href: "/capabilities",
      label: "AI Capabilities",
      description: "See what AI can and can't do",
      icon: Cpu,
    },
    {
      href: "/dashboard",
      label: "Your Dashboard",
      description: "View your profile and activity",
      icon: BarChart3,
    },
    {
      href: "/reports",
      label: "Submit Reports",
      description: "Share automation sightings",
      icon: MapPin,
    },
  ];

  return (
    <div className="w-full max-w-3xl space-y-6">
      {/* Success Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="bg-green-500/10 p-4 rounded-full animate-in zoom-in duration-500">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
        </div>
        <h1 className="text-4xl font-bold">Welcome to OpenModal!</h1>
        <p className="text-muted-foreground text-lg">
          Your onboarding is complete. You're all set to explore the future of
          work.
        </p>
      </div>

      {/* Accomplishments Card */}
      <Card className="border-green-500/20">
        <CardHeader>
          <CardTitle>What you've accomplished</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="bg-primary/10 p-2 rounded-lg">
              <CheckCircle className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Profile completed</h3>
              <p className="text-sm text-muted-foreground">
                Your profile has been set up successfully
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="bg-yellow-500/10 p-2 rounded-lg">
              <Gift className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <h3 className="font-semibold">
                +{pointsAwarded} reputation points earned!
              </h3>
              <p className="text-sm text-muted-foreground">
                You've started your journey with bonus points
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="bg-purple-500/10 p-2 rounded-lg">
              <Trophy className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <h3 className="font-semibold">
                {tierLabels[tier] || "Observer"} tier unlocked
              </h3>
              <p className="text-sm text-muted-foreground">
                You can now track jobs, submit reports, and verify community
                reports
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group flex items-start gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="bg-primary/10 p-2 rounded-lg group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold group-hover:text-primary transition-colors">
                      {link.label}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {link.description}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4 pt-4">
        <Button
          variant="outline"
          onClick={() => router.push("/jobs")}
          className="flex-1"
        >
          Explore Jobs
        </Button>
        <Button onClick={() => router.push("/dashboard")} className="flex-1">
          Go to Dashboard
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
