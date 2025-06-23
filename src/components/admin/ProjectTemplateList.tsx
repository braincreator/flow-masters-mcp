'use client'

import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useNotification } from '@/hooks/useNotification'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Loader2, Plus, Search, Filter, Tag, Clock, FileText, Calendar } from 'lucide-react'
import Link from 'next/link'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
interface ProjectTemplate {
  id: string
  name: string
  description?: string
  category: string
  tags?: { tag: string }[]
  estimatedDuration?: {
    value: number
    unit: string
  }
  milestones: any[]
  tasks?: any[]
  isActive: boolean
  version: number
  createdAt: string
  updatedAt: string
}

interface ProjectTemplateListProps {
  onSelectTemplate?: (template: ProjectTemplate) => void
  onCreateTemplate?: () => void
  selectable?: boolean
}

export default function ProjectTemplateList({
  onSelectTemplate,
  onCreateTemplate,
  selectable = false,
}: ProjectTemplateListProps) {
  const t = useTranslations('ProjectTemplates')
  const { showNotification } = useNotification()
  
  const [templates, setTemplates] = useState<ProjectTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [showActiveOnly, setShowActiveOnly] = useState(true)
  
  // Fetch templates
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setIsLoading(true)
        const queryParams = new URLSearchParams({
          ...(searchQuery && { search: searchQuery }),
          ...(categoryFilter !== 'all' && { category: categoryFilter }),
          ...(showActiveOnly && { isActive: 'true' }),
        })
        
        const response = await fetch(`/api/project-templates?${queryParams}`)
        const responseData = await response.json()
        
        if (!response.ok) {
          throw new Error(responseData.error || 'Failed to fetch project templates')
        }
        
        if (!responseData.success) {
          throw new Error(responseData.error || 'Failed to fetch project templates')
        }
        
        setTemplates(responseData.data)
      } catch (error) {
        logError('Error fetching project templates:', error)
        showNotification('error', t('errorFetchingTemplates', { defaultValue: 'Error fetching project templates' }))
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchTemplates()
  }, [searchQuery, categoryFilter, showActiveOnly, showNotification, t])
  
  // Get category label
  const getCategoryLabel = (category: string) => {
    return t(`categories.${category}`, { defaultValue: category })
  }
  
  // Get duration text
  const getDurationText = (duration?: { value: number; unit: string }) => {
    if (!duration) return ''
    
    const unit = duration.value === 1
      ? t(`duration.${duration.unit}.singular`, { defaultValue: duration.unit })
      : t(`duration.${duration.unit}.plural`, { defaultValue: `${duration.unit}s` })
    
    return `${duration.value} ${unit}`
  }
  
  // Handle template selection
  const handleSelectTemplate = (template: ProjectTemplate) => {
    if (onSelectTemplate) {
      onSelectTemplate(template)
    }
  }
  
  // Handle template creation
  const handleCreateTemplate = () => {
    if (onCreateTemplate) {
      onCreateTemplate()
    }
  }
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('searchTemplates', { defaultValue: 'Search templates...' })}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Select
            value={categoryFilter}
            onValueChange={setCategoryFilter}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder={t('filterByCategory', { defaultValue: 'Filter by category' })} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allCategories', { defaultValue: 'All categories' })}</SelectItem>
              <SelectItem value="ai_development">{t('categories.ai_development', { defaultValue: 'AI Development' })}</SelectItem>
              <SelectItem value="machine_learning">{t('categories.machine_learning', { defaultValue: 'Machine Learning' })}</SelectItem>
              <SelectItem value="data_analysis">{t('categories.data_analysis', { defaultValue: 'Data Analysis' })}</SelectItem>
              <SelectItem value="chatbot">{t('categories.chatbot', { defaultValue: 'Chatbot' })}</SelectItem>
              <SelectItem value="integration">{t('categories.integration', { defaultValue: 'Integration' })}</SelectItem>
              <SelectItem value="custom">{t('categories.custom', { defaultValue: 'Custom' })}</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="showActiveOnly"
              checked={showActiveOnly}
              onCheckedChange={(checked) => setShowActiveOnly(checked as boolean)}
            />
            <Label htmlFor="showActiveOnly">
              {t('activeOnly', { defaultValue: 'Active only' })}
            </Label>
          </div>
          
          <Button
            onClick={handleCreateTemplate}
            size="sm"
            className="ml-auto"
          >
            <Plus className="h-4 w-4 mr-1" />
            {t('createTemplate', { defaultValue: 'Create Template' })}
          </Button>
        </div>
      </div>
      
      {templates.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <div className="space-y-3">
              <FileText className="h-8 w-8 mx-auto text-muted-foreground" />
              <h3 className="text-lg font-medium">{t('noTemplatesFound', { defaultValue: 'No templates found' })}</h3>
              <p className="text-sm text-muted-foreground">
                {t('createFirstTemplate', { defaultValue: 'Create your first project template to get started.' })}
              </p>
              <Button
                onClick={handleCreateTemplate}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-1" />
                {t('createTemplate', { defaultValue: 'Create Template' })}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <Card 
              key={template.id}
              className={`overflow-hidden ${selectable ? 'cursor-pointer hover:border-primary transition-colors' : ''}`}
              onClick={selectable ? () => handleSelectTemplate(template) : undefined}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <Badge variant={template.isActive ? 'default' : 'secondary'}>
                    {template.isActive 
                      ? t('active', { defaultValue: 'Active' }) 
                      : t('inactive', { defaultValue: 'Inactive' })}
                  </Badge>
                  <Badge variant="outline">v{template.version}</Badge>
                </div>
                <CardTitle className="text-xl mt-2">{template.name}</CardTitle>
                <Badge variant="outline" className="mt-1">
                  {getCategoryLabel(template.category)}
                </Badge>
              </CardHeader>
              <CardContent>
                {template.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {template.description}
                  </p>
                )}
                
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>
                      {t('milestones', { count: template.milestones.length, defaultValue: '{{count}} milestones' })}
                    </span>
                  </div>
                  
                  {template.tasks && template.tasks.length > 0 && (
                    <div className="flex items-center text-sm">
                      <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>
                        {t('tasks', { count: template.tasks.length, defaultValue: '{{count}} tasks' })}
                      </span>
                    </div>
                  )}
                  
                  {template.estimatedDuration && (
                    <div className="flex items-center text-sm">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{getDurationText(template.estimatedDuration)}</span>
                    </div>
                  )}
                  
                  {template.tags && template.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {template.tags.slice(0, 3).map((tagObj, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tagObj.tag}
                        </Badge>
                      ))}
                      {template.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{template.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                {!selectable && (
                  <div className="flex justify-between w-full">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <Link href={`/admin/project-templates/${template.id}`}>
                        {t('view', { defaultValue: 'View' })}
                      </Link>
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      asChild
                    >
                      <Link href={`/admin/project-templates/${template.id}/edit`}>
                        {t('edit', { defaultValue: 'Edit' })}
                      </Link>
                    </Button>
                  </div>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
