"use client";

import { Brain, Gift, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface OnboardingWelcomeProps {
  onStart: () => void;
}

export function OnboardingWelcome({ onStart }: OnboardingWelcomeProps) {
  return (
    <div className="w-full max-w-2xl space-y-6">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="bg-primary/10 p-4 rounded-full">
            <Brain className="h-12 w-12 text-primary" />
          </div>
        </div>
        <h1 className="text-3xl font-bold">Welcome to OpenModal!</h1>
        <p className="text-muted-foreground text-lg">
          Help us personalize your experience
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Why complete onboarding?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Track AI's impact on real jobs</h3>
              <p className="text-sm text-muted-foreground">
                We track AI's impact on real jobs and careers
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Your insights help millions</h3>
              <p className="text-sm text-muted-foreground">
                Your insights help millions understand their career safety
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Takes just 2 minutes</h3>
              <p className="text-sm text-muted-foreground">
                Quick and easy to complete
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Gift className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Earn 50 reputation points!</h3>
              <p className="text-sm text-muted-foreground">
                Start your journey with bonus points
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button onClick={onStart} size="lg" className="w-full sm:w-auto">
          Let's Get Started
        </Button>
      </div>

      <div className="text-center text-sm text-muted-foreground">
        Progress: ●○○○ Step 1 of 4
      </div>
    </div>
  );
}
