import { headers } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    // with query params
    const callbackPath = request.nextUrl.pathname;
    const queryParams = request.nextUrl.search;
    return NextResponse.redirect(
      new URL(`/login?callbackURL=${callbackPath}${queryParams}`, request.url),
    );
  }

  // Check onboarding completion from session - allow access to /onboarding itself
  const pathname = request.nextUrl.pathname;
  if (pathname !== "/onboarding") {
    // onboardingCompleted is added to user object via customSession plugin
    const onboardingCompleted =
      (session.user as { onboardingCompleted?: boolean }).onboardingCompleted ??
      false;
    if (!onboardingCompleted) {
      // Redirect to onboarding if not completed (preserve original path as callback)
      const callbackPath = request.nextUrl.pathname;
      const queryParams = request.nextUrl.search;
      return NextResponse.redirect(
        new URL(
          `/onboarding?callbackURL=${callbackPath}${queryParams}`,
          request.url,
        ),
      );
    }
  }

  return NextResponse.next();
}
export const config = {
  matcher: ["/dashboard", "/contribute", "/onboarding"], // Apply middleware to specific routes
};
