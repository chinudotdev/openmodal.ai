import {
  createRootRoute,
  HeadContent,
  Link,
  Scripts,
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: "OpenModal.ai - Track AI's Real Impact on Work",
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
      {
        rel: 'icon',
        type: 'image/svg+xml',
        href: '/logo.svg',
      },
    ],
  }),

  shellComponent: RootDocument,
  notFoundComponent: NotFound,
  pendingComponent: GlobalLoading,
})

function GlobalLoading() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center">
      <Spinner className="size-8" />
    </div>
  )
}

function NotFound() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8 text-center">
        <h1 className="text-6xl font-bold text-muted-foreground">404</h1>
        <h2 className="text-2xl font-semibold">Page not found</h2>
        <p className="text-muted-foreground">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <div className="flex justify-center gap-4">
          <Link to="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <TanStackRouterDevtools position="bottom-right" />
        <Scripts />
      </body>
    </html>
  )
}
