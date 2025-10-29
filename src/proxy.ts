import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { headers } from "next/headers";
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
      new URL("/login?callbackURL=" + callbackPath + queryParams, request.url)
    );
  }
  return NextResponse.next();
}
export const config = {
  matcher: ["/dashboard", "/contribute"], // Apply middleware to specific routes
};
