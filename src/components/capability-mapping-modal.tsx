'use client'

import { SearchIcon, XIcon } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'


import { searchSubtypesForAdminFn } from '@/actions/admin/capabilities'
import { updateTechnologyCapabilityMappingsFn } from '@/actions/admin/technologies'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Spinner } from '@/components/ui/spinner'

// ============================================
// Types
// ============================================

export interface CapabilitySubtype {
  id: string
  name: string
  slug: string
  domain: string
}

export interface CapabilityMapping {
  id: string
  capabilitySubtypeId: string
  performanceScore: number | null
  subtype: CapabilitySubtype
  capability?: {
    id: string
    name: string
    slug: string
    icon: string | null
  }
}

interface SelectedMapping {
  capabilitySubtypeId: string
  performanceScore: number
  subtype: CapabilitySubtype
  existingId?: string // ID of existing mapping for updates/deletes
}

// ============================================
// Props
// ============================================

interface CapabilityMappingModalProps {
  technologyId: string
  technologyName: string
  initialMappings: Array<CapabilityMapping>
  open: boolean
  onClose: () => void
  onSave: () => void
}

// ============================================
// Component
// ============================================

export function CapabilityMappingModal({
  technologyId,
  technologyName,
  initialMappings,
  open,
  onClose,
  onSave,
}: CapabilityMappingModalProps) {
  // State
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Array<CapabilitySubtype>>(
    [],
  )
  const [searching, setSearching] = useState(false)
  const [selectedMappings, setSelectedMappings] = useState<
    Array<SelectedMapping>
  >([])
  const [saving, setSaving] = useState(false)

  // Refs
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // ============================================
  // Effects
  // ============================================

  // Load existing mappings when modal opens
  useEffect(() => {
    if (open) {
      // Convert initial mappings to selected mappings format
      const existing = initialMappings.map((m) => ({
        capabilitySubtypeId: m.capabilitySubtypeId,
        performanceScore: m.performanceScore ?? 50,
        subtype: m.subtype,
        existingId: m.id,
      }))
      setSelectedMappings(existing)
    } else {
      setSearchQuery('')
      setSearchResults([])
      setSelectedMappings([])
      setSearching(false)
    }
  }, [open, initialMappings])

  // Debounced search
  useEffect(() => {
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    // Only search if query is at least 2 characters
    if (searchQuery.trim().length >= 2) {
      setSearching(true)
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const result = await searchSubtypesForAdminFn({
            data: {
              query: searchQuery.trim(),
            },
          })
          if (result.success) {
            // Filter out already selected items from search results
            const availableResults = result.data.filter(
              (subtype) =>
                !selectedMappings.some(
                  (m) => m.capabilitySubtypeId === subtype.id,
                ),
            )
            setSearchResults(availableResults)
          }
        } catch (error) {
          console.error('Search error:', error)
          setSearchResults([])
        } finally {
          setSearching(false)
        }
      }, 300)
    } else {
      setSearchResults([])
      setSearching(false)
    }

    // Cleanup
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchQuery, selectedMappings])

  // ============================================
  // Handlers
  // ============================================

  const handleAddMapping = useCallback((subtype: CapabilitySubtype) => {
    setSelectedMappings((prev) => [
      ...prev,
      {
        capabilitySubtypeId: subtype.id,
        performanceScore: 50,
        subtype,
      },
    ])
    setSearchQuery('') // Clear search after adding
    setSearchResults([])
  }, [])

  const handleRemoveMapping = useCallback((subtypeId: string) => {
    setSelectedMappings((prev) =>
      prev.filter((m) => m.capabilitySubtypeId !== subtypeId),
    )
  }, [])

  const handleScoreChange = useCallback((subtypeId: string, score: number) => {
    setSelectedMappings((prev) =>
      prev.map((m) =>
        m.capabilitySubtypeId === subtypeId
          ? { ...m, performanceScore: score }
          : m,
      ),
    )
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const mappings: Array<{
        capabilitySubtypeId: string
        performanceScore: number
      }> = selectedMappings.map((m) => ({
        capabilitySubtypeId: m.capabilitySubtypeId,
        performanceScore: m.performanceScore,
      }))

      const result = await updateTechnologyCapabilityMappingsFn({
        data: {
          technologyId,
          mappings,
        },
      })

      if (result.success) {
        onSave()
      }
    } catch (error) {
      console.error('Save error:', error)
    } finally {
      setSaving(false)
    }
  }

  const isAlreadySelected = (subtypeId: string) =>
    selectedMappings.some((m) => m.capabilitySubtypeId === subtypeId)

  // ============================================
  // Render
  // ============================================

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative bg-background rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col m-4">
        {/* Header */}
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Manage Capability Mappings</h2>
          <p className="text-sm text-muted-foreground">
            Search and select capability subtypes to map to{' '}
            <span className="font-medium text-foreground">
              {technologyName}
            </span>
            .
          </p>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search">Search Capability Subtypes</Label>
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type to search (e.g., 'writing', 'coding', 'design')..."
                className="pl-9"
                autoComplete="off"
              />
              {searching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Spinner className="h-4 w-4" />
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Search by capability name, subtype name, or domain
            </p>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="space-y-2">
              <Label>Search Results</Label>
              <div className="border rounded-md max-h-48 overflow-y-auto">
                {searchResults.map((subtype) => {
                  const alreadySelected = isAlreadySelected(subtype.id)
                  return (
                    <div
                      key={subtype.id}
                      className="p-3 border-b last:border-b-0 hover:bg-muted/50 transition-colors flex items-center justify-between"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {subtype.name}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant={alreadySelected ? 'outline' : 'default'}
                        disabled={alreadySelected}
                        onClick={() => handleAddMapping(subtype)}
                        className="ml-2"
                      >
                        {alreadySelected ? 'Added' : 'Add'}
                      </Button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* No results */}
          {searchQuery.trim().length >= 2 &&
            !searching &&
            searchResults.length === 0 && (
              <div className="text-center py-6 text-sm text-muted-foreground border rounded-md bg-muted/20">
                No capability subtypes found matching "{searchQuery}"
              </div>
            )}

          {/* Selected Mappings */}
          {selectedMappings.length > 0 && (
            <div className="space-y-3">
              <Label>Mapped Capabilities ({selectedMappings.length})</Label>
              <div className="space-y-3 border rounded-md p-3 bg-muted/20">
                {selectedMappings.map((mapping) => (
                  <div
                    key={mapping.capabilitySubtypeId}
                    className="flex items-start gap-3 p-3 rounded-md bg-background"
                  >
                    {/* Remove Button */}
                    <button
                      type="button"
                      onClick={() =>
                        handleRemoveMapping(mapping.capabilitySubtypeId)
                      }
                      className="text-muted-foreground hover:text-destructive transition-colors mt-1"
                      aria-label="Remove mapping"
                    >
                      <XIcon className="w-4 h-4" />
                    </button>

                    {/* Info and Score */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">
                        {mapping.subtype.name}
                      </p>
                      {/* Performance Score */}
                      <div className="flex items-center gap-3 mt-2">
                        <Label
                          htmlFor={`score-${mapping.capabilitySubtypeId}`}
                          className="text-xs whitespace-nowrap"
                        >
                          Score:
                        </Label>
                        <Slider
                          id={`score-${mapping.capabilitySubtypeId}`}
                          value={[mapping.performanceScore]}
                          onValueChange={([v]) =>
                            handleScoreChange(mapping.capabilitySubtypeId, v)
                          }
                          min={0}
                          max={100}
                          step={5}
                          className="flex-1"
                        />
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          value={mapping.performanceScore}
                          onChange={(e) =>
                            handleScoreChange(
                              mapping.capabilitySubtypeId,
                              Math.min(
                                100,
                                Math.max(0, Number(e.target.value) || 0),
                              ),
                            )
                          }
                          className="w-16 h-7 text-xs text-center"
                        />
                        <Badge
                          variant="outline"
                          className="text-xs w-10 justify-center"
                        >
                          {mapping.performanceScore}%
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {selectedMappings.length === 0 && searchResults.length === 0 && (
            <div className="text-center py-8 text-sm text-muted-foreground border rounded-md bg-muted/20">
              <SearchIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No capabilities mapped yet</p>
              <p className="text-xs mt-1">
                Search above to add capability mappings
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t flex gap-2">
          <Button onClick={handleSave} disabled={saving} className="flex-1">
            {saving ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Saving...
              </>
            ) : (
              `Save ${selectedMappings.length} Mapping${selectedMappings.length !== 1 ? 's' : ''}`
            )}
          </Button>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}
