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
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {link.label}
          </Link>
        ))}
        <Link to="/login">
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
        <nav className="flex flex-col gap-4 mt-8">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-lg text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link to="/login" onClick={() => setOpen(false)}>
            <Button size="sm" className="w-full">
              Contribute
            </Button>
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  )
}
