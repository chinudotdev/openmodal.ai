import {
  adminClient,
  customSessionClient,
  usernameClient,
} from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'

import { ac, roles } from '@/lib/permissions'

export const authClient = createAuthClient({
  plugins: [
    usernameClient(),
    customSessionClient(),
    adminClient({
      ac,
      roles,
    }),
  ],
})

export const { useSession } = authClient
