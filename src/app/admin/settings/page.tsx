import { Suspense } from "react";
import { EmailSettings } from "./_components/email-settings";
import { GamificationSettings } from "./_components/gamification-settings";
import { GeneralSettings } from "./_components/general-settings";
import { ModerationSettings } from "./_components/moderation-settings";
import { RoleRequirements } from "./_components/role-requirements";
import { Spinner } from "@/components/ui/spinner";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Platform Settings</h1>
        <p className="text-muted-foreground mt-1">
          Configure platform-wide settings and requirements
        </p>
      </div>
      <Suspense
        fallback={
          <div className="flex items-center justify-center p-12">
            <Spinner className="h-8 w-8" />
          </div>
        }
      >
        <GeneralSettings />
        <RoleRequirements />
        <GamificationSettings />
        <ModerationSettings />
        <EmailSettings />
      </Suspense>
    </div>
  );
}
