import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import { getSessionFn } from '@/actions/session'
import { OnboardForm } from '@/components/onboard-form'

export const Route = createFileRoute('/_authed')({
  beforeLoad: async ({ location }) => {
    const session = await getSessionFn()

    if (!session) {
      throw redirect({
        to: '/login',
        search: { redirect: location.href },
      })
    }

    return { session }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { session } = Route.useRouteContext()

  const isOnboardingCompleted = session.user.onboardingCompleted
  return isOnboardingCompleted ? (
    <Outlet />
  ) : (
    <OnboardForm name={session.user.name} />
  )
}
