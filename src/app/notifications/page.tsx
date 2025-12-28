import { Suspense } from "react";
import { NotificationCenter } from "@/components/notifications/notification-center";
import { Spinner } from "@/components/ui/spinner";

export default function NotificationsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Suspense fallback={<Spinner className="h-8 w-8" />}>
        <NotificationCenter />
      </Suspense>
    </div>
  );
}
