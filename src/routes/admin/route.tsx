import { Link, Outlet, createFileRoute, redirect } from '@tanstack/react-router'

import { getSessionFn } from '@/actions/session'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/admin')({
  beforeLoad: async ({ location }) => {
    const session = await getSessionFn()

    if (!session) {
      throw redirect({
        to: '/login',
        search: { redirect: location.href },
      })
    }

    if (session.user.role !== 'admin') {
      throw redirect({
        to: '/',
      })
    }

    return { session }
  },
  component: AdminLayout,
})

function AdminLayout() {
  const { session } = Route.useRouteContext()

  return (
    <div className="min-h-svh bg-muted/30">
      {/* Admin Header */}
      <header className="border-b border-border/40 bg-background sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">
                  OM
                </span>
              </div>
              <span className="font-semibold text-lg">OpenModal</span>
            </Link>
            <div className="h-6 w-px bg-border/40" />
            <nav className="flex items-center gap-4">
              <Link
                to="/admin"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Dashboard
              </Link>
              <Link
                to="/admin/capabilities"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Capabilities
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {session.user.name}
            </span>
            <Link to="/">
              <Button variant="outline" size="sm">
                Exit Admin
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Admin Content */}
      <Outlet />
    </div>
  )
}
