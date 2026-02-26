import { useNavigate } from '@tanstack/react-router'
import { useCallback, useMemo, useState } from 'react'

import { getAllCapabilitiesFn } from '@/actions/capabilities'
import { getJobsPaginatedFn } from '@/actions/jobs'
import { getAllOrganizationsFn } from '@/actions/organizations'
import { getAllTechnologiesFn } from '@/actions/technologies'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'

// ============================================
// TYPES
// ============================================

type EntityType =
  | 'capability'
  | 'capability_subtype'
  | 'job'
  | 'technology'
  | 'organization'
  | 'impact_report'

interface EntityOption {
  id: string
  name: string
  slug: string
  type: EntityType
}

const ENTITY_TYPES: Array<{ value: EntityType; label: string; icon: string }> =
  [
    { value: 'capability', label: 'Capabilities', icon: '🏥' },
    { value: 'capability_subtype', label: 'Sub-capabilities', icon: '📋' },
    { value: 'job', label: 'Jobs', icon: '💼' },
    { value: 'technology', label: 'Technologies', icon: '🤖' },
    { value: 'organization', label: 'Organizations', icon: '🏢' },
  ]

// ============================================
// COMPONENT
// ============================================

export function StartDiscussionDialog() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [selectedType, setSelectedType] = useState<EntityType>('capability')
  const [searchQuery, setSearchQuery] = useState('')
  const [entities, setEntities] = useState<Array<EntityOption>>([])
  const [isLoading, setIsLoading] = useState(false)

  // Fetch entities based on selected type
  const fetchEntities = useCallback(async (type: EntityType) => {
    setIsLoading(true)
    try {
      let result: Array<EntityOption> = []

      switch (type) {
        case 'capability': {
          const data = await getAllCapabilitiesFn()
          result = data.map((c) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            type: 'capability' as const,
          }))
          break
        }
        case 'capability_subtype': {
          // Simplified approach: just show a message that subtypes need to be accessed via parent capability
          result = []
          break
        }
        case 'job': {
          const data = await getJobsPaginatedFn({ data: { limit: 100 } })
          result = data.jobs.map((j) => ({
            id: j.id,
            name: j.name,
            slug: j.slug,
            type: 'job' as const,
          }))
          break
        }
        case 'technology': {
          const data = await getAllTechnologiesFn({ data: {} })
          result = data.technologies.map((t) => ({
            id: t.id,
            name: t.name,
            slug: t.slug,
            type: 'technology' as const,
          }))
          break
        }
        case 'organization': {
          const data = await getAllOrganizationsFn({ data: {} })
          result = data.organizations.map((o) => ({
            id: o.id,
            name: o.name,
            slug: o.slug,
            type: 'organization' as const,
          }))
          break
        }
        case 'impact_report':
          result = []
          break
      }

      setEntities(result)
    } catch (error) {
      console.error('Error fetching entities:', error)
      setEntities([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Fetch entities when type changes
  const handleTypeChange = useCallback(
    (type: EntityType) => {
      setSelectedType(type)
      setSearchQuery('')
      fetchEntities(type)
    },
    [fetchEntities],
  )

  // Fetch entities when dialog opens
  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      setOpen(newOpen)
      if (newOpen) {
        fetchEntities(selectedType)
      }
    },
    [selectedType, fetchEntities],
  )

  // Filter entities by search query
  const filteredEntities = useMemo(() => {
    if (!searchQuery.trim()) return entities
    const query = searchQuery.toLowerCase()
    return entities.filter((e) => e.name.toLowerCase().includes(query))
  }, [entities, searchQuery])

  // Handle entity selection - redirect to entity's discussion page
  const handleEntitySelect = useCallback(
    (entity: EntityOption) => {
      setOpen(false)

      let route = ''
      switch (entity.type) {
        case 'capability':
          route = `/capabilities/${entity.slug}/discussion`
          break
        case 'capability_subtype':
          route = `/capabilities/${entity.slug}/discussion`
          break
        case 'job':
          route = `/jobs/${entity.slug}/discussion`
          break
        case 'technology':
          route = `/technologies/${entity.slug}/discussion`
          break
        case 'organization':
          route = `/organizations/${entity.slug}/discussion`
          break
        default:
          return
      }

      navigate({ to: route as any })
    },
    [navigate],
  )

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>Start a Discussion</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Start a Discussion</DialogTitle>
          <DialogDescription>
            Choose an entity type and search for the item you want to discuss.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Entity Type Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Entity Type</label>
            <Select
              value={selectedType}
              onValueChange={(v) => handleTypeChange(v as EntityType)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select entity type" />
              </SelectTrigger>
              <SelectContent>
                {ENTITY_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <span className="flex items-center gap-2">
                      <span>{type.icon}</span>
                      <span>{type.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Search Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Search</label>
            <Input
              placeholder={`Search ${ENTITY_TYPES.find((t) => t.value === selectedType)?.label.toLowerCase()}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>

          {/* Entity List */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {isLoading
                ? 'Loading...'
                : `Results (${filteredEntities.length})`}
            </label>
            <div className="border rounded-lg max-h-64 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Spinner />
                </div>
              ) : filteredEntities.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  {selectedType === 'capability_subtype'
                    ? 'Please select a capability page first to access sub-capabilities'
                    : searchQuery
                      ? 'No results found'
                      : 'Type to search...'}
                </div>
              ) : (
                <div className="divide-y">
                  {filteredEntities.slice(0, 20).map((entity) => (
                    <button
                      key={entity.id}
                      onClick={() => handleEntitySelect(entity)}
                      className="w-full text-left px-4 py-3 hover:bg-muted transition-colors text-sm"
                    >
                      <div className="font-medium">{entity.name}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
