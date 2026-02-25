import { Link } from '@tanstack/react-router'

import { Menu } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useMediaQuery } from '@/hooks/use-media-query'

const navLinks = [
  { to: '/capabilities', label: 'Capabilities' },
  { to: '/jobs', label: 'Jobs' },
  { to: '/technologies', label: 'Technologies' },
  { to: '/discussions', label: 'Discussions' },
  { to: '/reports', label: 'Reports' },
]

export function PublicNav() {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const [open, setOpen] = useState(false)

  if (isDesktop) {
    return (
      <nav className="flex items-center gap-6">
        {navLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            search={
              link.to === '/discussions'
                ? {
                    entityType: undefined,
                    search: undefined,
                    sort: 'recent',
                    timeRange: undefined,
                    page: 1,
                  }
                : undefined
            }
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {link.label}
          </Link>
        ))}
        <Link to="/dashboard">
          <Button size="sm">Contribute</Button>
        </Link>
      </nav>
    )
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right">
        <nav className="flex flex-col gap-4 mt-8 px-2">
          {navLinks.map((link) => (
            <Button
              key={link.to}
              asChild
              variant="ghost"
              className="justify-start text-lg"
              onClick={() => setOpen(false)}
            >
              <Link
                to={link.to}
                search={
                  link.to === '/discussions'
                    ? {
                        entityType: undefined,
                        search: undefined,
                        sort: 'recent',
                        timeRange: undefined,
                        page: 1,
                      }
                    : undefined
                }
              >
                {link.label}
              </Link>
            </Button>
          ))}
          <Button asChild onClick={() => setOpen(false)} className="pt-2">
            <Link to="/dashboard">Contribute</Link>
          </Button>
        </nav>
      </SheetContent>
    </Sheet>
  )
}
