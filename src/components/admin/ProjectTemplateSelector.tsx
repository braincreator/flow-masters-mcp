'use client'

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useNotification } from '@/hooks/useNotification'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Loader2, Calendar, Clock, FileText, Check } from 'lucide-react'
import ProjectTemplateList from './ProjectTemplateList'

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

interface ProjectTemplateSelectorProps {
  projectId: string
  onTemplateApplied?: () => void
}

export default function ProjectTemplateSelector({ projectId, onTemplateApplied }: ProjectTemplateSelectorProps) {
  const t = useTranslations('ProjectTemplates')
  const { showNotification } = useNotification()
  
  const [isOpen, setIsOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null)
  const [isApplying, setIsApplying] = useState(false)
  const [startDate, setStartDate] = useState<Date>(new Date())
  
  // Handle template selection
  const handleSelectTemplate = (template: ProjectTemplate) => {
    setSelectedTemplate(template)
  }
  
  // Apply template to project
  const applyTemplate = async () => {
    if (!selectedTemplate) return
    
    try {
      setIsApplying(true)
      
      const response = await fetch('/api/project-templates/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateId: selectedTemplate.id,
          projectId,
          startDate: startDate.toISOString(),
        }),
      })
      
      const responseData = await response.json()
      
      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to apply template')
      }
      
      if (!responseData.success) {
        throw new Error(responseData.error || 'Failed to apply template')
      }
      
      showNotification('success', t('templateApplied', { defaultValue: 'Template applied successfully' }))
      setIsOpen(false)
      
      if (onTemplateApplied) {
        onTemplateApplied()
      }
    } catch (error) {
      logError('Error applying template:', error)
      showNotification('error', t('errorApplyingTemplate', { defaultValue: 'Error applying template' }))
    } finally {
      setIsApplying(false)
    }
  }
  
  // Get duration text
  const getDurationText = (duration?: { value: number; unit: string }) => {
    if (!duration) return ''
    
    const unit = duration.value === 1
      ? t(`duration.${duration.unit}.singular`, { defaultValue: duration.unit })
      : t(`duration.${duration.unit}.plural`, { defaultValue: `${duration.unit}s` })
    
    return `${duration.value} ${unit}`
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          {t('applyTemplate', { defaultValue: 'Apply Template' })}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('selectProjectTemplate', { defaultValue: 'Select Project Template' })}</DialogTitle>
          <DialogDescription>
            {t('selectTemplateDescription', { defaultValue: 'Choose a template to apply to this project. This will create milestones and tasks based on the template.' })}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue={selectedTemplate ? 'preview' : 'browse'} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="browse">{t('browseTemplates', { defaultValue: 'Browse Templates' })}</TabsTrigger>
            <TabsTrigger value="preview" disabled={!selectedTemplate}>
              {t('templatePreview', { defaultValue: 'Template Preview' })}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="browse" className="py-4">
            <ProjectTemplateList
              onSelectTemplate={handleSelectTemplate}
              selectable={true}
            />
          </TabsContent>
          
          <TabsContent value="preview" className="py-4">
            {selectedTemplate ? (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{selectedTemplate.name}</CardTitle>
                    <CardDescription>{selectedTemplate.description}</CardDescription>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge>{t(`categories.${selectedTemplate.category}`, { defaultValue: selectedTemplate.category })}</Badge>
                      {selectedTemplate.tags?.map((tagObj, index) => (
                        <Badge key={index} variant="outline">{tagObj.tag}</Badge>
                      ))}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{t('milestones', { defaultValue: 'Milestones' })}</p>
                          <p className="text-2xl font-bold">{selectedTemplate.milestones.length}</p>
                        </div>
                      </div>
                      
                      {selectedTemplate.tasks && (
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 mr-2 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{t('tasks', { defaultValue: 'Tasks' })}</p>
                            <p className="text-2xl font-bold">{selectedTemplate.tasks.length}</p>
                          </div>
                        </div>
                      )}
                      
                      {selectedTemplate.estimatedDuration && (
                        <div className="flex items-center">
                          <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{t('duration', { defaultValue: 'Duration' })}</p>
                            <p className="text-2xl font-bold">{getDurationText(selectedTemplate.estimatedDuration)}</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">{t('milestones', { defaultValue: 'Milestones' })}</h3>
                      <div className="space-y-3">
                        {selectedTemplate.milestones
                          .sort((a, b) => a.order - b.order)
                          .map((milestone, index) => (
                            <Card key={index}>
                              <CardContent className="p-4">
                                <div className="flex items-start gap-2">
                                  <Badge className="mt-1">{index + 1}</Badge>
                                  <div>
                                    <h4 className="font-medium">{milestone.title}</h4>
                                    {milestone.description && (
                                      <p className="text-sm text-muted-foreground mt-1">{milestone.description}</p>
                                    )}
                                    <div className="flex items-center mt-2 text-sm">
                                      <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                                      <span>
                                        {getDurationText(milestone.estimatedDuration)}
                                      </span>
                                      
                                      {milestone.requiresClientApproval && (
                                        <Badge variant="outline" className="ml-2">
                                          {t('requiresApproval', { defaultValue: 'Requires Approval' })}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="flex justify-center items-center p-8">
                <p>{t('noTemplateSelected', { defaultValue: 'No template selected' })}</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
          >
            {t('cancel', { defaultValue: 'Cancel' })}
          </Button>
          <Button
            onClick={applyTemplate}
            disabled={!selectedTemplate || isApplying}
          >
            {isApplying ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t('applying', { defaultValue: 'Applying...' })}
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                {t('applyTemplate', { defaultValue: 'Apply Template' })}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
