import { createFileRoute, Link, Outlet } from '@tanstack/react-router'

import { BetaWelcomeModal } from '@/components/beta-welcome-modal'
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
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Beta Welcome Modal */}
      <BetaWelcomeModal />
    </div>
  )
}
