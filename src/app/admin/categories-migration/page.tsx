'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

interface Category {
  id: string
  title: string
  slug: string
  categoryType?: string
}

export default function CategoriesMigrationPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategories, setSelectedCategories] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const [selectAll, setSelectAll] = useState<string | null>(null)

  // Category type options
  const categoryTypes = [
    { id: 'product', label: 'Product Category' },
    { id: 'blog', label: 'Blog Category' },
    { id: 'general', label: 'General Category' },
  ]

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/v1/categories')
      if (!response.ok) throw new Error('Failed to fetch categories')
      const data = await response.json()
      setCategories(data.docs)
    } catch (error) {
      console.error('Error fetching categories:', error)
      setResult({
        success: false,
        message: 'Failed to load categories. Please try again.',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSelectType = (categoryId: string, type: string) => {
    setSelectedCategories((prev) => ({
      ...prev,
      [categoryId]: type,
    }))
  }

  const handleSelectAllChange = (type: string) => {
    // If "none" is selected, clear the selectAll state
    if (type === 'none') {
      setSelectAll(null)
      return
    }

    setSelectAll(type)

    // Apply to all categories that don't already have a type
    const updatedSelections = { ...selectedCategories }
    categories.forEach((category) => {
      if (!category.categoryType) {
        updatedSelections[category.id] = type
      }
    })

    setSelectedCategories(updatedSelections)
  }

  const saveChanges = async () => {
    if (Object.keys(selectedCategories).length === 0) {
      setResult({
        success: false,
        message: 'Please select at least one category to update.',
      })
      return
    }

    setSaving(true)
    setResult(null)

    try {
      // Call the real API endpoint
      const response = await fetch('/api/admin/update-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categories: selectedCategories }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update categories')
      }

      setResult({
        success: true,
        message:
          data.message ||
          `Successfully updated ${Object.keys(selectedCategories).length} categories.`,
      })

      // Refresh the categories list
      await fetchCategories()

      // Clear selections
      setSelectedCategories({})
      setSelectAll(null)
    } catch (error) {
      console.error('Error updating categories:', error)
      setResult({
        success: false,
        message: error.message || 'Failed to update categories. Please try again.',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="container py-10">
      <Card>
        <CardHeader>
          <CardTitle>Category Type Migration</CardTitle>
          <CardDescription>
            Assign category types to existing categories to use them with the new typed category
            system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {result && (
            <Alert
              className={`mb-6 ${result.success ? 'bg-green-50 text-green-800 border-green-100' : 'bg-red-50 text-red-800 border-red-100'}`}
            >
              {result.success ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertTitle>{result.success ? 'Success' : 'Error'}</AlertTitle>
              <AlertDescription>{result.message}</AlertDescription>
            </Alert>
          )}

          <div className="mb-6">
            <Label>Select type for all unassigned categories:</Label>
            <Select value={selectAll || 'none'} onValueChange={handleSelectAllChange}>
              <SelectTrigger className="w-[200px] mt-2">
                <SelectValue placeholder="Select type..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {categoryTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Current Type</TableHead>
                  <TableHead>New Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-10">
                      Loading categories...
                    </TableCell>
                  </TableRow>
                ) : categories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-10">
                      No categories found.
                    </TableCell>
                  </TableRow>
                ) : (
                  categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">{category.title}</TableCell>
                      <TableCell>{category.slug}</TableCell>
                      <TableCell>
                        {category.categoryType || (
                          <span className="text-gray-400 italic">None</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={selectedCategories[category.id] || 'select-type'}
                          onValueChange={(value) => handleSelectType(category.id, value)}
                          disabled={!!category.categoryType}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select type..." />
                          </SelectTrigger>
                          <SelectContent>
                            {categoryTypes.map((type) => (
                              <SelectItem key={type.id} value={type.id}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => {
              setSelectedCategories({})
              setSelectAll(null)
              setResult(null)
            }}
          >
            Reset
          </Button>
          <Button
            onClick={saveChanges}
            disabled={saving || Object.keys(selectedCategories).length === 0}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
