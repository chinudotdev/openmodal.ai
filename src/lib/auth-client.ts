import {
  customSessionClient,
  usernameClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import type { auth } from "@/lib/auth";
import { adminClient } from "better-auth/client/plugins";
import { ac, roles } from "@/lib/permissions";

export const authClient = createAuthClient({
  plugins: [
    usernameClient(),
    customSessionClient<typeof auth>(),
    adminClient({
      ac,
      roles,
    }),
  ],
});
