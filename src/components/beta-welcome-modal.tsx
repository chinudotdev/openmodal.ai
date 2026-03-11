import { useEffect, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const BETA_STORAGE_KEY = 'openmodal_beta_welcome_seen'

export function BetaWelcomeModal() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    // Check if user has seen beta welcome
    const hasSeenBeta = localStorage.getItem(BETA_STORAGE_KEY)
    if (!hasSeenBeta) {
      // Small delay to avoid popup blocking
      const timer = setTimeout(() => setOpen(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleClose = () => {
    setOpen(false)
    localStorage.setItem(BETA_STORAGE_KEY, 'true')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-3">
            <DialogTitle className="text-2xl">OpenModal</DialogTitle>
            <Badge variant="secondary">Beta</Badge>
          </div>

          <div className="space-y-4 text-base pt-2">
            <p className="text-muted-foreground">
              We're building the first community-driven observatory for AI's
              real-world impact — tracked through verified evidence from
              workers, not analyst predictions.
            </p>

            <div className="bg-muted/50 rounded-lg p-4 space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-primary font-medium">You're early.</span>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                The customer service vertical is seeded. More industries are
                coming. The data will grow as the community contributes.
              </p>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              Have firsthand experience with AI at work? Your report matters
              more than you know.
            </p>

            <div className="flex items-center gap-2 pt-1">
              <span className="text-sm text-muted-foreground">
                Join our community →
              </span>
              <a
                href="https://discord.gg/bBsF3MjA9"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-primary hover:underline"
              >
                discord.gg/bBsF3MjA9
              </a>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button asChild variant="outline" className="flex-1">
            <a
              href="https://discord.gg/bBsF3MjA9"
              target="_blank"
              rel="noopener noreferrer"
            >
              Join Discord
            </a>
          </Button>
          <Button onClick={handleClose} className="flex-1">
            Start Exploring
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
