'use client'

import {
  SelectContent,
  SelectItem,
  Select as SelectPrimitive,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// ============================================
// TYPES
// ============================================

export interface SelectOption {
  value: string
  label: string
}

export interface SelectWrapperProps {
  id?: string
  value: string | undefined
  onChange: (value: string) => void
  options: Array<SelectOption>
  disabled?: boolean
}

// ============================================
// COMPONENT
// ============================================

export function SelectWrapper({
  id,
  value,
  onChange,
  options,
  disabled = false,
}: SelectWrapperProps) {
  // Find the placeholder option (empty value) for display
  const placeholderOption = options.find((opt) => opt.value === '')
  const displayPlaceholder = placeholderOption?.label || 'Select an option'

  // Filter out empty value options for SelectItem (Radix doesn't allow empty strings)
  const validOptions = options.filter((opt) => opt.value !== '')

  return (
    <SelectPrimitive
      value={value || ''}
      onValueChange={onChange}
      disabled={disabled}
    >
      <SelectTrigger id={id} className="w-full">
        <SelectValue placeholder={displayPlaceholder} />
      </SelectTrigger>
      <SelectContent>
        {validOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </SelectPrimitive>
  )
}
