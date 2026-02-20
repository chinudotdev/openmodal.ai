import { createFileRoute, useRouter } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'

export const Route = createFileRoute('/_authed/dashboard/')({ component: App })

function App() {
  const { session } = Route.useRouteContext()
  const router = useRouter()

  const handleLogout = async () => {
    await authClient.signOut()
    await router.invalidate()
  }

  return (
    <>
      <div className="min-h-svh w-full flex items-center justify-center p-8">
        <div className="max-w-2xl w-full space-y-8">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold">
                Welcome, {session.user.name}
              </h1>
              <p className="text-muted-foreground">
                We're still building out this platform and actively developing
                the following features. Give us feedback as we continue to grow.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>

          <ul className="space-y-4">
            <li className="flex items-center justify-between py-2 border-b">
              <div>
                <div className="font-medium">Capability</div>
                <div className="text-sm text-muted-foreground">
                  Track what AI can and can't do
                </div>
              </div>
              <div className="flex gap-2">suggestions...TODO</div>
            </li>

            <li className="flex items-center justify-between py-2 border-b">
              <div>
                <div className="font-medium">Jobs</div>
                <div className="text-sm text-muted-foreground">
                  Explore occupations and their automation risk
                </div>
              </div>
              <div className="flex gap-2">suggestions...TODO</div>
            </li>

            <li className="flex items-center justify-between py-2 border-b">
              <div>
                <div className="font-medium">Technologies</div>
                <div className="text-sm text-muted-foreground">
                  Discover specific AI products, models, and robots
                  <span className="text-xs text-muted-foreground/70 ml-1">
                    • User contributions coming soon
                  </span>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Join Waitlist
              </Button>
            </li>

            <li className="flex items-center justify-between py-2 border-b">
              <div>
                <div className="font-medium">Reports</div>
                <div className="text-sm text-muted-foreground">
                  Real-world evidence of AI deployment
                </div>
              </div>
              <div className="flex gap-2">
                {/* <Link to="/dashboard/reports">
                  <Button variant="outline" size="sm">
                    View Reports
                  </Button>
                </Link>*/}
                TODO: reports...
              </div>
            </li>
          </ul>

          <div className="pt-4 space-y-4">
            <h2 className="text-lg font-medium">Help us improve</h2>
            <ul className="space-y-4">
              <li className="flex items-center justify-between py-2 border-b">
                <div>
                  <div className="font-medium">Feedback</div>
                  <div className="text-sm text-muted-foreground">
                    Share your thoughts and suggestions
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Submit
                </Button>
              </li>

              <li className="flex items-center justify-between py-2 border-b">
                <div>
                  <div className="font-medium">Bug Report</div>
                  <div className="text-sm text-muted-foreground">
                    Report issues or unexpected behavior
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Report
                </Button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}
