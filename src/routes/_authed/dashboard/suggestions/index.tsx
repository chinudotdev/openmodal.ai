import { createFileRoute } from '@tanstack/react-router'

import { SuggestionForm } from '@/components/suggestion-form'

const searchSchema = {
  type: 'job' as const,
  mode: 'new' as const,
  name: '',
  id: '',
}

export const Route = createFileRoute('/_authed/dashboard/suggestions/')({
  component: SuggestionPage,
  validateSearch: (
    search: Record<string, unknown>,
  ): {
    type: 'job' | 'capability'
    mode: 'new' | 'existing'
    name: string
    id: string
  } => {
    return {
      type:
        typeof search.type === 'string' &&
        (search.type === 'job' || search.type === 'capability')
          ? search.type
          : searchSchema.type,
      mode:
        typeof search.mode === 'string' &&
        (search.mode === 'new' || search.mode === 'existing')
          ? search.mode
          : searchSchema.mode,
      name: typeof search.name === 'string' ? search.name : searchSchema.name,
      id: typeof search.id === 'string' ? search.id : searchSchema.id,
    }
  },
})

function SuggestionPage() {
  const search = Route.useSearch()

  return (
    <SuggestionForm
      defaultType={search.type}
      defaultMode={search.mode}
      defaultName={search.name}
      defaultExistingId={search.id}
      className="min-h-svh"
    />
  )
}
