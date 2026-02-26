import { useEffect, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const BETA_STORAGE_KEY = 'openmodal_beta_welcome_seen'

export function BetaWelcomeModal() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    // Check if user has seen the beta welcome
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
          <div className="flex items-center gap-2 mb-2">
            <DialogTitle className="text-2xl">Welcome to OpenModal</DialogTitle>
            <Badge variant="secondary">Beta</Badge>
          </div>
          <DialogDescription className="text-base pt-2">
            <div className="space-y-4">
              <p>
                Thank you for visiting! We're building a community-driven
                platform to track AI's real-world impact on jobs and
                capabilities.
              </p>

              <div className="bg-muted/50 rounded-lg p-4 space-y-3 text-sm">
                <p className="font-medium">
                  <span className="text-yellow-600 dark:text-yellow-400">
                    🚧 Under Construction
                  </span>
                </p>
                <ul className="space-y-2 text-muted-foreground ml-4">
                  <li>
                    • Most capabilities, jobs, and technologies are not yet
                    mapped
                  </li>
                  <li>• Information may be incomplete or inaccurate</li>
                  <li>• We need your help to build this knowledge base</li>
                </ul>
              </div>

              <p className="text-sm">
                If you spot incorrect information, please help us improve by
                contributing accurate data.
              </p>

              <div className="flex items-center justify-center gap-2 pt-2">
                <span className="text-sm text-muted-foreground">
                  Join our community at
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
          </DialogDescription>
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
            I Understand
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
