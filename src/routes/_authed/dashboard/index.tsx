import { Link, createFileRoute, useRouter } from '@tanstack/react-router'
import { useState } from 'react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'

export const Route = createFileRoute('/_authed/dashboard/')({ component: App })

function App() {
  const { session } = Route.useRouteContext()
  const router = useRouter()
  const [logoutOpen, setLogoutOpen] = useState(false)

  const handleLogout = async () => {
    await authClient.signOut()
    await router.invalidate()
    setLogoutOpen(false)
  }

  return (
    <>
      <div className="min-h-svh w-full flex items-center justify-center p-8">
        <div className="max-w-2xl w-full space-y-8">
          <Link
            to="/"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4 mr-1"
            >
              <path d="m12 19-7-7 7-7" />
              <path d="M19 12H5" />
            </svg>
            Back to Home
          </Link>
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
            <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  Logout
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to log out? You'll need to sign in
                    again to access your account.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleLogout}>
                    Logout
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <ul className="space-y-4">
            <li className="flex items-center justify-between py-2 border-b">
              <div>
                <div className="font-medium">Capability</div>
                <div className="text-sm text-muted-foreground">
                  Track what AI can and can't do
                </div>
              </div>
              <Link
                to="/dashboard/suggestions"
                search={{ type: 'capability', mode: 'new', name: '', id: '' }}
              >
                <Button variant="outline" size="sm">
                  Suggest New
                </Button>
              </Link>
            </li>

            <li className="flex items-center justify-between py-2 border-b">
              <div>
                <div className="font-medium">Jobs</div>
                <div className="text-sm text-muted-foreground">
                  Explore occupations and their automation risk
                </div>
              </div>
              <Link
                to="/dashboard/suggestions"
                search={{ type: 'job', mode: 'new', name: '', id: '' }}
              >
                <Button variant="outline" size="sm">
                  Suggest New
                </Button>
              </Link>
            </li>

            <li className="flex items-center justify-between py-2 border-b">
              <div>
                <div className="font-medium">Technologies</div>
                <div className="text-sm text-muted-foreground">
                  Discover specific AI products, models, and robots
                </div>
              </div>
              <Link
                to="/dashboard/suggestions"
                search={{ type: 'technology', mode: 'new', name: '', id: '' }}
              >
                <Button variant="outline" size="sm">
                  Suggest New
                </Button>
              </Link>
            </li>

            <li className="flex items-center justify-between py-2 border-b">
              <div>
                <div className="font-medium">Impact Reports</div>
                <div className="text-sm text-muted-foreground">
                  Real-world evidence of AI's impact on jobs
                </div>
              </div>
              <div className="flex gap-2">
                <Link to="/dashboard/reports">
                  <Button variant="outline" size="sm">
                    View My Reports
                  </Button>
                </Link>
                <Link to="/dashboard/reports/submit">
                  <Button variant="outline" size="sm">
                    Submit
                  </Button>
                </Link>
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
                <Link to="/dashboard/feedback">
                  <Button variant="outline" size="sm">
                    Submit
                  </Button>
                </Link>
              </li>

              <li className="flex items-center justify-between py-2 border-b">
                <div>
                  <div className="font-medium">Bug Report</div>
                  <div className="text-sm text-muted-foreground">
                    Report issues or unexpected behavior
                  </div>
                </div>
                <Link to="/dashboard/feedback">
                  <Button variant="outline" size="sm">
                    Report
                  </Button>
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}
