import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/hello')({
  server: {
    handlers: {
      GET: () => {
        return new Response('Hello, World!')
      },
    },
  },
})
