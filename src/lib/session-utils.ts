"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";

/**
 * Get session with onboarding status
 * Returns null if no session, otherwise returns session with onboardingCompleted flag
 */
export async function getSessionWithOnboarding() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return null;
  }

  // onboardingCompleted is added to user object via customSession plugin
  const onboardingCompleted =
    (session.user as { onboardingCompleted?: boolean }).onboardingCompleted ??
    false;

  return {
    ...session,
    user: {
      ...session.user,
      onboardingCompleted,
    },
  };
}

/**
 * Check if user has completed onboarding from session
 * Returns null if no session, otherwise returns boolean
 */
export async function checkOnboardingFromSession() {
  const session = await getSessionWithOnboarding();
  if (!session) {
    return null;
  }
  return session.user.onboardingCompleted ?? false;
}
