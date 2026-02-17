import { createFileRoute, redirect } from '@tanstack/react-router'
import { z } from 'zod'
import { VerifyEmailContent } from '@/components/verify-email'

export const Route = createFileRoute('/verify-email')({
  component: RouteComponent,
  validateSearch: z.object({
    email: z.email().optional(),
  }),
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) => {
    if (!deps.email) {
      throw redirect({
        to: '/signup',
      })
    }
    return {
      email: deps.email,
    }
  },
})

function RouteComponent() {
  const { email } = Route.useLoaderData()
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <VerifyEmailContent email={email} />
      </div>
    </div>
  )
}
