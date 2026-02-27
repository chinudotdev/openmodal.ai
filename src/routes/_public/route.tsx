import { Link, Outlet, createFileRoute } from '@tanstack/react-router'

import { BetaWelcomeModal } from '@/components/beta-welcome-modal'
import { PublicNav } from '@/components/public-nav'
import { Badge } from '@/components/ui/badge'

export const Route = createFileRoute('/_public')({
  component: PublicLayout,
})

function PublicLayout() {
  return (
    <div className="min-h-svh flex flex-col">
      {/* Header */}
      <header className="border-b border-border/40 sticky top-0 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">
                OM
              </span>
            </div>
            <span className="font-semibold text-lg">OpenModal</span>
            <Badge variant="secondary" className="text-xs">
              Beta
            </Badge>
          </Link>

          <PublicNav />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="size-6 rounded-md bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">
                  OM
                </span>
              </div>
              <span className="text-sm text-muted-foreground">OpenModal</span>
              <Badge variant="secondary" className="text-xs">
                Beta
              </Badge>
            </div>
            <nav className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
              <Link
                to="/"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Home
              </Link>
              <Link
                to="/about"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                About
              </Link>
              <a
                href="https://discord.gg/bBsF3MjA9"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Join Us
              </a>
              <Link
                to="/dashboard/feedback"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Report a Bug
              </Link>
              <Link
                to="/privacy"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacy
              </Link>
              <Link
                to="/terms"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Terms
              </Link>
            </nav>
          </div>
          <p className="text-center text-xs text-muted-foreground mt-6">
            OpenModal is a community-driven platform tracking AI&apos;s
            real-world impact. Help us build the most comprehensive database by
            contributing your knowledge.
          </p>
        </div>
      </footer>

      {/* Beta Welcome Modal */}
      <BetaWelcomeModal />
    </div>
  )
}
