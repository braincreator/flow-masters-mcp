'use client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import React, { useState, useEffect } from 'react'
import { useDebounce } from '@/utilities/useDebounce'
import { useRouter } from 'next/navigation'
import { SearchIcon } from 'lucide-react'

export const Search: React.FC = () => {
  const [value, setValue] = useState('')
  const router = useRouter()

  const debouncedValue = useDebounce(value)

  useEffect(() => {
    router.push(`/search${debouncedValue ? `?q=${debouncedValue}` : ''}`)
  }, [debouncedValue, router])

  return (
    <div className="relative max-w-2xl mx-auto">
      <form
        onSubmit={(e) => {
          e.preventDefault()
        }}
        className="relative group"
      >
        <Label htmlFor="search" className="sr-only">
          Search
        </Label>
        <Input
          id="search"
          onChange={(event) => {
            setValue(event.target.value)
          }}
          placeholder="Search"
          className="pl-12 pr-4 h-12 bg-background/50 backdrop-blur-sm
            border-2 border-border/50 hover:border-primary/30 focus:border-primary/50
            transition-all duration-300
            shadow-lg shadow-primary/5 hover:shadow-primary/10
            rounded-2xl"
        />
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 
          text-muted-foreground group-hover:text-foreground
          transition-colors duration-300" />
        <button type="submit" className="sr-only">
          submit
        </button>
      </form>
    </div>
  )
}
