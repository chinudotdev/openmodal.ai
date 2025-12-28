"use server";

import { headers } from "next/headers";
import { submitExpertApplication } from "@/actions/expert-application";
import { auth } from "@/lib/auth";

export async function submitExpertApplicationAction(statement: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { success: false, error: "Not authenticated" };
  }

  return submitExpertApplication(session.user.id, statement);
}
